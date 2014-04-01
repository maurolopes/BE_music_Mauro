"use strict";

var database = require('./database');

var musicProximities = calculateProximities(database.musicDatabase);

function calculateRecommendations(userId, recommendationCount) {
  //get top five proximities, decreasing order

  //var topProximities = keysSortedByValue(musicProximities[userId]).slice(-recommendationCount).reverse();

  if (database.listened[userId] === undefined) {
    database.listened[userId] = {};
  }

  var prox = calculateProximitiesForList(Object.keys(database.listened[userId]));

//  return keysSortedByValue(prox).slice(-recommendationCount).reverse();

  calculateProximitiesByFollowings(userId);

  return bfs(userId, database.followees, 12345);
}


///////////////////////////////////////////////////////////////////////////////
// Proximity of songs considering tags

function calculateProximitiesForList(musicList) {
  var prox = {};
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

//returns a higher number for more similar songs
function calculateProximity(song1, song2) {
  //for a larger database, this must be optimized
  var intersection = database.musicDatabase[song1].filter(function (tag) {
    return database.musicDatabase[song2].indexOf(tag) != -1;
  });
  return intersection.length;
}

//calls calculateProximity for all pairs of songs
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


///////////////////////////////////////////////////////////////////////////////
// Recommended songs considering user's followees

//Breadth-first search
function bfs (start, graph, maxDistance) {
  if (maxDistance === undefined) {
    maxDistance = Infinity;
  }
  var visited = {};
  var result = [];
  var queue = [{dist: 0, node: start}];

  for (var first = queue[0];
       queue.length > 0 && first.dist <= maxDistance;
       queue = queue.slice(1), first = queue[0]) {

    if (visited[first.node] === undefined) {

      result.push(first);
      visited[first.node] = true;

      Object.keys(graph[first.node]).forEach(function (node) {
        queue.push({dist: first.dist + 1, node: node});
      });
    }
  }

  return result;
}

function calculateProximitiesByFollowings (userId) {
  var maxDistance = 3; //limit range of influence
  var followeesDistances = bfs(userId, database.followees, maxDistance);

  followeesDistances = followeesDistances.slice(1); //remove first user (self)

  var musicScores = {};

  followeesDistances.forEach(function (bfsObj) {
    var followee = bfsObj.node;
console.log(followee + ' ' + Object.keys(database.listened[followee]))
    Object.keys(database.listened[followee]).forEach(function (song) {
      var currentScore = musicScores[song] || 0; //0 if undefined
      var bonus = 1.0 / bfsObj.dist;
      musicScores[song] = currentScore + bonus;
      console.log(song + ' ' + followee)
    });
  });

  console.log(musicScores, null, ' ');
}


exports.follow = database.follow;
exports.listen = database.listen;
exports.calculateRecommendations = calculateRecommendations;
