// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
//var angular = require('angular');
'use strict';

//var angular = require('angular');
//window.angular = angular;
//require('ionic');
//require('ng-cordova');
//require('ngRoute');
window.underscore = require('underscore');
window._ = require('lodash');
window.io = require('socket.io-client');
window.moment = require('moment');
window.humanizeDuration = require('humanize-duration');
require('angular-socket-io');
require('moment-range');
require('angular-timer');
var app = angular.module('bookd', [
  'ionic',
  'ngCordovaOauth',
  'ionic-datepicker',
  'btford.socket-io',
  'timer',
  'angular-timeline'

]);

require('./services');
require('./controllers');

require('./filters');
//window._ = require('underscore');

app.run(function ($ionicPlatform, $rootScope, auth, CLOUDINARY_Default, CLOUDINARY_BASE, facebookApi) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.cordova && window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  if (auth.getUser()) {
    $rootScope.currentUser = auth.currentUser();
  }
  $rootScope.cloudinaryDefaultPic = CLOUDINARY_Default;
  $rootScope.cloudinaryBaseUrl = CLOUDINARY_BASE;
  $rootScope.facebookApi = facebookApi;
  $rootScope.logOut = function () {
    auth.logOut();

  }
});

app.constant('CLOUDINARY_BASE', 'https://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_300,w_300/v');
app.constant('CLOUDINARY_Default', 'https://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_300,w_300/v1432411957/profile/placeholder.jpg');
app.constant('localDevHost', 'localhost');
app.constant('devHost', 'dev.bookd.me');
app.constant('devPort', '8112');
app.constant('facebookApi', 'https://graph.facebook.com/');
app.constant('googleApi', 'https://www.googleapis.com/plus/v1/people/');
app.constant('remoteHost', 'https://dev.bookd.me'); // https://dev.bookd.me https://bookd.me http://localhost:3002
app.constant('remoteSocketPort', ':8112'); //DEV: :8112 LOCAL:  :3001
app.config(function ($stateProvider, $urlRouterProvider, ionicDatePickerProvider, $ionicConfigProvider) {
  //$ionicConfigProvider.views.transition('none');
  //var datePickerObj = {
  //  inputDate: new Date(),
  //  setLabel: 'Set',
  //  todayLabel: 'Today',
  //  closeLabel: 'Close',
  //  mondayFirst: false,
  //  weeksList: ["S", "M", "T", "W", "T", "F", "S"],
  //  monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
  //  templateType: 'popup',
  //  from: new Date(),
  //  showTodayButton: true,
  //  dateFormat: 'dd MMMM yyyy',
  //  closeOnSelect: true
  //  //disableWeekdays: [6]
  //};
  //ionicDatePickerProvider.configDatePicker(datePickerObj);
    $stateProvider
      .state('auth', {
        url: '/auth',
        templateUrl: 'templates/auth.html',
        controller: 'AuthCtrl'
      })
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html'
      })
      .state('app.profile', {
        url: '/user/:id/profile',
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'profileCtrl'
          }
        }
      })
      .state('app.searchlist', {
        url: '/search-list',
        views: {
          'menuContent': {
            templateUrl: 'templates/search-list.html',
            controller: 'SearchCtrl',
            controllerAs: 'vm'
          }
        }
      })
      .state('app.business', {
        url: '/business/:businessid',
        views: {
          'menuContent': {
            templateUrl: 'templates/business.html',
            controller: 'businessCtrl'
          }
        },
        resolve: {
          business: ['$stateParams', 'businessFactory', function ($stateParams, businessFactory) {
            if (businessFactory.business === null) {
              return businessFactory.getBusiness($stateParams.businessid);
            } else {
              return businessFactory.business;
            }

          }]
        }
      })
      .state('app.favorites', {
        url: '/favorites',
        views: {
          'menuContent': {
            templateUrl: 'templates/favorites.html'
          }
        }
      })
      .state('app.settings', {
        url: '/settings',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings.html'
          }
        }
      })
      .state('app.appointments', {
        url: '/appointments',
        views: {
          'menuContent': {
            templateUrl: 'templates/appointments.html',
            controller: 'appointmentCtrl'
          }
        }
      })
      .state('app.appointments-detail', {
        url: '/appointments/:appointmentId',
        params: {appointment: null},
        views: {
          'menuContent': {
            templateUrl: 'templates/appointment-detail.html',
            controller: 'appointment-detailCtrl'

          }
        }
      });
    // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth');
  });
