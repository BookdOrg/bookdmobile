/**
 * Created by khalilbrown on 7/25/16.
 */
'use strict';

module.exports = function ($scope, $ionicPopup, $state, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default, appointmentFactory, $ionicModal, businessFactory, facebookApi) {
  $scope.appointments = $rootScope.currentUser.appointments;
  $scope.facebookApi = facebookApi;
  $scope.cloudinaryBaseUrl = CLOUDINARY_BASE;
  $scope.cloudinaryDefaultPic = CLOUDINARY_Default;
  appointmentFactory.getInfiniteAppointment(0)
    .then(function (response) {
      $scope.appointments = response;
      $scope.lastIndex = $scope.appointments.length;
    }, function (error) {
      alert(error);
    });
  //$scope.appointments = appointmentFactory.appointments;
  $scope.doRefresh = function () {
    appointmentFactory.getInfiniteAppointment(0)
      .then(function (response) {
        $scope.appointments = response;
        $scope.lastIndex = $scope.appointments.length;
        $scope.$broadcast('scroll.refreshComplete');
      }, function (error) {
        alert(error);
        $scope.$broadcast('scroll.refreshComplete');
      });
  };
  $scope.loadMore = function () {
    if ($scope.appointments) {
      $scope.lastIndex = $scope.appointments.length;
      appointmentFactory.getInfiniteAppointment($scope.lastIndex)
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
  $scope.moreDataCanBeLoaded = function () {
    if ($rootScope.currentUser.appointments && $scope.lastIndex < $rootScope.currentUser.appointments.length) {
      return true;
    } else {
      return false;
    }
  };
  $ionicModal.fromTemplateUrl('appointment-modal.html', function (modal) {
    $scope.modalCtrl = modal;
  }, {
    scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
    animation: 'slide-in-up'//'slide-left-right', 'slide-in-up', 'slide-right-left'
  });
  $scope.appointmentClicked = function (index) {
    $scope.appointmentIndex = index;
    $scope.modalCtrl.show().then(function () {
      businessFactory.serviceDetails($scope.appointments[index].service)
        .then(function (data) {
          //set the service to the $scope property
          $scope.service = data;
          //grab the employee details from the services list of employees based on the appointments employeeID
          if ($scope.appointments[index].employee._id) {
            $scope.employee = _.findWhere($scope.service.employees, {_id: $scope.appointments[appointments[index]].employee._id});
          } else {
            $scope.employee = _.findWhere($scope.service.employees, {_id: $scope.appointments[appointments[index]].employee});
          }

          //if there's no employee we set this flag to true
          if (!$scope.employee) {
            $scope.showNoEmployee = true;
          }
          $scope.stripePrice = $scope.service.price * 100;
        });
    });
  };
  $scope.closeModal = function () {
    $scope.modalCtrl.hide();
  };

  function pushAppointments(appointments) {
    for (var appointmentIndex = 0; appointmentIndex < appointments.length; appointmentIndex++) {

    }
  }
};
