var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var index = require('./routes/index');
var user = require('./routes/user');
var app = express();
var url = 'mongodb://ayushsood:bloodycool@bigdataproject-shard-00-00-t2zn5.mongodb.net:27017,bigdataproject-shard-00-01-t2zn5.mongodb.net:27017,bigdataproject-shard-00-02-t2zn5.mongodb.net:27017/bookEcommerce?ssl=true&replicaSet=BigDataProject-shard-0&authSource=admin';
mongoose.connect(url,{useMongoClient:true});
var db=mongoose.connection;
require('./config/passport');
// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
//ELASTIC SEARCH
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    accessKeyId: 'AKIAJNMBTNOGXKRZCUTQ',
    secretAccessKey : '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',
    service : 'es',
    log: 'trace',
    region: 'us-west-2',
    host: 'search-bookecommerce-hwglvcrguky6kzxyvfhfjw7rea.us-east-2.es.amazonaws.com'
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

// create an elasticsearch client for your Amazon ES
let es = require('elasticsearch').Client({
    hosts: [ 'https://search-bookecommerce-hwglvcrguky6kzxyvfhfjw7rea.us-east-2.es.amazonaws.com' ],
    connectionClass: require('http-aws-es')
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/', user);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
