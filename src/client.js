"use strict";

var http = require('http');
var fs = require('fs');

var portNumber = 3000;

function makePostRequest(path, data) {
  var dataString = JSON.stringify(data),
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    },
    options = {
      host: 'localhost',
      port: portNumber,
      path: path,
      method: 'POST',
      headers: headers
    },
    req = http.request(options);

  req.write(dataString);
  req.end();
}

function loadFollowsDatabase(path, next) {
  var follows = JSON.parse(fs.readFileSync(path)).operations,
    i,
    followObj,
    data;
  for (i = 0; i < follows.length; i++) {
    followObj = follows[i];
    data = {from: followObj[0], to: followObj[1]};
    makePostRequest('/follow', data);
  }
  next();
}

function loadListenDatabase(path, next) {
  var listen = JSON.parse(fs.readFileSync(path)).userIds,
    userId,
    musicList,
    i,
    data;

  for (userId in listen) {
    if (listen.hasOwnProperty(userId)) {
      musicList = listen[userId];
      for (i = 0; i < musicList.length; i++) {
        data = {user: userId, music: musicList[i]};
        makePostRequest('/listen', data);
      }
    }
  }
  next();
}

function getRecommendations(userId, next) {
  var requestString = 'http://localhost:' + portNumber + '/recommendations?user=' + userId;
  http.get(requestString, next);
}

loadFollowsDatabase('./json/follows.json', function () {
  loadListenDatabase('./json/listen.json', function () {
    getRecommendations('a', function (res) {
      res.on('data', function (chunk) {
        var recommendations = JSON.parse(chunk);
        console.log(JSON.stringify(recommendations, null, ' '));
      });
    });
  });
});
