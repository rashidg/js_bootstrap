var User = require('../models/user');
var Reviews = require('../models/reviews');

module.exports = function(req, res, from) {
    addComments(req, res, from);
    res.redirect(req.get('referer'));
};

function addComments(req, res, from) {
    var newReview = new Reviews();
    newReview.to = "to";
    newReview.from = from;
    newReview.text = req.body.description;
    newReview.rating = 0;
    newReview.save();
};