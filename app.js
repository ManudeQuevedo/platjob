require('dotenv').config();

const bodyParser        = require('body-parser');
const cookieParser      = require('cookie-parser');
const express           = require('express');
const favicon           = require('serve-favicon');
const hbs               = require('hbs');
const mongoose          = require('mongoose');
const logger            = require('morgan');
const path              = require('path');
const session           = require('express-session');
const bcrypt            = require('bcryptjs');
const passport          = require('passport');
const LocalStrategy     = require('passport-local').Strategy;
const User              = require("./models/user");
const flash             = require("connect-flash");
const MongoStore        = require("connect-mongo")(session);
const mongoDB           = "mongodb://manudequevedo:Amigos10-@ds119692.mlab.com:19692/platjob";
// const Post              = require('./models/post');
// const multer            = require('multer');


mongoose.Promise = Promise;
mongoose.connect(mongoDB || 'mongodb://localhost/platjob', {
    useMongoClient: true
  })
  .then(() => {
    console.log('Connected to Mongo!')
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // Keeps session open for 1 day
  })
}));

passport.serializeUser((userDetails, cb) => {
  cb(null, userDetails._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id)
    .then((userDetails) => {
      cb(null, userDetails);
    })
    .catch((err) => {
      cb(err);
    });
});

app.use(flash());
passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
   User.findOne({
     username
   }, (err, user) => {
     if (err) {
       return next(err);
     }
     if (!user) {
       return next(null, false, {
         message: "Invalid Password or Username"
       });
     }
     if (!bcrypt.compareSync(password, user.password)) {
       return next(null, false, {
         message: "Invalid Password or Username"
       });
     }

     return next(null, user);
   });
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.blahUser = req.user;
  next();
});

// Express View engine setup
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'PlatJob - Generated with IronGenerator';

app.use('/', require('./routes/index'))
app.use('/', require("./routes/auth-routes"));

app.listen(process.env.PORT || 3000),

module.exports = app;