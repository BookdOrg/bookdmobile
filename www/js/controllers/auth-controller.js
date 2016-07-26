'use strict';

module.exports = function ($scope, $ionicPopup, auth, $state, $cordovaOauth, $http, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default) {
  $scope.state = 'signIn';
  $scope.authSpinner = false;

  $scope.switchState = function (state) {
    $scope.state = state;
  }
  $scope.doLogIn = function (user) {
    user.provider = 'bookd';
    $scope.authSpinner = true;
    auth.logIn(user).then(function (response) {
      if (response.status == 200) {
        $scope.authSpinner = false;
        if ($rootScope.currentUser.avatarVersion) {
          $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
        } else {
          $rootScope.avatar = CLOUDINARY_Default;

        }
        $state.go('app.searchlist');
      }
      if (response.status !== 200) {
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
    $scope.authSpinner = true;
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
          auth.logIn(user, success.data.picture.data.url)
            .then(function (result) {
              $scope.authSpinner = false;
              if ($rootScope.currentUser.avatarVersion) {
                $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
              } else {
                $rootScope.avatar = CLOUDINARY_Default;

              }
              $state.go('app.searchlist');
              //onlineData.user = $rootScope.currentUser._id;
              //socketService.emit('online', onlineData);
              //$state.go(state, {tier: tier});
              //getNotifications();
            }, function (error) {
              $scope.authSpinner = false;
              $scope.error = error.message;
              $ionicPopup.alert({
                title: 'Oops!',
                template: $scope.error
              })
            });
        }, function (error) {
          $scope.authSpinner = false;
          $scope.error = error;
          $ionicPopup.alert({
            title: 'Oops!',
            template: $scope.error
          })
          console.log(error);
        });

      }, function (error) {
        $scope.error = error;
        $ionicPopup.alert({
          title: 'Oops!',
          template: $scope.error
        })
        console.log(error);
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
        if (response.status == 200) {
          $scope.authSpinner = false;
          if ($rootScope.currentUser.avatarVersion) {
            $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
          } else {
            $rootScope.avatar = CLOUDINARY_Default;

          }
          $state.go('app.searchlist');
        }
        if (response.status !== 200) {
          $scope.authSpinner = false;
          $scope.error = response.data.message;
          $ionicPopup.alert({
            title: 'Oops!',
            template: $scope.error
          })
        }
      });
  };
  $scope.user = {};
};
