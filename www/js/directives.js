/**
 * Created by Jonfor on 7/9/16.
 */
(function () {
  angular.module('bookd.directives', [])
    .directive('searchResult', [function () {
      return {
        restrict: 'E',
        templateUrl: 'templates/search-result.html',
        scope: {},
        controller: SearchController,
        controllerAs: 'sm'
      };
    }]);

  function SearchController() {

  }
})();
