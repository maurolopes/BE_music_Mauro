"use strict";

var fs = require('fs');

var followees = {};
var listened = {};

function loadMusicDatabase(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

//register that a user is following another
function follow(fromId, toId) {
  if (followees[fromId] === undefined) {
    followees[fromId] = {};
  }
  followees[fromId][toId] = true;
  if (followees[toId] === undefined) {
    followees[toId] = {};
  }

  if (listened[fromId] === undefined) {
    listened[fromId] = {};
  }
  if (listened[toId] === undefined) {
    listened[toId] = {};
  }
}

//register that a user listened to a song
function listen(userId, musicId) {
  if (listened[userId] === undefined) { //new user
    listened[userId] = {};
    listened[userId][musicId] = 1;
  } else if (listened[userId][musicId] === undefined) {
    listened[userId][musicId] = 1; //user listened to this song for the first time
  } else {
    listened[userId][musicId]++; //user listened to this song again
  }
}

exports.follow = follow;
exports.listen = listen;
exports.musicDatabase = loadMusicDatabase('./json/musics.json');
exports.listened = listened;
exports.followees = followees;
