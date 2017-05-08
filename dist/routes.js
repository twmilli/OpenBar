'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _queries = require('./queries');

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
var get_ip = require('ipware')().get_ip;
//var wait = require('asyncawait/await');


router.get('/', function (req, res) {
    var user = null;
    if (req.isAuthenticated()) {
        if (req.user.radius && req.user.location) {
            res.redirect('/data/' + req.user.location + '/' + req.user.radius);
            return;
        }
    }
    var ip;
    if (process.env.NODE_ENV === 'production') {
        ip = get_ip(req).clientIp;
    } else {
        ip = "24.34.135.173";
    }

    (0, _queries.coreHelper)(req.db, ip, req.user, res);
});

router.post('/radius/:radius', function (req, res) {
    res.redirect('/data/' + req.body.location + '/' + req.params.radius);
});

router.post('/location/:location', function (req, res) {
    console.log(req.body);
    res.redirect('/data/' + req.params.location + '/' + req.body.radius);
});

router.get('/login', _passport2.default.authenticate('github', { scope: ['user:email'] }), function (req, res) {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
});

router.get('/login/callback', _passport2.default.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/data/:location/:radius', function (req, res) {
    var db = req.db;
    var user = null;
    if (req.isAuthenticated()) {
        user = req.user.displayName;
        req.user.radius = req.params.radius;
        req.user.location = req.params.location;
    }
    (0, _queries.getYelpData)(req.params.location, req.params.radius).then(function (data) {
        var point = data.region.center;
        (0, _queries.pointToCity)(point.latitude, point.longitude).then(function (loc_res) {
            var going_promises = [];
            data.businesses.forEach(function (bar, i) {
                going_promises.push(db.collection("places").findOne({
                    name: bar.name
                }, {
                    going: 1,
                    people: 1
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
                        if (req.user && values[i].people && values[i].people[req.user.displayName]) {
                            user_going = values[i].people[req.user.displayName];
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
                    miles: req.params.radius,
                    location: loc_res[0].city + ", " + loc_res[0].administrativeLevels.level1short,
                    user: user
                });
            }).catch(function (err) {
                return console.log(err);
            });
        }).catch(function (err) {
            return console.log(err);
        });
    }).catch(function (err) {
        console.error(err);
    });
});

router.get('/going/:name', function (req, res) {
    var db = req.db;
    var user = req.user;
    if (user === undefined) {
        res.redirect('/login');
    } else {
        user = user.displayName;
        db.collection("places").findOne({ name: req.params.name }).then(function (place) {
            var user_obj = {};
            if (place && place.people && place.people[user] === true) {
                user_obj[user] = false;
                db.collection("places").update({
                    name: req.params.name
                }, {
                    $inc: {
                        going: -1
                    },
                    $set: {
                        people: user_obj
                    }
                }, { upsert: true }).catch(function (err) {
                    return console.log(err);
                });
            } else {
                user_obj[user] = true;
                db.collection("places").update({
                    name: req.params.name
                }, {
                    $inc: {
                        going: 1
                    },
                    $set: {
                        people: user_obj
                    }
                }, { upsert: true }).catch(function (err) {
                    return console.log(err);
                });
            }
            res.redirect('/');
        }).catch(function (err) {
            return console.log(err);
        });
    }
});
exports.default = router;