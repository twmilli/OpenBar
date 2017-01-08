'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeSassMiddleware = require('node-sass-middleware');

var _nodeSassMiddleware2 = _interopRequireDefault(_nodeSassMiddleware);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportGithub = require('passport-github2');

var _GithubConfig = require('./GithubConfig');

var _GithubConfig2 = _interopRequireDefault(_GithubConfig);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongo = require("mongodb").MongoClient;
var url = process.env.MONGODB_URI;

var app = (0, _express2.default)();

// adding the sass middleware
//http://stackoverflow.com/questions/23711897/get-sass-to-autocompile-with-nodejs-express-and-node-sass
app.use((0, _nodeSassMiddleware2.default)({
  src: _path2.default.join(__dirname, 'sass'),
  dest: __dirname + '/public/stylesheets',
  prefix: '/stylesheets'
}));

// The static middleware must come after the sass middleware
app.use("/", _express2.default.static(_path2.default.join(__dirname, 'public')));

app.set('views', _path2.default.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || 3000);

app.use(_bodyParser2.default.urlencoded({
  extended: true
}));
_passport2.default.serializeUser(function (user, done) {
  done(null, user);
});

_passport2.default.deserializeUser(function (obj, done) {
  done(null, obj);
});

_passport2.default.use(new _passportGithub.Strategy({
  clientID: _GithubConfig2.default.client_id,
  clientSecret: _GithubConfig2.default.client_secret,
  callbackURL: "http://localhost:3000/login/callback"
}, function (accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {

    // To keep the example simple, the user's GitHub profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the GitHub account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
  });
}));

app.use((0, _expressSession2.default)({
  cookieName: 'session',
  secret: 'random string',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

mongo.connect(url, function (err, db) {
  if (err) {
    throw err;
  }
  app.use(function (req, res, next) {
    req.db = db;
    next();
  });

  app.use(_routes2.default);
});

app.listen(app.get('port'), function () {
  console.log('listening on port: ' + app.get('port'));
});