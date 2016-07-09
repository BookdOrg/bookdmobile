angular.module('bookd.controllers', [])
  .controller('AuthCtrl', function ($scope, $ionicPopup, auth, $state, $cordovaOauth, $http, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default) {
    $scope.state = 'signIn';
    $scope.switchState = function (state) {
      $scope.state = state;
    };
    $scope.doLogIn = function (user) {
      user.provider = 'bookd';
      auth.logIn(user)
        .then(function () {
          if ($rootScope.currentUser.avatarVersion) {
            $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
          } else {
            $rootScope.avatar = CLOUDINARY_Default;

          }
          $state.go('app.searchlist');
        }).then(function (error) {
        $scope.error = error;
        if (error) {
          $ionicPopup.alert({
            title: 'Oops!',
            template: $scope.error.message
          })
        }
      })
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
            auth.logIn(user, success.data.picture.data.url)
              .then(function (result) {
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
                $scope.error = error.message;
              });
          }, function (error) {
            console.log(error);
          });

        }, function (error) {
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
        .then(function () {
          if ($rootScope.currentUser.avatarVersion) {
            $rootScope.avatar = CLOUDINARY_BASE + $rootScope.currentUser.avatarVersion + '/profile/' + $rootScope.currentUser._id;
          } else {
            $rootScope.avatar = CLOUDINARY_Default;

          }                    //onlineData.user = $rootScope.currentUser._id;
          //socketService.emit('online', onlineData);
          $state.go('app.searchlist');
          //$rootScope.currentUser.notifications = [];
        }, function (error) {
          $scope.error = error.message;
        });
    };
    $scope.user = {};
    //var getNotifications = function () {
    //    notificationFactory.getNotifications().then(
    //        function (data) {
    //            $rootScope.currentUser.notifications = data;
    //        },
    //        function (err) {
    //            console.log(err);
    //        }
    //    );
    //};
  })
  .controller('appointmentCtrl', function ($scope, $ionicPopup, $state, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default, appointmentFactory) {
    appointmentFactory.getInfiniteAppointment(0)
      .then(function (response) {
        $scope.appointments = response;
      }, function (error) {
        alert(error);
      });
    //$scope.appointments = appointmentFactory.appointments;

    $scope.loadMore = function () {
      if ($scope.appointments) {
        var lastIndex = $scope.appointments.length;
        appointmentFactory.getInfiniteAppointment(lastIndex)
          .then(function (response) {
            for (var appointmentIndex = 0; appointmentIndex < response.length; appointmentIndex++) {
              $scope.appointments.push(response[appointmentIndex]);
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }, function (error) {
            alert(error);
          });
      }
    };
    function pushAppointments(appointments) {
      for (var appointmentIndex = 0; appointmentIndex < appointments.length; appointmentIndex++) {

      }
    }
  }).controller('SearchCtrl', ['$scope', 'business', 'search', function ($scope, business, search) {
  var vm = this;

  vm.query = {
    location: null,
    term: null
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      console.log(lat, lng);
      // This returns an 8 part array where the 0th index is the most accurate and the 7th is least accurate.
      search.getLocationInfo(lat, lng).then(
        function (data) {
          console.log(data);
          vm.query.location = data['results'][0]['formatted_address'];
        }, function (err) {
          console.log(err);
        });
    }, function (err) {
      console.log(err);
    });
  } else {
    //TODO HANDLE THIS CASE
    console.log('Geolocation is not supported by this browser.');
  }

  vm.search = function () {
    var formattedQuery;
    formattedQuery = vm.query.term + ' ' + vm.query.location;

    business.search(formattedQuery)
      .then(function (data) {
        console.log(data);
      });
  };
}]);
