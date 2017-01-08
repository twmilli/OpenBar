import YelpConfig from './YelpConfig';
import Yelp from 'yelp';
import axios from 'axios';
import NodeGeocoder from 'node-geocoder';

export function getYelpData(location, radius = 25) {
    var yelp = new Yelp(YelpConfig);
    const radius_filter = milesToMeters(radius);
    // See http://www.yelp.com/developers/documentation/v2/search_api
    return (yelp.search({radius_filter, location, category_filter: 'bars'}).catch(err => console.log(err)));
}

export function getLocation(ip) {
    return (axios.get('http://freegeoip.net/json/' + ip).catch(err => console.log(err)));
}

export function pointToCity(lat, lon) {
    const options = {
        provider: 'google',
        httpAdapter: 'https', // Default
        apiKey: 'AIzaSyCraVfJaP1D2xpmIQhVQTmvStgQO3DDfDw', // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };
    const geocoder = NodeGeocoder(options);
    return (geocoder.reverse({lat, lon}).catch(err => console.log(err)));
}

export function coreHelper(db, ip, user, res) {
  var user_name = null;
  if (user !== undefined) {
      user_name = (user.displayName);
  }
    getLocation(ip).then(response => {
        var state = response.data.region_code;
        var city = response.data.city;
        getYelpData(response.data.zip_code).then(function(data) {
            var going_promises = [];
            (data.businesses).forEach((bar, i) => {
                going_promises.push(db.collection("places").findOne({
                    name: bar.name
                }, {
                    going: 1,
                    people: 1
                }).catch(err => console.log(err)));
            });
            Promise.all(going_promises).then(values => {
                var reduced_data = [];
                for (var i = 0; i < data.businesses.length; i++) {
                    var bar = data.businesses[i];
                    var going = 0;
                    var user_going = false
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
                        going,
                        user_going
                    });
                }
                res.render('pages/home', {
                    data: reduced_data,
                    miles: "25",
                    location: city + ", " + state,
                    user:user_name
                });
            }).catch(function(err) {
                console.error(err);
            });
        });
    }).catch(err => console.log(err));
  }

    function milesToMeters(miles) {
        return miles * 1609.34;
    }
