/**
 * Created by khalilbrown on 7/25/16.
 */
'use strict';
module.exports = function ($http, auth, $q, remoteHost, utilService) {
  var o = {
    business: null
  };
    /**
     *   Queries & returns google places for a business based on a
     *   text search.
     *
     **/
    o.search = function (query) {
      return $http.get(remoteHost + '/business/search', {
        params: {
          'query': query
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        data = utilService.selectPhotos(data.data);
        return data;
      }, function (err) {
        handleError(err);
      });
    };
    /**
     *   Creates a new appointment for both the Employee and Customer.
     *   Takes in the appointment object.
     *
     *    Parameters:
     *               businessId -
     *  employee -
     *  customer -
     *  start -
     *  end -
     *  title -
     *  timestamp -
     *  card -
     **/
    o.addAppointment = function (appt) {
      return $http.post(remoteHost + '/business/appointments/create', appt, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        return err.data;
      });
    };
  o.updateAppointment = function (appt) {
      return $http.post(remoteHost + '/business/appointments/update', appt, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        return err.data;
      });
  };
  o.cancelAppointment = function (appt) {
      return $http.post(remoteHost + '/business/appointments/cancel', appt, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        return err.data;
      });
  };
  o.getBusiness = function (id) {
      return $http.get(remoteHost + '/business/details', {
        params: {
          'placesId': id
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        data = utilService.selectPhoto(data.data);
        //angular.copy(data.data, o.business);
        return data;
      }, handleError);
  };
    /**
     *   Returns all Bookd information about a specific Business.
     *
     *  Parameters:
     *  placeId -
     *
     **/
    o.getBusinessInfo = function (id) {
      return $http.get(remoteHost + '/business/info', {
        params: {
          'id': id
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        return data.data;
      }, handleError);
    };
    /**
     *
     * Get the details for a specific service
     *
     */
    o.serviceDetails = function (serviceId) {
      return $http.get(remoteHost + '/business/service-detail', {
        params: {
          'service': serviceId
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        //angular.copy(data.data, o.service);
        return data.data;
      }, handleError);
    };
  o.getPhotos = function (reference) {
      return $http.get('https://maps.googleapis.com/maps/api/place/photo?minwidth=75&maxwidth=75&minheight=75&maxheight=75&key=AIzaSyB-hJk0rUSYf1V_Yf_XXxdOJPpeTiodFTo&photoreference=' + reference)
        .then(function (data) {
          return data.data;
        }, handleError)
  };
  return o;

  // I transform the error response, unwrapping the application dta from
  // the API response payload.
  function handleError(response) {
    // The API response from the server should be returned in a
    // normalized format. However, if the request was not handled by the
    // server (or what not handles properly - ex. server error), then we
    // may have to normalize it on our end, as best we can.
    if (!angular.isObject(response.data) || !response.data.message) {
      return ( $q.reject('An unknown error occurred.') );
    }
    // Otherwise, use expected error message.
    return ( $q.reject(response.data.message) );
  }

};
