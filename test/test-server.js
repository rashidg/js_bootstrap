var assert = require('chai').assert;
var superagent = require('superagent');

var server = require('../bin/www');


describe('server', function() {

    beforeEach(function( done ) {
        server.listen(3000, function(err) {
            done(err);
        });
    });

    afterEach(function( done ) {
        server.close(function(err) {
            done(err);
        });
    });


    it('should return 200 for GET /', function( done ) {

        superagent.get('http://localhost:3000/').end(function(err, res) {
            if (err) { return done(err); }
            assert.equal(res.status, 200);
            done();
        });

    });
    it('should return a 404 for GET /foo', function( done ) {
        superagent.get('http://localhost:3000/').end(function(err, res) {
            if (err) {
                assert.equal(res.status, 404);
                return done();
            }
            done(new Error('Request to /foo should have failed'));
        });

    });

});
describe('login/register', function() {
    it('should register', function( done ) {
        superagent.post('http://localhost:3000/register')
                    .send({"email": "user_test@example.com", "password": "123"})
                    .end(function(err, res) {
            if (err) { return done(err); }
            assert.equal(res.status, 200);
            done();
        });
    });
    it('should login', function( done ) {
        superagent.post('http://localhost:3000/login')
                    .send({"email": "user_test@example.com", "password": "123"})
                    .end(function(err, res) {
            if (err) { return done(err); }
            assert.equal(res.status, 200);
            done();
        });
    }); 
});
