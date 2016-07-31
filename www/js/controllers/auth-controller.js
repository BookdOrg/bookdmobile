'use strict';

module.exports = function ($scope, $ionicPopup, auth, $q, $state, $cordovaOauth, $http, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default, $ionicLoading) {
  $scope.state = 'signIn';
  $scope.authSpinner = false;
  $scope.user = {};
  $scope.switchState = function (state) {
    $scope.state = state;
  };
  /**
   *
   * Bookd Login
   *
   *
   * @param user
   */
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
  // This is the success callback from the login method
  var fbLoginSuccess = function (response) {
    if (!response.authResponse) {
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
      .then(function (profileInfo) {
        //auth.saveUser({
        //  authResponse: authResponse,
        //  userID: profileInfo.id,
        //  name: profileInfo.name,
        //  email: profileInfo.email,
        //  picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
        //});
        var user = {
          'username': profileInfo.email,
          'provider': 'facebook'
        };
        auth.logIn(user, profileInfo.picture.data.url)
          .then(function (response) {
            if (response === 'Success') {
              $ionicLoading.hide();
              $state.go('app.searchlist');
            }
            if (response.status) {
              $ionicLoading.hide();
              $scope.error = response.data.message;
              $ionicPopup.alert({
                title: 'Oops!',
                template: $scope.error
              })
            }
          });
      }, function (fail) {
        // Fail get profile info
        console.log('profile info fail', fail);
      });
  };

  // This is the fail callback from the login method
  var fbLoginError = function (error) {
    alert(error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=id,email,name,picture.type(large)&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function () {
    $ionicLoading.show({
      template: "<ion-spinner icon='spiral'></ion-spinner> <br> Loading.."
    });
    facebookConnectPlugin.getLoginStatus(function (success) {
      if (success.status === 'connected') {
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        getFacebookProfileInfo(success.authResponse)
          .then(function (profileInfo) {
            //auth.saveUser({
            //  authResponse: success.authResponse,
            //  userID: profileInfo.id,
            //  name: profileInfo.name,
            //  email: profileInfo.email,
            //  picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            //});
            var user = {
              'username': profileInfo.email,
              'provider': 'facebook',
            };
            auth.logIn(user, profileInfo.picture.data.url)
              .then(function (response) {
                if (response === 'Success') {
                  $ionicLoading.hide();
                  $state.go('app.searchlist');
                }
                if (response.status) {
                  $ionicLoading.hide();
                  $scope.error = response.data.message;
                  $ionicPopup.alert({
                    title: 'Oops!',
                    template: $scope.error
                  })
                }
              });
          }, function (fail) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Oops!',
              template: fail
            })
          });
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.
        console.log('getLoginStatus', success.status);
        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    }, function (error) {
      $ionicLoading.hide();
    });
  };
  //$scope.facebookLogin = function () {
  //  $cordovaOauth.facebook("1652611575018107", ["email", "public_profile"])
  //    .then(function (result) {
  //      $http.get('https://graph.facebook.com/me?fields=id,name,picture.type(large),email', {
  //        params: {
  //          'access_token': result.access_token
  //        }
  //      }).then(function (success) {
  //        console.log(JSON.stringify(result));
  //        var user = {
  //          'username': success.data.email,
  //          'provider': 'facebook'
  //        };
  //        $scope.authSpinner = true;
  //        auth.logIn(user, success.data.picture.data.url)
  //          .then(function (response) {
  //            if (response === 'Success') {
  //              $scope.authSpinner = false;
  //              if ($rootScope.currentUser.avatarVersion) {
  //                $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
  //              } else {
  //                $rootScope.avatar = CLOUDINARY_Default;
  //
  //              }
  //              $state.go('app.searchlist');
  //            }
  //            if (response.status) {
  //              $scope.authSpinner = false;
  //              $scope.error = response.data.message;
  //              $ionicPopup.alert({
  //                title: 'Oops!',
  //                template: $scope.error
  //              })
  //            }
  //          });
  //      }, function (error) {
  //        $scope.authSpinner = false;
  //        $scope.error = error;
  //        $ionicPopup.alert({
  //          title: 'Oops!',
  //          template: $scope.error
  //        });
  //      });
  //
  //    }, function (error) {
  //      $scope.error = error;
  //      $scope.authSpinner = false;
  //      $ionicPopup.alert({
  //        title: 'Oops!',
  //        template: $scope.error
  //      });
  //    })
  //};

};
