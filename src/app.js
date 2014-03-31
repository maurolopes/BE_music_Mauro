"use strict";

var recommendationSystem = require('./recommendationSystem.js');
var express = require('express');
var app = express();

app.configure(function () {
  app.use(express.bodyParser());
});

app.post('/follow', function (req, res) {
  var fromId = req.body.from;
  var toId = req.body.to;

  if (fromId === undefined || toId === undefined) {
    res.send(400); //Bad request
  } else {
    recommendationSystem.follow(fromId, toId);
    res.send(200); //OK
  }
});

app.post('/listen', function (req, res) {
  var userId = req.body.user;
  var musicId = req.body.music;

  if (userId === undefined || musicId === undefined) {
    res.send(400); //Bad request
  } else {
    recommendationSystem.listen(userId, musicId);
    res.send(200); //OK
  }
});

app.get('/recommendations', function (req, res) {
  var userId = req.query.user;

  if (userId === undefined) {
    res.send(400); //Bad request
  } else {
    var list = recommendationSystem.calculateRecommendations(userId, 5);
    var response = {list: list};
    res.send(response);
  }
});

var server = app.listen(3000, function () {
  console.log('Listening on port %d', server.address().port);
});
