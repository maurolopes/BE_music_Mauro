var http = require('http');
var fs = require('fs');

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

function loadFollowsDatabase(path, next) {
  var follows = JSON.parse(fs.readFileSync(path)).operations;
  for(var i = 0; i < follows.length; i++) {
    var followObj = follows[i];
    var data = {from: followObj[0], to: followObj[1]};
    makePostRequest('/follow', data);
  }
  next();
}

function loadListenDatabase(path, next) {
  var listen = JSON.parse(fs.readFileSync(path)).userIds;

  for(var userId in listen) {
    if(listen.hasOwnProperty(userId)) {
      var musicList = listen[userId];
      for(var i = 0; i < musicList.length; i++) {
        var data = {user: userId, music: musicList[i]};
        makePostRequest('/listen', data);
      }
    }
  }
  next();
}

function getRecommendations(userId, next) {
  var requestString = 'http://localhost:' + portNumber + '/recommendations?user=' + userId;
  http.get(requestString, function(res) {
    res.on('data', function(chunk) {
      var recommendations = JSON.parse(chunk);
      console.log(JSON.stringify(recommendations, null, ' '));
    });
  });
}

loadFollowsDatabase('./json/follows.json', function () {
  loadListenDatabase('./json/listen.json', function () {
    var recommendations = getRecommendations('a');
  });
});
