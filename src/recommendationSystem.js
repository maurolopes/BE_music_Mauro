"use strict";

var database = require('./database');

var musicProximities = calculateProximities(database.musicDatabase);

function calculateRecommendations(userId, recommendationCount) {
  //get top five proximities, decreasing order
  //console.log(userId)
  //console.log(Object.keys(musicProximities))
  //var topProximities = keysSortedByValue(musicProximities[userId]).slice(-recommendationCount).reverse();

  return calculateProximitiesForList(Object.keys(database.listened[userId]));
}

exports.calculateRecommendations = calculateRecommendations;

function calculateProximitiesForList(musicList) {
  var prox = {}
  Object.keys(database.musicDatabase).forEach(function (musicId) {
    prox[musicId] = 0;
  });
  for (var i = 0; i < musicList.length; i++) {
    var myMusic = musicList[i];
    Object.keys(database.musicDatabase).forEach(function (musicId) {
      if (musicId !== myMusic) {
        prox[musicId] += musicProximities[myMusic][musicId];
      }
    });
  }

  return prox;
}

function calculateProximity(song1, song2) {
  //for a larger database, this must be optimized
  var intersection = database.musicDatabase[song1].filter(function (tag) {
    return database.musicDatabase[song2].indexOf(tag) != -1;
  });
  return intersection.length;
}

function calculateProximities(musicDatabase) {
  var songs = Object.keys(musicDatabase);
  var i;
  var j;
  var proximity;
  var proximities = {};
  for(i = 0; i < songs.length; i++) {
    proximities[songs[i]] = {};
  }
  for(i = 0; i < songs.length; i++) {
    for(j = i + 1; j < songs.length; j++) {
      proximity = calculateProximity(songs[i], songs[j]);
      proximities[songs[i]][songs[j]] = proximity;
      proximities[songs[j]][songs[i]] = proximity;
    }
  }

  return proximities;
}

function keysSortedByValue(obj) {
  return Object
           .keys(obj)
           .sort(function (a,b) {
    return obj[a] - obj[b];
  });
}

exports.follow = database.follow;
exports.listen = database.listen;
