/**
 * Created by khalilbrown on 7/25/16.
 */

'use strict';

module.exports = function ($http) {
  return {
    getLocationInfo: function (lat, lng) {
      return $http.get('https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyAK1BOzJxHB8pOFmPFufYdcVdAuLr_6z2U&latlng='
        + lat + ',' + lng)
        .then(function (data) {
          if (data) {
            return data.data;
          }
        }, function (error) {
          //TODO Google wants us to access this API from a server, not a client.
          console.log('If seeing this, probably CORS error with googleapis geocode');
          console.log(error);
        });
    }
  }
}
