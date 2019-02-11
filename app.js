require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const jquery       = require("jquery")
const User         = require("./models/user")
const flash         = require('connect-flash');

const bcrypt       = require("bcrypt");
const session      = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport     = require("passport");
const LocalStrategy = require("passport-local").Strategy;


mongoose
  .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



// passport middleware
app.use(session({
  secret: "LP",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));


passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


passport.use(new LocalStrategy({usernameField: "email"}, (username, password, next) => {
  User.findOne({ email:username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });

    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }
    
    return next(null, user);
  });
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
console.log(__dirname)
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';


const index = require('./routes/index');
app.use('/', index);

const auth = require("./routes/auth")
app.use("/auth", auth)

const archiv = require("./routes/archiv")
app.use("/archiv", archiv)

module.exports = app;
