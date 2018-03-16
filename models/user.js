var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({

  local: {
    email: String,
    password: String,
    name: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  professions: [],
  rating: {type: String, default: "Unrated"},
  suspended: {type: Boolean, default: false},
  admin: {type: Boolean, default: false},
  canPost: {type: Boolean, default: true},
  phone: {type: String, default: "No Phone Number Listed"},
  education: {type: String, default: "No Certifications Listed"},
  experience: {type: String, default: ""},
  loginAttempts: {type: Number, default: 0},
  availability: {type: String, default: "Availability not listed"},
  aboutme: {type: String, default: "Hello world!"}

});

userSchema.methods.validPassword = function( pwd ) {
  return bcrypt.compareSync(pwd, this.local.password);
};
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};

var User = mongoose.model('User' ,userSchema);

module.exports = User;
