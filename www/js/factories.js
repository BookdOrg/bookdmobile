/**
 * Created by khalilbrown on 6/5/16.
 */
angular.module('bookd.factories', [])
  .factory('auth', ['$http', '$window', '$rootScope', '$state', 'remoteHost', function ($http, $window, $rootScope, $state, remoteHost) {
    var auth = {
      /**
       * Save the users authentication token
       *
       * @param token
       * @param user
       */
      saveUser: function (token, user) {
        if (user) {
          $window.localStorage['user'] = angular.toJson(user);
        }
        if (token) {
          $window.localStorage['bookd-token'] = token;
        }
      },
      /**
       * Retrieve the authentication token currently stored
       *
       * @returns {*}
       */
      getToken: function () {
        return $window.localStorage['bookd-token'];
      },
      getUser: function () {
        return $window.localStorage['user'];
      },
      /**
       * Save the provider information so it's not lost when the
       * bookd token changes
       *
       * @param info
       */
      saveProviderInfo: function (info) {
        $window.localStorage['providerInfo'] = info;
      },
      /**
       * Retrieve the provider info
       *
       * @returns {*}
       */
      getProviderInfo: function () {
        return $window.localStorage['providerInfo'];
      },
      isLoggedIn: function () {
        var token = auth.getToken();

        if (token !== 'undefined' && angular.isDefined(token)) {
          var payload = angular.fromJson($window.atob(token.split('.')[1]));

          return payload.exp > Date.now() / 1000;
        } else {
          return false;
        }
      },
      currentUser: function () {
        if (auth.isLoggedIn()) {
          var user = angular.fromJson(auth.getUser());
          user.providerInfo = auth.getProviderInfo();
          return user;
        }
      },
      register: function (user, info) {
        return $http.post(remoteHost + '/register', user)
          .then(function (data) {
            auth.saveUser(data.data.token, data.data.user);
            if (info) {
              auth.saveProviderInfo(info);
            }
            $rootScope.currentUser = angular.fromJson(auth.currentUser());
            $rootScope.currentUser.providerInfo = auth.getProviderInfo();
            //socketService.emit('authorizationRes', $rootScope.currentUser._id);
          }, function (error) {
            throw error.data;
          });
      },
      logIn: function (user, info) {
        return $http.post(remoteHost + '/login', user)
          .then(function (data) {
            auth.saveUser(data.data.token, data.data.user);
            if (info) {
              auth.saveProviderInfo(info);
            }
            $window.localStorage.setItem('monthYear', '');
            $window.localStorage.setItem('masterList', angular.toJson({}));
            $window.localStorage.setItem('monthYearArray', '');
            $window.localStorage.setItem('previousBusiness', '');
            $window.localStorage.setItem('previousPersonalMonthYear', '');
            $rootScope.currentUser = angular.fromJson(auth.currentUser());
            $rootScope.currentUser.providerInfo = auth.getProviderInfo();
            //socketService.emit('authorizationRes', $rootScope.currentUser._id);
          }, function (error) {
            throw error.data;
          });
      },
      logOut: function () {
        $window.localStorage.removeItem('bookd-token');
        $window.localStorage.removeItem('monthYear');
        $window.localStorage.removeItem('masterList');
        $window.localStorage.removeItem('monthYearArray');
        $window.localStorage.removeItem('providerInfo');
        $window.localStorage.removeItem('previousBusiness');
        $window.localStorage.removeItem('previousPersonalMonthYear');
        $window.localStorage.removeItem('oauthio_provider_google_plus');
        $rootScope.currentUser = null;
        $state.go('landing');
      },
      reset: function (email) {
        var data = {
          email: email
        };
        return $http.post(remoteHost + '/user/reset', data)
          .then(function (data) {
            console.log(data);
          }, function (error) {
            throw error.data;
          });
      },
      newPassword: function (password, token) {
        var data = {
          password: password,
          token: token
        };
        return $http.post(remoteHost + '/user/reset/new', data)
          .then(function (data) {
            console.log(data);
          }, function (error) {
            throw error.data;
          });
      }
    };

    return auth;
  }])
  .factory('appointmentFactory', function ($http, auth, $q) {
    var o = {
      appointments: null
    };
    o.getInfiniteAppointment = function (lastSeen) {
      return $http.get('http://localhost:3002/appointments-scroll', {
        params: {
          lastSeen: lastSeen
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        o.appointments = data.data.docs;
        return o.appointments;
      }, function (err) {
        return err.data
      })
    };
    /**
     *
     * @param employeeAvailability - The employee availability array with availability for all days and a deeper array with break times
     * @param appointmentsArray - The array of appointments for both the employee and the user.
     * @param duration - Duration of the selected service we are trying to schedule
     * @param user - The id of the user we are scheduling for.
     * @returns {Array}
     */
    o.createAvailableTimes = function (employeeAvailability, appointmentsArray, duration, user) {
      var availableTimes = [];
      //The duration of the service in minutes.
      var minutes = moment.duration(parseInt(duration), 'minutes');
      var employeeDate = employeeAvailability.date.clone();
      //We need to count from the start of the employee's day by the duration number of minutes as long as it's before the
      //employee's end time.
      for (var m = employeeAvailability.dayStart; employeeAvailability.dayStart.isBefore(employeeAvailability.dayEnd); m.add(duration, 'minutes')) {

        var availableTimeStart = m.clone();
        availableTimeStart.set('second', '00');
        var startPlusEnd = m.clone();
        startPlusEnd.set('second', '00');
        startPlusEnd.add(minutes);
        var availableTimeEnd = startPlusEnd.clone();
        var availableTimeRange = moment.range(availableTimeStart, availableTimeEnd);
        //This object represents a block of time that we can possible return to the function caller
        var timeObj = {
          time: availableTimeStart.format('hh:mm a'),
          end: availableTimeEnd.format('hh:mm a'),
          available: true,
          toggled: false,
          status: false,
          hide: false,
          user: user
        };
        /**
         *
         * We loop though the array of break times for a given employee on the given day.
         * If there are any intersections between the employee's break time and the current "available time"
         * then we adjust our available time.
         */
        _.forEach(employeeAvailability.gaps, function (gap) {
          var gapStartHour = moment(gap.start, 'hh:mm a').hour();
          var gapStartMinute = moment(gap.start, 'hh:mm a').minute();
          var gapEndHour = moment(gap.end, 'hh:mm a').hour();
          var gapEndMinute = moment(gap.end, 'hh:mm a').minute();
          var gapStart = moment(employeeDate).set({
            'hour': gapStartHour,
            'minute': gapStartMinute,
            'second': '00'
          });
          var gapEnd = moment(employeeDate).set({
            'hour': gapEndHour,
            'minute': gapEndMinute,
            'second': '00'
          });
          var gapRange = moment.range(gapStart, gapEnd);
          var adjustedEnd = m.clone();
          if (gapRange.intersect(availableTimeRange)) {
            adjustedEnd.add(duration, 'minutes');
            timeObj.end = adjustedEnd.format('hh:mm a');
            m.set({'hour': gapEndHour, 'minute': gapEndMinute}).format('hh:mm a');
            timeObj.time = m.clone().format('hh:mm a');
          } else {
            adjustedEnd.add(duration, 'minutes');
            timeObj.end = adjustedEnd.format('hh:mm a');
          }
        });
        /**
         *
         *
         * @param appointmentArray - The array of appointments for both the employee and the user
         */
        function calculateAppointmentBlocks(appointmentArray) {
          _.forEach(appointmentArray, function (appointment) {
            calculateAppointment(appointmentArray, appointment, timeObj, m);
          });
        }

        _.forEach(appointmentsArray, function (appointmentArray) {
          calculateAppointmentBlocks(appointmentArray);
        });

        /**
         *
         *
         *
         * @param appointmentArray - The array of appointments for both the employee and the user
         * @param appointment - The current appoontment that we are looking at in the appointment array
         * @param timeObj - The current block of time we are trying to create
         * @param m - The moment object representing the employees start date
         */
        function calculateAppointment(appointmentArray, appointment, timeObj, m) {
          var apptStartHour = moment(appointment.start.time, 'hh:mm a').hour();
          var apptStartMinute = moment(appointment.start.time, 'hh:mm a').minute();
          var apptEndHour = moment(appointment.end.time, 'hh:mm a').hour();
          var apptEndMinute = moment(appointment.end.time, 'hh:mm a').minute();
          var apptStart = moment(employeeDate).set({
            'hour': apptStartHour,
            'minute': apptStartMinute,
            'second': '00'
          });
          var apptEnd = moment(employeeDate).set({
            'hour': apptEndHour,
            'minute': apptEndMinute,
            'second': '00'
          });
          var apptRange = moment.range(apptStart, apptEnd);
          var availableTimeAdjustedEnd = m.clone();
          var currentAvailableTimeStartHour = moment(timeObj.time, 'hh:mm a').hour();
          var currentAvailableTimeStartMinute = moment(timeObj.time, 'hh:mm a').minute();
          var currentAvailableTimeEndHour = moment(timeObj.end, 'hh:mm a').hour();
          var currentAvailableTimeEndMinute = moment(timeObj.end, 'hh:mm a').minute();

          var currAvailableStart = moment(employeeDate).set({
            'minute': currentAvailableTimeStartMinute,
            'hour': currentAvailableTimeStartHour,
            'second': '00'
          });
          var currAvailableEnd = moment(employeeDate).set({
            'minute': currentAvailableTimeEndMinute,
            'hour': currentAvailableTimeEndHour,
            'second': '00'
          });
          var currAvailableRange = moment.range(currAvailableStart, currAvailableEnd);

          if (apptRange.intersect(currAvailableRange) || apptRange.isSame(currAvailableRange)) {
            m.set({'hour': apptEndHour, 'minute': apptEndMinute}).format('hh:mm a');
            availableTimeAdjustedEnd = m.clone();
            timeObj.time = m.clone().format('hh:mm a');
            availableTimeAdjustedEnd.add(duration, 'minutes');
            timeObj.end = availableTimeAdjustedEnd.format('hh:mm a');
            calculateAppointmentBlocks(appointmentArray);
          } else {
            availableTimeAdjustedEnd.add(duration, 'minutes');
            timeObj.end = availableTimeAdjustedEnd.format('hh:mm a');
          }
        }

        var currentDateTime = moment().set({
          'year': moment(employeeDate).year(),
          'month': moment(employeeDate).month(),
          'date': moment(employeeDate).date(),
          'hour': moment(timeObj.time, 'hh:mm a').hour(),
          'minute': moment(timeObj.time, 'hh:mm a').minute(),
          'second': 0,
          'milliseconds': 0
        });
        var timeEnd = moment({
          'date': moment(employeeDate).date(),
          'year': moment(employeeDate).year(),
          'month': moment(employeeDate).month(),
          'hour': moment(timeObj.end, 'hh:mm a').hour(),
          'minutes': moment(timeObj.end, 'hh:mm a').minute(),
          'seconds': 00,
          'milliseconds': 00
        });
        var timeStart = moment({
          'date': moment(employeeDate).date(),
          'year': moment(employeeDate).year(),
          'month': moment(employeeDate).month(),
          'hour': moment(timeObj.time, 'hh:mm a').hour(),
          'minutes': moment(timeObj.time, 'hh:mm a').minute(),
          'seconds': 00,
          'milliseconds': 00
        });
        var dayEnd = moment({
          'date': moment(employeeDate).date(),
          'year': moment(employeeDate).year(),
          'month': moment(employeeDate).month(),
          'hour': moment(employeeAvailability.dayEnd).hour(),
          'minutes': moment(employeeAvailability.dayEnd).minute(),
          'seconds': moment(employeeAvailability.dayEnd).second()
        });
        if (moment(timeEnd.format()).isSameOrBefore(moment(dayEnd.format())) && !moment(timeStart.format()).isSameOrAfter(moment(timeEnd).format())
          && !moment(timeStart.format()).isSameOrAfter(moment(dayEnd.format())) && !currentDateTime.isBefore(moment())) {
          availableTimes.push(timeObj);
        }
      }
      return availableTimes;
    };
    return o;
  })
  .factory('userFactory', function ($http, auth, $q) {
    var o = {
      appointments: [],
      dashboard: [],
      user: {},
      customerEmployeeAppts: []
    };

    /**
     *   Returns the profile of a specified user.
     **/
    o.get = function (id) {
      return $http.get('/user/profile', {
        params: {
          id: id
        },
        headers: {
          Authorization: 'Bearer ' + auth.getToken(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function (res) {
        // angular.copy(res.data, o.user)
        return res.data;
      }, handleError);
    };
    /**
     *   Upload a users profile picture
     **/
    o.postPicture = function () {
      return $http.post('/upload', {
        headers: {
          Authorization: 'Bearer ' + auth.getToken(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function (data) {
        //TODO Handle success
        //console.log(data);
      }, handleError);
    };
    //o.getGooglePhoto = function (id) {
    //    return $http.get('/user/google-photo', {
    //        params: {
    //            id: id
    //        },
    //        headers: {Authorization: 'Bearer ' + auth.getToken()}
    //    }).then(function (data) {
    //        return data.data;
    //    });
    //};
    /**
     * Returns all a users personal and business appointments
     * @returns {*}
     */
    o.getUserAppts = function (id, start, end) {
      return $http.get('/user/appointments-all', {
        params: {
          id: id,
          start: start,
          end: end
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        return data.data;
      }, handleError);
    };
    /**
     *  Returns all appointments for both the employee and the customers trying to schedule an appointment,
     *  Takes in the ID of the employee & the startDate to search for. User ID is grabbed from
     *  auth middleware.
     **/
    o.getAppts = function (object) {
      return $http.get('/user/appointments', {
        params: {
          'startDate': object.startDate,
          'employeeId': object.employeeId,
          'customerId': object.customerId,
          'personal': object.personal
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        angular.copy(data.data, o.customerEmployeeAppts);
        return data.data;
      }, handleError);
    };
    /**
     *   Returns a user object
     *
     *  Parameters:
     *  id - The id of the employee.
     **/
    o.search = function (email) {
      return $http.get('/user/search', {
        params: {
          'email': email
        },
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        angular.copy(data.data, o.user);
        return data.data;
      }, handleError);
    };
    o.updateProfile = function (data) {
      return $http.post('/user/profile/update', data, {
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        }
      }).then(function (data) {
        //TODO Handle success
        console.log(data);
      }, handleError);
    };
    /**
     *
     *
     *  Parameters:
     *
     **/
    o.updateAvailability = function (availability) {
      return $http.post('/user/availability/update', availability, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        return data.data;
      }, handleError);
    };

    o.updateDescription = function (description) {
      return $http.post('/user/description/update', description, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (data) {
        return data.data;
      }, handleError);
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
        return ( $q.reject("An unknown error occurred.") );
      }
      // Otherwise, use expected error message.
      return ( $q.reject(response.data.message) );
    }
  })
  .factory('businessFactory', ['$http', 'auth', '$q', 'remoteHost', function ($http, auth, $q, remoteHost) {
    return {
      /**
       *   Queries & returns google places for a business based on a
       *   text search.
       *
       **/
      search: function (query) {
        return $http.get(remoteHost + '/business/search', {
          params: {
            'query': query
          },
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (data) {
          return data.data;
        }, function (err) {
          handleError(err);
        });
      },
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
      addAppointment: function (appt) {
        return $http.post(remoteHost + '/business/appointments/create', appt, {
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (response) {
          return response.data;
        }, function (err) {
          return err.data;
        });
      },
      updateAppointment: function (appt) {
        return $http.post(remoteHost + '/business/appointments/update', appt, {
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (response) {
          return response.data;
        }, function (err) {
          return err.data;
        });
      },
      cancelAppointment: function (appt) {
        return $http.post(remoteHost + '/business/appointments/cancel', appt, {
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (response) {
          return response.data;
        }, function (err) {
          return err.data;
        });
      },
      getBusiness: function (id) {
        return $http.get(remoteHost + '/business/details', {
          params: {
            'placesId': id
          },
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (data) {
          //angular.copy(data.data, o.business);
          return data.data;
        }, handleError);
      },
      /**
       *   Returns all Bookd information about a specific Business.
       *
       *  Parameters:
       *  placeId -
       *
       **/
      getBusinessInfo: function (id) {
        return $http.get(remoteHost + '/business/info', {
          params: {
            'id': id
          },
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (data) {
          return data.data;
        }, handleError);
      },
      /**
       *
       * Get the details for a specific service
       *
       */
      serviceDetails: function (serviceId) {
        return $http.get(remoteHost + '/business/service-detail', {
          params: {
            'service': serviceId
          },
          headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (data) {
          //angular.copy(data.data, o.service);
          return data.data;
        }, handleError);
      }
    };

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
  }])
  .factory('search', ['$http', function ($http) {
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
}])
  .factory('notificationFactory', function ($http, auth, $q) {
    var o = {};
    o.addNotification = function (id, content, type, sendEmail, date) {
      var body = {
        id: id,
        content: content,
        type: type,
        sendEmail: sendEmail,
        date: date
      };
      return $http.post('/user/notifications/create', body, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        handleError(err);
        return err.data;
      });
    };

    o.getNotifications = function () {
      return $http.get('/user/notifications', {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        handleError(err);
        return err.data;
      });
    };

    /**
     * Route to change all non-viewed notifications to viewed.
     * @returns {*}
     */
    o.notificationsViewed = function () {
      return $http.get('/user/notifications/viewed', {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        handleError(err);
        return err.data;
      });
    };

    /**
     * Route to change one non-viewed notifications to viewed given it's ID.
     * @param id
     * @returns {*}
     */
    o.notificationViewed = function (id) {
      var body = {
        id: id
      };
      return $http.post('/user/notification/viewed', body, {
        headers: {Authorization: 'Bearer ' + auth.getToken()}
      }).then(function (response) {
        return response.data;
      }, function (err) {
        handleError(err);
        return err.data;
      });
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
  })
  .factory('locationFactory', ['$q', function ($q) {
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
  }]);
