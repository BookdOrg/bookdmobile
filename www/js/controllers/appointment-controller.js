/**
 * Created by khalilbrown on 7/25/16.
 */
'use strict';

module.exports = function ($scope, $ionicPopup, $state, $rootScope, CLOUDINARY_BASE, CLOUDINARY_Default, appointmentFactory,
                           $ionicModal, businessFactory, facebookApi, ionicDatePicker, socketService, userFactory, notificationFactory, $ionicLoading) {
  $scope.appointments = $rootScope.currentUser.appointments;
  $scope.facebookApi = facebookApi;
  $scope.cloudinaryBaseUrl = CLOUDINARY_BASE;
  $scope.cloudinaryDefaultPic = CLOUDINARY_Default;
  $scope.appointmentState = 'standard';
  var stateChanged = false;
  $scope.goToProfile = function (id) {
    $state.go('app.profile', {id: id})
    //$scope.modalCtrl.hide();
  };
  $scope.switchState = function (state) {
    if (state == 'reschedule') {
      $scope.selectedDate = new Date($scope.appointments[$scope.appointmentIndex].start.date);
    }
    $scope.appointmentState = state;
  };
  /**
   *
   *
   */
  $scope.doRefresh = function () {
    $scope.loading = true;
    $ionicLoading.show({
      template: 'Updating Appointments <br> <ion-spinner icon="dots"></ion-spinner>'
    });
    appointmentFactory.getInfiniteAppointment(0)
      .then(function (response) {
        $scope.appointments = response;
        $scope.lastIndex = $scope.appointments.length;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.loading = false;
        $ionicLoading.hide();

      }, function (error) {
        alert(error);
        $scope.$broadcast('scroll.refreshComplete');
        $scope.loading = false;
        $ionicLoading.hide();
      });
  };
  $scope.doRefresh();
  /**
   *
   *
   */
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
  /**
   *
   *
   * @returns {boolean}
   */
  $scope.moreDataCanBeLoaded = function () {
    if ($rootScope.currentUser.appointments && $scope.lastIndex < $rootScope.currentUser.appointments.length) {
      return true;
    } else {
      return false;
    }
  };
  //$ionicModal.fromTemplateUrl('appointment-modal.html', function (modal) {
  //  $scope.modalCtrl = modal;
  //}, {
  //  scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
  //  animation: 'slide-in-up'//'slide-left-right', 'slide-in-up', 'slide-right-left'
  //});
  /**
   *
   *
   * @param index
   */
  $scope.appointmentClicked = function (index) {
    $scope.service = null;
    $scope.appointmentIndex = index;
    $scope.requestingService = true;
    $state.go('app.appointments-detail', {
      appointmentId: $scope.appointments[$scope.appointmentIndex]._id,
      appointment: $scope.appointments[$scope.appointmentIndex]
    });

  };

};
