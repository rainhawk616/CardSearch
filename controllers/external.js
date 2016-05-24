var models = require('../models');
//var express = require('express');
var passport = require('passport');

module.exports = {
    registerRoutes: function (app, passportConfig) {
        app.get('/', this.index);
        app.get('/about', this.about);
        app.get('/contact', this.contact);
        app.get('/login', this.login);
        app.post('/login', this.postlogin);
        app.get('/signup', this.signup);
        app.post('/signup', this.postsignup);
        app.get('/logout', this.logout);
    },
    index: function (req, res, next) {
        models.User.findAll().then(function (users) {
            res.render('index', {
                title: 'Index',
                users: users
            });
        });
    },
    about: function (req, res, next) {
        res.render('about', {title: 'About'});
    },
    contact: function (req, res, next) {
        res.render('contact', {title: 'Contact'});
    },
    login: function (req, res, next) {
        res.render('login', {title: 'Login'});
    },
    postlogin: function (req, res, next) {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('password', 'Password cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({remove_dots: false});

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            req.session.save(function () {
                res.redirect('/login');
            });
        }
        else {
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    req.flash('errors', err);
                    req.session.save(function () {
                        res.redirect('/login');
                    });
                }
                else if (!user) {
                    req.flash('errors', info);
                    req.session.save(function () {
                        res.redirect('/login');
                    });
                }
                else {
                    req.logIn(user, function (err) {
                        if (err) {
                            req.flash('errors', err);
                            req.session.save(function () {
                                res.redirect('/login');
                            });
                        }
                        else {
                            req.flash('success', {msg: 'Success! You are logged in.'});
                            req.session.save(function () {
                                res.redirect('/user/dashboard');
                            });
                        }
                    });
                }
            })(req, res, next);
        }
    },
    signup: function (req, res, next) {
        res.render('signup', {title: 'Sign Up'});
    },
    postsignup: function (req, res, next) {
        req.check('email', 'Email is not valid').isEmail();
        req.check('password', 'Password must be at least 4 characters long').len(4);
        req.check('confirmPassword', 'Passwords do not match').equals(req.body.password);
        req.sanitize('email').normalizeEmail({remove_dots: false});

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            req.session.save(function () {
                return res.redirect('/signup');
            });
        }
        else {
            models.User.findOne({
                where: {email: req.body.email}
            }).then(function (user) {
                if (user) {
                    req.flash('errors', {msg: "This email has already been used"});
                    req.session.save(function () {
                        res.redirect('/signup');
                    })
                }
                else {
                    models.User.create({
                        email: req.body.email,
                        password: req.body.password,
                        tos: req.body.tos
                    }).then(function (user) {
                        req.logIn(user, function (err) {
                            if (err) {
                                req.flash('errors', err);
                                req.session.save(function () {
                                    res.redirect('/login');
                                });
                            }
                            else {
                                req.flash('success', {msg: 'Success! You are logged in.'});
                                req.session.save(function () {
                                    res.redirect('/user/dashboard');
                                });
                            }
                        });
                    });
                }
            });
        }
    },
    logout: function (req, res) {
        req.logout();
        req.flash('success', {msg: 'logged out'});
        req.session.save(function () {
            res.redirect('/login');
        });
    }
};