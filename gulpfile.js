var browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  concat = require('gulp-concat'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  minifyCss = require('gulp-minify-css'),
  ngAnnotate = require('gulp-ng-annotate'),
  notifier = require('node-notifier'),
  plumber = require('gulp-plumber'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  bower = require('bower'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  sh = require('shelljs'),
  watchify = require('watchify');

var paths = {
  sass: ['./scss/**/*.scss'],
  src: './www/js/**/*.js',         // Source path
  dist: './www/js/dist/'   // Distribution path
};

gulp.task('default', ['sass', 'browserify']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});
var bundler = browserify({
  entries: './www/js/app.js', // Only need initial file, browserify finds the deps
  debug: true // Gives us sourcemapping
});

gulp.task('browserify', function () {
  bundle();
  bundler.on('update', bundle);

  bundler.on('time', function (time) {
    gutil.log('Browserify', 'rebundling took ', gutil.colors.cyan(time + ' ms'));
  });
});
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
function bundle() {
  return bundler.bundle()
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(source('app.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dist));
}

function bundleProd() {
  return bundler.bundle()
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(ngAnnotate())
    .pipe(uglify({mangle: false}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dist));
}

function errorHandler(err) {
  notifier.notify({message: 'Error: ' + err.message});
  gutil.log(gutil.colors.red('Error: ' + err.message));
}
