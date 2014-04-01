"use strict";

var http = require('http');
var fs = require('fs');
var async = require('async');

var portNumber = 3000;

function makePostRequest(path, data) {
  var dataString = JSON.stringify(data);
  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': dataString.length
  };
  var options = {
    host: 'localhost',
    port: portNumber,
    path: path,
    method: 'POST',
    headers: headers
  };
  var req = http.request(options);

  req.write(dataString);
  req.end();
}

function loadFollowsDatabase(path, callback) {
  fs.readFile(path, function (err, fileContents) {
    if (err) { throw err; }

    var follows = JSON.parse(fileContents).operations;

    async.each(follows,
               function (followObj, next) {
                 var data = {from: followObj[0], to: followObj[1]};
                 makePostRequest('/follow', data);
                 next();
               }, callback);
  });
}

function loadListenDatabase(path, callback) {
  fs.readFile(path, function (err, fileContents) {
    if (err) { throw err; }

    var listen = JSON.parse(fileContents).userIds;

    async.each(Object.keys(listen),
               function (userId, next) {
                 var musicList = listen[userId];
                 musicList.forEach(function (music) {
                   var data = {user: userId, music: music};
                   makePostRequest('/listen', data);
                 });
                 next();
               }, callback);
  });
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
