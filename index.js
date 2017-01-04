import express from 'express';
import sassMiddleware from 'node-sass-middleware';
import path from 'path';
import router from './routes';

const app = express();

// adding the sass middleware
//http://stackoverflow.com/questions/23711897/get-sass-to-autocompile-with-nodejs-express-and-node-sass
app.use(
   sassMiddleware({
       src: path.join(__dirname, 'sass'),
       dest: __dirname + '/public/stylesheets',
       debug: true,
       prefix:  '/stylesheets'
   })
);

// The static middleware must come after the sass middleware
app.use("/", express.static( path.join( __dirname, 'public' ) ) );
app.set('views', path.join( __dirname, '/views' ));
app.set('view engine', 'ejs');
app.use(router);


app.set('port', (process.env.PORT || 3000));


app.listen(app.get('port'), ()=>{
  console.log('listening on port: ' + app.get('port'));
});
