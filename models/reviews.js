var express = require('express');
var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    to: String,
    from: String,
    text: String,
    rating: Number
});

var Reviews = mongoose.model('Reviews' ,reviewSchema);

module.exports = Reviews;
