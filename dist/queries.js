'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getYelpData = getYelpData;
exports.getLocation = getLocation;
exports.pointToCity = pointToCity;
exports.coreHelper = coreHelper;

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
    return yelp.search({ radius_filter: radius_filter, location: location, category_filter: 'bars' }).catch(function (err) {
        return console.log(err);
    });
}

function getLocation(ip) {
    return _axios2.default.get('http://freegeoip.net/json/' + ip).catch(function (err) {
        return console.log(err);
    });
}

function pointToCity(lat, lon) {
    var options = {
        provider: 'google',
        httpAdapter: 'https', // Default
        apiKey: 'AIzaSyCraVfJaP1D2xpmIQhVQTmvStgQO3DDfDw', // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };
    var geocoder = (0, _nodeGeocoder2.default)(options);
    return geocoder.reverse({ lat: lat, lon: lon }).catch(function (err) {
        return console.log(err);
    });
}

function coreHelper(db, ip, user, res) {
    var user_name = null;
    if (user !== undefined) {
        user = req.user.displayName;
    }
    getLocation(ip).then(function (response) {
        var state = response.data.region_code;
        var city = response.data.city;
        getYelpData(response.data.zip_code).then(function (data) {
            var going_promises = [];
            data.businesses.forEach(function (bar, i) {
                going_promises.push(db.collection("places").findOne({
                    name: bar.name
                }, {
                    going: 1,
                    people: 1
                }).catch(function (err) {
                    return console.log(err);
                }));
            });
            Promise.all(going_promises).then(function (values) {
                var reduced_data = [];
                for (var i = 0; i < data.businesses.length; i++) {
                    var bar = data.businesses[i];
                    var going = 0;
                    var user_going = false;
                    if (values[i]) {
                        going = values[i].going;
                        if (user && values[i].people && values[i].people[user.displayName]) {
                            user_going = values[i].people[user.displayName];
                        }
                    }
                    reduced_data.push({
                        name: bar.name,
                        rating: bar.rating,
                        url: bar.url,
                        image: bar.image_url,
                        going: going,
                        user_going: user_going
                    });
                }
                res.render('pages/home', {
                    data: reduced_data,
                    miles: "25",
                    location: city + ", " + state,
                    user: user_name
                });
            }).catch(function (err) {
                console.error(err);
            });
        });
    }).catch(function (err) {
        return console.log(err);
    });
}

function milesToMeters(miles) {
    return miles * 1609.34;
}