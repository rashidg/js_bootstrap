var User = require('../models/user.js');
var Professions = require('../models/professions');
var Save = require('../config/save');
var Reviews = require('../models/reviews');
var SaveReviews = require('../config/saveReviews');
var user_email;

module.exports = function(app, passport) {

    // Provide base professions, more can be added at the discretion of the admin
    Professions.find(function (err, professions) {
        if (professions.length == 0) {
            var startingProfessions = new Professions();
            startingProfessions.profession = "Electrician";
            startingProfessions.count = 0;
            startingProfessions.save();
            var startingProfessions = new Professions();
            startingProfessions.profession = "Technician";
            startingProfessions.count = 0;
            startingProfessions.save();
            var startingProfessions = new Professions();
            startingProfessions.profession = "Plumber";
            startingProfessions.count = 0;
            startingProfessions.save();
        }
    });

    User.find({'admin': true}, function(err, admin) {
        if (admin.length == 0) {
            var admin = new User();
            admin.local.email = "admin";
            admin.local.name = "admin";
            admin.local.password = admin.generateHash("admin");
            admin.admin = true;
            admin.save();
        }
    });

    app.get('/', function (req, res) {
        //if (req.isAuthenticated())
        //    return res.redirect('/listings.html');

        if(req.user){
            return res.redirect('/listings.html');
        }

        res.render('index', {title: 'WeFixIt', signupError: req.flash('signupMessage'),
            loginError: req.flash('loginMessage'),
            signupSuccess: req.flash('signupSuccess')});
    });

    app.get('/profile.html',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            res.render('profile', {title: 'WeFixIt: SomeProfile', user: req.user});
        }
    );

    app.post('/listings.html',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            var name;
            var email;
            if (req.user.local.email) {
                name = req.user.local.name;
                email = req.user.local.email;
            }
            else if (req.user.facebook.email) {
                name = req.user.facebook.name;
                email = req.user.facebook.email;
            }

            admin = req.user.admin;

            User.find( function (err, users) {
                Professions.find(function (err, profs) {
                    var sel = false;
                    for (k = 0; k < profs.length; k++)
                        if (req.body.hasOwnProperty(profs[k].profession))
                            sel = true;
                    if (!sel) { // if there isn't any selection
                        res.render('listings', {
                            title: 'WeFixIt: Listings', isAdmin: admin, name: name, email: email,
                            people: users, filters: profs });
                    }
                    else { // if there is selection

                        var people = [];
                        for (i = 0; i < users.length; i++) {
                            var found = false;
                            for (j = 0; j < users[i].professions.length; j++)
                                for (k = 0; k < profs.length; k++)
                                    if (req.body.hasOwnProperty(profs[k].profession)) /// add these professions
                                        if (users[i].professions[j] == profs[k].profession)
                                            found = true;
                            if (found)
                                people.push(users[i]);
                        }
                        res.render('listings', {
                            title: 'WeFixIt: Listings', isAdmin: isAdmin, name: name, email: email,
                            people: people, filters: profs});
                    }

                });
            });
        }
    );


    app.get('/listings.html',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            var name;
            var email;
            if (req.user.local.email) {
                name = req.user.local.name;
                email = req.user.local.email;
            }
            else if (req.user.facebook.email) {
                name = req.user.facebook.name;
                email = req.user.facebook.email;
            }

            isAdmin = req.user.admin;

            Professions.find(function (err, profs) {
                User.find(function (err, users) {
                    res.render('listings', {
                        title: 'WeFixIt: Listings', isAdmin: isAdmin, name: name, email: email,
                        people: users, filters: profs });
                });
            });
        }
    );



    app.get('/admin.html',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            if (req.user.admin != true)
                res.redirect('back');
            else
                User.find( function (err, users) {
                    res.render('admin', {title: 'WeFixIt: Admin Panel', people: users});
                });
        }
    );

    app.get('/delete/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            if (req.user.admin != true)
                res.redirect('back');
            else
                User.findOneAndRemove({'_id': req.params.id}, function (err, user) {
                    res.redirect('/admin.html');
                });
        }
    );

    app.get('/suspend/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            if (req.user.admin = true)
                res.redirect('back');
            else
                User.findOne({'_id': req.params.id}, function (err, user) {
                    if (err) throw err;
                    user.suspended = true;
                    user.save(function (err) {
                        if (err) throw err;
                    });
                    res.redirect('/admin.html');
                });
        }
    );

    app.get('/continue/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            if (req.user.admin == true)
                res.redirect('back');
            else
                User.findOne({'_id': req.params.id}, function (err, user) {
                    if (err) throw err;
                    user.suspended = false;
                    user.save(function (err) {
                        if (err) throw err;
                    });
                    res.redirect('/admin.html');
                });
        }
    );

    app.get('/profile', function (req, res) {
        res.redirect('/profile/' + req.user._id);
    });

    app.get('/profile/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            User.findOne({'_id': req.params.id}, function (err, user) {
                if (err) throw err;
                if (req.user.admin = false && req.user.local.email != user.local.email
                        && req.user.facebook.email != user.facebook.email)
                    res.redirect('back');
                else
                    res.render('profile', {user: user, user_email: user_email});
            });
        }
    );

    app.post('/profile/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            User.findOne({'_id': req.params.id} ,function (err, user) {
                if (err) throw err;
                SaveReviews(req, res, user_email);
            });
        }
    );

    app.get('/edit', function (req, res) {
        console.log('redirecting');
        res.redirect('/edit/' + req.user._id);
    });

    app.get('/edit/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            User.findOne({'_id': req.params.id}, function (err, user) {

                if (err) throw err;

                if (req.user.admin = false && req.user.local.email != user.local.email
                        && req.user.facebook.email != user.facebook.email)
                    res.redirect('back');

                else
                // Find all professions and hours to pass to the user profile edit page
                    Professions.find(function (err, professions) {
                        res.render('edit', {user: user, professions: professions});
                    });
            });
        }
    );

    app.post('/edit/:id',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            Save(req, res);
        }
    );

    app.get('/contact',
        require('connect-ensure-login').ensureLoggedIn(),
        function (req, res) {
            User.findOne({'_id': req.params.id}, function (err, user) {
                if (err) throw err;
                else
                // Find all professions and hours to pass to the user profile edit page
                    Professions.find(function (err, professions) {
                        res.render('contact', {user: user, professions: professions});
                    });
            });
        }
    );

    // login/logout stuff
    app.get('/login', function (req, res) { // ensureLoggedIn() redirects to '/login'
        res.redirect('/');
    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.post('old/login', passport.authenticate('local-login', {
        successRedirect: '/listings.html',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', { failureFlash: true },
            function(err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.redirect('/'); }
                user_email = user.local.email

                req.logIn(user, function(err) {

                    if (err) { return next(err); }

                    if (user.admin == true)
                        return res.redirect('/admin.html');

                    return res.redirect('/listings.html');
                });
            })(req, res, next);
    });


    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] } ));

    app.get('/auth/facebook/return', passport.authenticate('facebook', {
        successRedirect: '/listings.html',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
};