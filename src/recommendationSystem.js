"use strict";

var fs = require('fs');

var followees = {};
var listened = {};

function loadMusicDatabase(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
var musicDatabase = loadMusicDatabase('./json/musics.json');

function follow(fromID, toID) {
  if (followees[fromID] === undefined) {
    followees[fromID] = {};
  }
  followees[fromID][toID] = true;
  console.log(followees);
}

function listen(userID, musicID) {
  if (listened[userID] === undefined) { //new user
    listened[userID] = {};
    listened[userID][musicID] = 1;
  } else if (listened[userID][musicID] === undefined) {
    listened[userID][musicID] = 1; //user listened to this song for the first time
  } else {
    listened[userID][musicID] += 1; //user listened to this song again
  }
  console.log(listened);
}

function getRecommendations(userID) {
  userID = userID + 1;///////////
  return JSON.stringify({followees: followees, listened: listened});
}

exports.follow = follow;
exports.listen = listen;
exports.getRecommendations = getRecommendations;
