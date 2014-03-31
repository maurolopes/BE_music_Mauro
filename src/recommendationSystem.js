"use strict";

function follow(fromID, toID) {
  console.log(fromID + ' ' + toID);
}

function listen(userID, musicID) {
  console.log(userID + ' ' + musicID);
}

function getRecommendations(userID) {
  console.log(userID);
}

exports.follow = follow;
exports.listen = listen;
exports.getRecommendations = getRecommendations;
