"use strict";

var supertest = require('supertest');
var app = require('../src/app.js').app;
var assert = require('assert');

describe('Recommendation system:', function () {

  describe('POST /follow', function () {
    it('should return an error code if some parameters are missing', function (done) {
      supertest(app)
        .post('/follow')
        .end(function (err, res) {
          assert.equal(res.statusCode, 400); //Bad request
          done();
        });
    });

    it('should correctly add a follower', function (done) {
      supertest(app)
        .post('/follow')
        .send({from: "user123", to: "user456"})
        .end(function (err, res) {
          assert.equal(res.statusCode, 200); //OK
          done();
        });
    });
  })


  describe('POST /listen', function () {
    it('should return an error code if some parameters are missing', function (done) {
      supertest(app)
        .post('/listen')
        .end(function (err, res) {
          assert.equal(res.statusCode, 400); //Bad request
          done();
        });
    });

    it('should correctly add a listened song', function (done) {
      supertest(app)
        .post('/listen')
        .send({user: "user123", music: "music123"})
        .end(function (err, res) {
          assert.equal(res.statusCode, 200); //OK
          done();
        });
    });
  })


  describe('GET /recommendations', function () {
    it('should return an error code if some parameters are missing', function (done) {
      supertest(app)
        .get('/recommendations')
        .end(function (err, res) {
          assert.equal(res.statusCode, 400); //Bad request
          done();
        });
    });

    it('should return an object with a list of 5 strings', function (done) {
      supertest(app)
        .get('/recommendations?user=missinguser')
        .end(function (err, res) {
          assert.equal(res.statusCode, 200); //OK
          assert.notEqual(res.body, undefined);
          assert.notEqual(res.body.list, undefined);
          assert.equal(res.body.list.length, 5);
          done();
        });
    });
  })
});
