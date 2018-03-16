/**
 * Created by rashid-laptop on 2016-03-29.
 */

var LocalStrategy = require('passport-local').Strategy;
var fbStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport) {

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    
    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done)
        {
            process.nextTick(function () {
                User.findOne({ 'local.email': email}, function(err, user){
                    if (err)
                        return done(err);
                    if (user){
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    }
                    else
                    {
                        var newUser = new User();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.name = req.body.first_name + ' ' + req.body.last_name;
                        newUser.save(function(err){
                            if (err)
                                throw err;
                            return done(null, newUser, req.flash('signupSuccess', 'Registration Successful'));
                        });
                    }
                })
            });
        })
    );


    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function () {
                User.findOne({ 'local.email' :  email }, function(err, user) {

                    if (err)
                        return done(err);

                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No User found'));

                    if (user.suspended)
                        return done(null, false, req.flash('loginMessage', 'This account has been suspended. Please contact an administrator.'));

                    if (!user.validPassword(password)){
                        user.loginAttempts = user.loginAttempts + 1;
                        if(user.loginAttempts > 5){
                            user.suspended = true;
                            user.save();
                            return done(null, false, req.flash('loginMessage', 'Too many incorrect passwords. This account has been suspended. Please contact an administrator.'));
                        }
                        user.save();
                        return done(null, false, req.flash('loginMessage', 'Wrong password'));
                    }
                    user.loginAttempts = 0;
                    return done(null, user);
                });
            });

        }));
    


    passport.use('facebook', new fbStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'email', 'name'],
            passReqToCallback : true
        },
        function(req, accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({'facebook.id' : profile.id}, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        if (user.suspended)
                            return done(null, false, req.flash('loginMessage', 'Your account is suspended'));
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;
                        //newUser.professions.push('Programmer');
                        newUser.rating = '5.0';
                        newUser.suspended = false;
                        for (i=0;i<5;i++)
                            newUser.professions.push("");
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
            //done(null, profile);
        }));

};