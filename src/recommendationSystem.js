"use strict";

var database = require('./database');

var musicProximities = calculateProximities(database.musicDatabase);

function calculateRecommendations(userId, recommendationCount) {
  var knownSongs = database.listened[userId];
  if (knownSongs === undefined) {
    knownSongs = database.listened[userId] = {};
  }

  //get a recommendation score for each song the user has listened to
  var proximitiesByPlaylist = calculateProximitiesForPlaylist(Object.keys(knownSongs));

  //get a recommendation score for songs of the user's followees
  //maximum distance is 3, so a->b->c->d->e will consider b's, c's and d's songs for a, but not e's
  var proximitiesByFollowings = calculateProximitiesByFollowings(userId, 3);

  //merge the two scores together, with given weights
  var proximitiesCombined = mergeDictsWithWeight(proximitiesByPlaylist, proximitiesByFollowings, 1, 1.1);

  //sort recommendations, best to worst
  var recommendationList = keysSortedByValue(proximitiesCombined).reverse();

  //remove songs the user knows
  var removeKnownSongs = recommendationList.filter(function (musicId) {return knownSongs[musicId] === undefined;});

  //limit results to given number
  var topRecommendations = removeKnownSongs.slice(0, recommendationCount);

  return topRecommendations;
}


///////////////////////////////////////////////////////////////////////////////
// Proximity of songs considering tags

function calculateProximitiesForPlaylist(playlist) {
  var prox = {};
  Object.keys(database.musicDatabase).forEach(function (musicId) {
    prox[musicId] = 0;
  });
  for (var i = 0; i < playlist.length; i++) {
    var myMusic = playlist[i];
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
  var proximities = {};
  for(var i = 0; i < songs.length; i++) {
    proximities[songs[i]] = {};
  }
  for(var i = 0; i < songs.length; i++) {
    for(var j = i + 1; j < songs.length; j++) {
      var proximity = calculateProximity(songs[i], songs[j]);
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

//Regular breadth-first search in a graph
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

      Object.keys(graph[first.node] || {}).forEach(function (node) {
        queue.push({dist: first.dist + 1, node: node});
      });
    }
  }

  return result;
}

//calculate score for songs according to followees preferences
function calculateProximitiesByFollowings (userId, maxDistance) {
  //find followees's followees and their distances, up to maxDistance
  var followeesDistances = bfs(userId, database.followees, maxDistance);

  followeesDistances = followeesDistances.slice(1); //remove first user (self)

  var musicScores = {};

  //each song listened by followee F is scored with the sum of 1/dist(F)
  followeesDistances.forEach(function (bfsObj) {
    var followee = bfsObj.node;
    Object.keys(database.listened[followee]).forEach(function (song) {
      var currentScore = musicScores[song] || 0; //0 if undefined
      var bonus = 1.0 / bfsObj.dist;
      musicScores[song] = currentScore + bonus;
    });
  });

  return musicScores;
}

//dict1={k: 1}, dict2={k: 2} => merged={k: v}, v=1*weight1 + 2*weight2
function mergeDictsWithWeight (dict1, dict2, weight1, weight2) {
  var merged = {};

  Object.keys(dict1).forEach(function (key) {
    merged[key] = dict1[key] * weight1;
  });

  Object.keys(dict2).forEach(function (key) {
    merged[key] = (merged[key] || 0) + dict2[key] * weight2;
  });

  return merged;
}


exports.follow = database.follow;
exports.listen = database.listen;
exports.calculateRecommendations = calculateRecommendations;
