var User = require('../models/user');
var Professions = require('../models/professions');

module.exports = function(req, res) {
    User.findOne({'_id': req.params.id}, function (err, user) {
        if (err) throw err;
        if (req.user.local.email != 'admin' && req.user.local.email != user.local.email && req.user.facebook.email != user.facebook.email)
            res.redirect('back');
        else if (user.local.email) {
            user.local.email = req.body.new_email;
            user.local.name = req.body.new_name;
        }
        if (user.facebook.email) {
            user.facebook.email = req.body.new_email;
            user.facebook.name = req.body.new_name;
        }
        updateProfession(user, user.professions[0], req.body.new_primary, 0);
        updateProfession(user, user.professions[1], req.body.new_secondary, 1);
        updateProfession(user, user.professions[2], req.body.new_other1, 2);
        updateProfession(user, user.professions[3], req.body.new_other2, 3);
        updateProfession(user, user.professions[4], req.body.new_other3, 4);
        user.phone = req.body.phone;
        user.education = req.body.education;
        user.experience = req.body.experience;
        user.availability = req.body.availability;
        user.aboutme = req.body.aboutme;
        user.save();

        if (req.user.local.email == 'admin')
            res.redirect('/admin.html');
        else
            res.redirect('/listings.html');
    });
};

function updateProfession(user, previous, current, index) {
    if (current == "Select a Profession") {
        return;
    }
    if (current != previous) {
        Professions.find(function (err, professions) {
            var i = 0;
            for (i = 0; i < professions.length; i++) {
                if (professions[i].profession == previous) {
                    professions[i].count --;
                }
                if (professions[i].profession == current) {
                    professions[i].count ++;
                }
                professions[i].save();
            }
            user.professions.set(index, current);
            user.save();
        });
    }
};