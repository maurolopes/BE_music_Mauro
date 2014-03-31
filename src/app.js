"use strict";

var recommendationSystem = require('./recommendationSystem.js');
var express = require('express');
var app = express();

app.post('/follow', function (req, res) {
  var fromID = req.body.from,
    toID = req.body.to;
  recommendationSystem.follow(fromID, toID);
  res.send(200); //OK
});

app.post('/listen', function (req, res) {
  var userID = req.body.user,
    musicID = req.body.music;
  recommendationSystem.listen(userID, musicID);
  res.send(200); //OK
});

app.get('/recommendations', function (req, res) {
  var userID = req.query.user,
    list = recommendationSystem.getRecommendations(userID),
    response = {list: list};
  res.send(response);
});

var server = app.listen(3000, function () {
  console.log('Listening on port %d', server.address().port);
});
