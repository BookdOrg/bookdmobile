/**
 * Created by khalilbrown on 7/8/16.
 */
var app = require('angular').module('bookd');

app.factory('auth', require('./auth-factory'));
app.factory('appointmentFactory', require('./appointment-factory'));
app.factory('userFactory', require('./user-factory'));
app.factory('businessFactory', require('./business-factory'));
app.factory('search', require('./search-factory'));
app.factory('notificationFactory', require('./notification-factory'));
app.factory('locationFactory', require('./location-factory'));
