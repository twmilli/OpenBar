import express from 'express';
import sassMiddleware from 'node-sass-middleware';
import path from 'path';
import router from './routes';
import bodyParser from 'body-parser';
import passport from 'passport';
import {Strategy as GitHubStrategy} from 'passport-github2';
import GithubConfig from './GithubConfig';
import session from 'express-session';
var mongo = require("mongodb").MongoClient;
var url = process.env.MONGODB_URI;



const app = express();

// adding the sass middleware
//http://stackoverflow.com/questions/23711897/get-sass-to-autocompile-with-nodejs-express-and-node-sass
app.use(
   sassMiddleware({
       src: path.join(__dirname, 'sass'),
       dest: __dirname + '/public/stylesheets',
       prefix:  '/stylesheets'
   })
);

// The static middleware must come after the sass middleware
app.use("/", express.static( path.join( __dirname, 'public' ) ) );

app.set('views', path.join( __dirname, '/views' ));
app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({
    extended: true
}));
passport.serializeUser((user,done)=>{
  done(null,user);
});

passport.deserializeUser((obj,done)=>{
  done(null, obj);
});

var callbackURL = "http://localhost:3000/login/callback";
if (process.env.NODE_ENV == 'production'){
  callbackURL = "https://open-bar.herokuapp.com/login/callback";
}

passport.use(new GitHubStrategy({
  clientID: GithubConfig.client_id,
  clientSecret: GithubConfig.client_secret,
  callbackURL
},function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    })
  }));

  app.use(session({
          cookieName: 'session',
          secret: 'random string',
          duration: 30 * 60 * 1000,
          activeDuration: 5 * 60 * 1000,
      }));
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(url, (err,db)=>{
  if (err){
    throw err;
  }
  app.use((req,res,next)=>{
    req.db = db;
    next();
  });

  app.use(router);
});


app.listen(app.get('port'), ()=>{
  console.log('listening on port: ' + app.get('port'));
});
