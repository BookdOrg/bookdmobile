/**
 * Created by khalilbrown on 7/8/16.
 */
'use strict';
var app = require('angular').module('bookd');
app.controller('AuthCtrl', require('./auth-controller'));
app.controller('SearchCtrl', require('./search-controller'));
app.controller('appointmentCtrl', require('./appointment-controller'));
