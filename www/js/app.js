// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('uideck', ['ionic', 'uideck.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html'
    })

    .state('app.article', {
      url: '/article',
      views: {
        'menuContent': {
          templateUrl: 'templates/article.html'
        }
      }
    })
    
    .state('app.articlelist', {
      url: '/article-list',
      views: {
        'menuContent': {
          templateUrl: 'templates/articles-list.html'
        }
      }
    })

    .state('app.chat', {
      url: '/chat',
      views: {
        'menuContent': {
          templateUrl: 'templates/chat.html'
        }
      }
    })
   
    .state('app.contactlist', {
      url: '/contact-list',
      views: {
        'menuContent': {
          templateUrl: 'templates/contact-list.html'
        }
      }
    })
    
    .state('app.photogrid', {
      url: '/photo-grid',
      views: {
        'menuContent': {
          templateUrl: 'templates/photo-grid.html'
        }
      }
    })
    
    .state('app.photolist', {
      url: '/photo-list',
      views: {
        'menuContent': {
          templateUrl: 'templates/photo-list.html'
        }
      }
    })
    
    .state('app.product', {
      url: '/product',
      views: {
        'menuContent': {
          templateUrl: 'templates/product.html'
        }
      }
    })

    .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html'
        }
      }
    }) 
    
    .state('app.searchgrid', {
      url: '/search-grid',
      views: {
        'menuContent': {
          templateUrl: 'templates/search-grid.html'
        }
      }
    })     
   
    .state('app.searchlist', {
      url: '/search-list',
      views: {
        'menuContent': {
          templateUrl: 'templates/search-list.html'
        }
      }
    })
   
    .state('app.shoplist', {
      url: '/shop-list',
      views: {
        'menuContent': {
          templateUrl: 'templates/shop-list.html'
        }
      }
    })
   
    .state('app.signin', {
      url: '/sign-in',
      views: {
        'menuContent': {
          templateUrl: 'templates/sign-in.html'
        }
      }
    }) 
   
    .state('app.todolist', {
      url: '/todo-list',
      views: {
        'menuContent': {
          templateUrl: 'templates/todo-list.html'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/article');
});
