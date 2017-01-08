'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getYelpData = getYelpData;
exports.getLocation = getLocation;
exports.pointToCity = pointToCity;

var _YelpConfig = require('./YelpConfig');

var _YelpConfig2 = _interopRequireDefault(_YelpConfig);

var _yelp = require('yelp');

var _yelp2 = _interopRequireDefault(_yelp);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _nodeGeocoder = require('node-geocoder');

var _nodeGeocoder2 = _interopRequireDefault(_nodeGeocoder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getYelpData(location) {
    var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 25;

    var yelp = new _yelp2.default(_YelpConfig2.default);
    var radius_filter = milesToMeters(radius);
    // See http://www.yelp.com/developers/documentation/v2/search_api
    return yelp.search({
        radius_filter: radius_filter,
        location: location,
        category_filter: 'bars'
    });
}

function getLocation(ip) {
    return _axios2.default.get('http://freegeoip.net/json/' + ip);
}

function pointToCity(lat, lon) {
    var options = {
        provider: 'google',
        httpAdapter: 'https', // Default
        apiKey: 'AIzaSyCraVfJaP1D2xpmIQhVQTmvStgQO3DDfDw', // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };
    var geocoder = (0, _nodeGeocoder2.default)(options);
    return geocoder.reverse({ lat: lat, lon: lon });
}

function milesToMeters(miles) {
    return miles * 1609.34;
}