"use strict";

var http = require('http');
var request = require('request');
var fs = require('fs');
var async = require('async');

var portNumber = 3000;

function makePostRequest(path, data, callback) {
  var dataString = JSON.stringify(data);

  var options = {
    method: 'POST',
    url: 'http://localhost:' + portNumber + path,
    body: dataString,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    }
  };

  request(options, callback);
}

function loadFollowsDatabase(path, callback) {
  fs.readFile(path, function (err, fileContents) {
    if (err) { throw err; }

    var follows = JSON.parse(fileContents).operations;

    async.each(follows,
               function (followObj, next) {
                 var data = {from: followObj[0], to: followObj[1]};
                 makePostRequest('/follow', data,
                                 function (err, response, body) {
                                   if (!err && response.statusCode == 200) {
                                     next();
                                   }
                                 });
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
                 async.each(musicList, function (music, next2) {
                   var data = {user: userId, music: music};
                   makePostRequest('/listen', data,
                                  function (err, response, body) {
                                   if (!err && response.statusCode == 200) {
                                     next2();
                                   }
                                  });
                 }, next);
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
