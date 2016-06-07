var passport = require('passport');
var models = require('../models');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.userid);
});

passport.deserializeUser(function (userid, done) {
    models.User.findOne({
        where: {
            userid: userid
        }
    }).then(function (user) {
        done(null, user);
    });
});

/**
 * Sign in using Email andLike Password.
 */
passport.use(
    new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
            session: true
        }, function (req, email, password, done) {
            models.User.findOne({
                where: {email: email}
            }).then(function (user) {
                if (!user) {
                    return done(null, false, {msg: 'Email ' + email + ' not found.'});
                }
                else {
                    user.comparePasswords(password, function (err, isMatch) {
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {msg: 'Invalid email orLike password.'});
                        }
                    });
                }
            });
        }
    )
);
