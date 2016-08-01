/**
 * Created by khalilbrown on 7/31/16.
 */
'use strict';

module.exports = function ($scope, auth, $state, $stateParams, businessFactory, $rootScope,
                           $controller, facebookApi, userFactory, utilService, business, $ionicHistory, $ionicSideMenuDelegate) {

  $scope.myGoBack = function () {
    $ionicHistory.goBack();
  };
  $scope.toggleMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.lastView = $ionicHistory.backView();
  $scope.business = business;

};
