var express = require('express');
var mongoose = require('mongoose');

var professionSchema = new mongoose.Schema({
    profession: String,
    count: Number
});

var Professions = mongoose.model('Professions' ,professionSchema);

module.exports = Professions;
