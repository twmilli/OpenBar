import YelpConfig from './YelpConfig';
import Yelp from 'yelp'

export function getYelpData(location, radius) {
    var Yelp = require('yelp');

    var yelp = new Yelp(YelpConfig);
    const radius_filter = milesToMeters(radius);

    // See http://www.yelp.com/developers/documentation/v2/search_api
    return(yelp.search({
            radius_filter,
            location,
            category_filter: 'bars'
        }));
}

function milesToMeters(miles){
  return miles*1609.34;
}
