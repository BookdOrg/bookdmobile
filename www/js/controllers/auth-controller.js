'use strict';

module.exports = function ($scope, $ionicPopup, auth, $state, $cordovaOauth, $http, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default) {
  $scope.state = 'signIn';
  $scope.authSpinner = false;
  $scope.user = {};
  $scope.switchState = function (state) {
    $scope.state = state;
  }
  $scope.doLogIn = function (user) {
    user.provider = 'bookd';
    $scope.authSpinner = true;
    auth.logIn(user).then(function (response) {
      if (response === 'Success') {
        $scope.authSpinner = false;
        if ($rootScope.currentUser.avatarVersion) {
          $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
        } else {
          $rootScope.avatar = CLOUDINARY_Default;

        }
        $state.go('app.searchlist');
      }
      if (response.status) {
        $scope.authSpinner = false;
        $scope.error = response.data.message;
        $ionicPopup.alert({
          title: 'Oops!',
          template: $scope.error
        })
      }
    });
  };
  $scope.facebookLogin = function () {
    $cordovaOauth.facebook("1652611575018107", ["email", "public_profile"])
      .then(function (result) {
        $http.get('https://graph.facebook.com/me?fields=id,name,picture.type(large),email', {
          params: {
            'access_token': result.access_token
          }
        }).then(function (success) {
          console.log(JSON.stringify(result));
          var user = {
            'username': success.data.email,
            'provider': 'facebook'
          };
          $scope.authSpinner = true;
          auth.logIn(user, success.data.picture.data.url)
            .then(function (response) {
              if (response === 'Success') {
                $scope.authSpinner = false;
                if ($rootScope.currentUser.avatarVersion) {
                  $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
                } else {
                  $rootScope.avatar = CLOUDINARY_Default;

                }
                $state.go('app.searchlist');
              }
              if (response.status) {
                $scope.authSpinner = false;
                $scope.error = response.data.message;
                $ionicPopup.alert({
                  title: 'Oops!',
                  template: $scope.error
                })
              }
            });
        }, function (error) {
          $scope.authSpinner = false;
          $scope.error = error;
          $ionicPopup.alert({
            title: 'Oops!',
            template: $scope.error
          });
        });

      }, function (error) {
        $scope.error = error;
        $scope.authSpinner = false;
        $ionicPopup.alert({
          title: 'Oops!',
          template: $scope.error
        });
      })
  };
  /**
   * Register via Bookd
   */
  $scope.register = function () {
    var user = {
      'username': $scope.user.email,
      'name': $scope.user.firstName + ' ' + $scope.user.lastName,
      'firstName': $scope.user.firstName,
      'lastName': $scope.user.lastName,
      'password': $scope.user.password,
      'provider': 'bookd'
    };
    auth.register(user)
      .then(function (response) {
        if (response === 'Success') {
          $scope.authSpinner = false;
          if ($rootScope.currentUser.avatarVersion) {
            $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
          } else {
            $rootScope.avatar = CLOUDINARY_Default;

          }
          $state.go('app.searchlist');
        }
        if (response.status) {
          $scope.authSpinner = false;
          $scope.error = response.data.message;
          $ionicPopup.alert({
            title: 'Oops!',
            template: $scope.error
          })
        }
      });
  };
};
