var models = require('../models');
//var express = require('express');
var sequelize = require('../models/index').sequelize;
var passport = require('passport');
var Promise = require("bluebird");
var cookieParser = require('cookie-parser');

module.exports = {
    registerRoutes: function (app) {
        app.get('/', this.index);
        app.get('/about', this.about);
        app.get('/contact', this.contact);
        app.get('/login', this.login);
        app.post('/login', this.postlogin);
        app.get('/signup', this.signup);
        app.post('/signup', this.postsignup);
        app.get('/logout', this.logout);
        app.get('/search', this.search);
        app.get('/results', this.getResults);
    },
    index: function (req, res) {
        models.User.findAll().then(function (users) {
            res.render('index', {
                title: 'Index',
                users: users
            });
        });
    },
    about: function (req, res) {
        res.render('about', {title: 'About'});
    },
    contact: function (req, res) {
        res.render('contact', {title: 'Contact'});
    },
    login: function (req, res) {
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
    signup: function (req, res) {
        res.render('signup', {title: 'Sign Up'});
    },
    postsignup: function (req, res) {
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
    },
    search: function (req, res) {
        var supertypes = models.Supertype.findAll();
        var types = models.Type.findAll();
        var subtypes = models.Subtype.findAll();

        Promise.all([supertypes, types, subtypes])
            .spread(function (supertypes, types, subtypes) {
                res.render('search', {
                    title: 'Search',
                    supertypes: supertypes,
                    types: types,
                    subtypes: subtypes
                });
            });
    },
    getResults: function (req, res) {
        console.log("req.cookies:", JSON.stringify(req.cookies, null, 2));

        var where = {};
        var order = [];
        var i = 0;
        var query = JSON.parse(req.cookies.query);
        var page = parseInt(req.query.page);
        if (isNaN(page))
            page = 1;
        var limit = 50;
        var offset = (page - 1) * limit;
        ;

        for (var key in query) {
            if (query.hasOwnProperty(key)) {
                var clause = query[key];
                var field = clause['field'].toLowerCase();
                var operator = clause['operator'];
                var comparator = clause['comparator'];
                var value = clause['value'];

                /*
                 Like fields
                 */
                if (field === 'name'
                    || field === 'text') {
                    if (operator === 'and') {
                        andLike(where, field, value);
                    }
                    else if (operator === 'or') {
                        orLike(where, field, value);
                    }
                    else if (operator === 'not') {
                        notLike(where, field, value);
                    }
                }

                /*
                 Type fields
                 */
                if (field === 'supertypes'
                    || field === 'types'
                    || field === 'subtypes') {
                    if (operator === 'and') {
                        andContains(where, field, value);
                    }
                    else if (operator === 'or') {
                        orContains(where, field, value);
                    }
                    else if (operator === 'not') {
                        notContains(where, field, value);
                    }
                }

                /*
                 Colors
                 */
                if (field === 'coloridentity') {
                    if (operator === 'and') {
                        andContains(where, field, value.toUpperCase());
                    }
                    else if (operator === 'not') {
                        notContains(where, field, value.toUpperCase());
                    }
                }

                /*
                 Ordering
                 */
                if (field === 'order') {
                    if (operator === 'ascending') {
                        order.push([value.toLowerCase(), 'ASC NULLS FIRST']);
                    }
                    else if (operator === 'descending') {
                        order.push([value.toLowerCase(), 'DESC NULLS LAST']);
                    }
                }
            }
        }

        /*
         Add default ordering
         */
        if (order.length === 0) {
            order.push(['name', 'asc']);
        }

        console.log('where:', JSON.stringify(where, null, 2));
        console.log('order:', JSON.stringify(order, null, 2));

        models.Card.findAndCount({
            where: where,
            order: order,
            limit: limit,
            offset: offset
        }).then(function (result) {

            res.render('results', {
                title: 'Results',
                results: result.rows,
                where: where,
                order: order,
                limit: limit,
                offset: offset,
                page: page,
                pages: (result.count / limit) + 1
            });
        });
    }
};

function andLike(where, fieldName, value) {
    like(where, '$and', fieldName, value);
}

function orLike(where, fieldName, value) {
    like(where, '$or', fieldName, value);
}

function notLike(where, fieldName, value) {
    like(where, '$and', fieldName, value, true);
}

function like(where, operator, fieldName, value, not) {
    if (value === null || value === undefined || value === '')
        return;

    if (where === null || where === undefined)
        throw new Error('test');

    if (!where.hasOwnProperty(fieldName)) {
        where[fieldName] = {};
    }

    var field = where[fieldName];

    if (!field.hasOwnProperty('$and')) {
        field['$and'] = {};
    }
    var outerAndOperator = field['$and'];

    if (!outerAndOperator.hasOwnProperty(operator)) {
        outerAndOperator[operator] = [];
    }
    var innerOperator = outerAndOperator[operator];

    var clause = {};
    clause[(not ? '$notILike' : '$iLike')] = '%' + value + '%';

    innerOperator.push(clause);
}

function andContains(where, fieldName, value) {
    if (!where.hasOwnProperty(fieldName)) {
        where[fieldName] = {};
    }
    var field = where[fieldName];

    if (!field.hasOwnProperty('$and')) {
        field['$and'] = {};
    }
    var outerAndOperator = field['$and'];

    if (!outerAndOperator.hasOwnProperty('$contains')) {
        outerAndOperator['$contains'] = [];
    }
    var contains = outerAndOperator['$contains'];

    contains.push(value);
}

function orContains(where, fieldName, value) {
    if (!where.hasOwnProperty(fieldName)) {
        where[fieldName] = {};
    }
    var field = where[fieldName];

    if (!field.hasOwnProperty('$and')) {
        field['$and'] = {};
    }
    var outerAndOperator = field['$and'];

    if (!outerAndOperator.hasOwnProperty('$or')) {
        outerAndOperator['$or'] = [];
    }
    var or = outerAndOperator['$or'];

    or.push({"$contains": value});
}

function notContains(where, fieldName, value) {
    if (!where.hasOwnProperty(fieldName)) {
        where[fieldName] = {};
    }
    var field = where[fieldName];

    if (!field.hasOwnProperty('$and')) {
        field['$and'] = {};
    }
    var outerAndOperator = field['$and'];

    if (!outerAndOperator.hasOwnProperty('$and')) {
        outerAndOperator['$and'] = [];
    }
    var and = outerAndOperator['$and'];

    //'(NOT "Card"."'+fieldName+'" @>  \'["' + value + '"]\') or ("Card"."'+fieldName+'" @>  \'["' + value + '"]\' is unknown)'
    and.push(sequelize.literal('((NOT "Card"."' + fieldName + '" @>  \'["' + value + '"]\') or ("Card"."' + fieldName + '" @>  \'["' + value + '"]\' is unknown))'));
}
