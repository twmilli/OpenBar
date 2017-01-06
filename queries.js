import YelpConfig from './YelpConfig';
import Yelp from 'yelp';
import axios from 'axios';
import NodeGeocoder from 'node-geocoder';


export function getYelpData(location, radius = 25) {
    var yelp = new Yelp(YelpConfig);
    const radius_filter = milesToMeters(radius);
    // See http://www.yelp.com/developers/documentation/v2/search_api
    return (yelp.search({
        radius_filter,
        location,
        category_filter: 'bars'
    }));
}

export function getLocation(ip) {
    return (axios.get('http://freegeoip.net/json/' + ip));
}

export function pointToCity(lat, lon) {
    const options = {
        provider: 'google',
        httpAdapter: 'https', // Default
        apiKey: 'AIzaSyCraVfJaP1D2xpmIQhVQTmvStgQO3DDfDw', // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };
    const geocoder = NodeGeocoder(options);
    return(geocoder.reverse({lat,lon}));
}

function milesToMeters(miles) {
    return miles * 1609.34;
}
