import express from 'express';
const router = express.Router();
import {
    getYelpData
} from './queries';


router.get('/', (req, res) => {
    getYelpData('Durham, NH', 10)
        .then(function(data) {
            const reduced_data = data.businesses.map((bar,i)=>{
              return {
                name: bar.name,
                rating: bar.rating,
                url: bar.url,
                image: bar.image_url
              }
            });
            console.log(reduced_data);
            res.render('pages/home', {data: reduced_data})
        })
        .catch(function(err) {
            console.error(err);
        });
});

export default router;
