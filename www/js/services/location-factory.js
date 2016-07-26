/**
 * Created by khalilbrown on 7/25/16.
 */
'use strict';

module.exports = function ($q) {
  return {
    checkLocationAvailable: function () {
      var deferred = $q.defer();
      if (window.cordova) {
        cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
          if (!enabled) {
            deferred.reject(false);
          } else {
            deferred.resolve(true);
          }
        }, function (err) {
          deferred.reject(err);
        });
      } else {
        // For web environments don't do anything, just return true
        deferred.resolve(true);
      }

      return deferred.promise;
    }
  }
};
