"use strict";
const ReadingAbl = require("../../abl/reading-abl.js");

class ReadingController {
  create(ucEnv) {
    return ReadingAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  list(ucEnv) {
    return ReadingAbl.list(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
}

module.exports = new ReadingController();
