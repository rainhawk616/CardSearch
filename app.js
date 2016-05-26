/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
require('dotenv').config({path: '../.env', silent: true});

/**
 * Module dependencies.
 */
var express = require('express');
var multer  =   require('multer');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var session = require('express-session');
var sequelize = require('./models/index').sequelize;
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var flash = require('express-flash');
var passport = require('passport');

/**
 * Express configuration.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/**
 * Session configuration
 */
app.use(session({
    name: 'NodeExpressPsql',
    secret: 'rootroot',
    saveUninitialized: true,
    resave: false,
    store: new SequelizeStore({
        db: sequelize,
        checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
        expiration: 24 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session.
    })
}));

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/**
 * Controllers
 */
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});
var externalController = require('./controllers/external.js');
var userController = require('./controllers/user.js');
var adminController = require('./controllers/admin.js');

/**
 * Routes
 */
externalController.registerRoutes(app);
userController.registerRoutes(app);
adminController.registerRoutes(app);

/**
 * Exception handlers
 */
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
