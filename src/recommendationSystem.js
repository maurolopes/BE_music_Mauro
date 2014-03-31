"use strict";

var fs = require('fs');

var followees = {};
var listened = {};

function loadMusicDatabase(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
var musicDatabase = loadMusicDatabase('./json/musics.json');

function follow(fromId, toId) {
  if (followees[fromId] === undefined) {
    followees[fromId] = {};
  }
  followees[fromId][toId] = true;
  console.log(followees);
}

function listen(userId, musicId) {
  if (listened[userId] === undefined) { //new user
    listened[userId] = {};
    listened[userId][musicId] = 1;
  } else if (listened[userId][musicId] === undefined) {
    listened[userId][musicId] = 1; //user listened to this song for the first time
  } else {
    listened[userId][musicId] += 1; //user listened to this song again
  }
  console.log(listened);
}

function calculateRecommendations(userId, recommendationCount) {
  userId = userId + recommendationCount;///////////
  return ["aaa", "bbb", "ccc", "ddd", "eee"];
}

exports.follow = follow;
exports.listen = listen;
exports.calculateRecommendations = calculateRecommendations;
