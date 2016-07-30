/**
 * Created by khalilbrown on 7/30/16.
 */
module.exports = function ($scope, auth, userFactory, $sce, $state, $stateParams, facebookApi, socketService, CLOUDINARY_BASE, CLOUDINARY_Default, $ionicHistory) {
//Settings for the ratings bar
  $scope.hoveringOver = function (value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };
  $scope.max = 5;
  $scope.isReadonly = true;
  $scope.rate = 0;
  //get the profile information of the user
  userFactory.get($stateParams.id).then(function (data) {
    $scope.user = data.user;
    //Grab the google+ users profile photo
    //if (data.user.provider === 'google_plus') {
    //    userFactory.getGooglePhoto(data.user.providerId)
    //        .then(function (response) {
    //            if (!response.error) {
    //                $scope.user.photo = response.image.url.replace('sz=50', 'sz=200');
    //            }
    //        });
    //}
  });

  $scope.facebookApi = facebookApi;
  $scope.cloudinaryBaseUrl = CLOUDINARY_BASE;
  $scope.cloudinaryDefaultPic = CLOUDINARY_Default;

  $scope.myGoBack = function () {
    $ionicHistory.goBack();
  };

  $scope.lastView = $ionicHistory.backView();

  $scope.$on('$destroy', function (event) {
    socketService.removeAllListeners();
  });
};
