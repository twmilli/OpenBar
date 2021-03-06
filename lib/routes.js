import express from 'express';
const router = express.Router();
var get_ip = require('ipware')().get_ip;
//var wait = require('asyncawait/await');
import {getYelpData, getLocation, pointToCity, coreHelper} from './queries';
import passport from 'passport';

router.get('/', (req, res) => {
    var user = null;
    if (req.isAuthenticated()) {
        if (req.user.radius && req.user.location){
          res.redirect('/data/' + req.user.location + '/' +  req.user.radius);
          return;
        }
    }
    var ip;
    if (process.env.NODE_ENV === 'production') {
        ip = get_ip(req).clientIp;
    } else {
        ip = "24.34.135.173";
    }

    coreHelper(req.db, ip, req.user, res);
});

router.post('/radius/:radius', (req, res) => {
    res.redirect('/data/' + req.body.location + '/' + req.params.radius);
});

router.post('/location/:location', (req, res) => {
    console.log(req.body);
    res.redirect('/data/' + req.params.location + '/' + req.body.radius);
});

router.get('/login', passport.authenticate('github', {scope: ['user:email']}), function(req, res) {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
});

router.get('/login/callback', passport.authenticate('github', {failureRedirect: '/login'}), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/data/:location/:radius', (req, res) => {
    var db = req.db;
    var user = null;
    if (req.isAuthenticated()) {
        user = (req.user.displayName);
        req.user.radius = req.params.radius;
        req.user.location = req.params.location
    }
    getYelpData(req.params.location, req.params.radius).then(function(data) {
        const point = data.region.center
        pointToCity(point.latitude, point.longitude).then(loc_res => {
            var going_promises = [];
            (data.businesses).forEach((bar, i) => {
                going_promises.push(db.collection("places").findOne({
                    name: bar.name
                }, {
                    going: 1,
                    people: 1
                }));
            });
            Promise.all(going_promises).then(values => {
                var reduced_data = [];
                for (var i = 0; i < data.businesses.length; i++) {
                    var bar = data.businesses[i];
                    var going = 0;
                    var user_going = false
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
                        going,
                        user_going
                    });
                }
                res.render('pages/home', {
                    data: reduced_data,
                    miles: req.params.radius,
                    location: loc_res[0].city + ", " + loc_res[0].administrativeLevels.level1short,
                    user
                })
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(function(err) {
        console.error(err);
    });
});

router.get('/going/:name', (req, res) => {
    var db = req.db;
    var user = req.user;
    if (user === undefined) {
        res.redirect('/login');
    } else {
        user = user.displayName;
        db.collection("places").findOne({name: req.params.name}).then(place => {
            var user_obj = {};
            if (place && place.people && (place.people[user] === true)) {
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
                }, {upsert: true}).catch(err => console.log(err));
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
                }, {upsert: true}).catch(err => console.log(err));
            }
            res.redirect('/');
        }).catch(err => console.log(err));
    }
});
export default router;
