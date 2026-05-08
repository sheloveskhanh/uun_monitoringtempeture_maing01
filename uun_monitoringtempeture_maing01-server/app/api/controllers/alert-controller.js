"use strict";
const AlertAbl = require("../../abl/alert-abl.js");

class AlertController {
  create(ucEnv) {
    return AlertAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  list(ucEnv) {
    return AlertAbl.list(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  acknowledge(ucEnv) {
    return AlertAbl.acknowledge(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  delete(ucEnv) {
    return AlertAbl.delete(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
}

module.exports = new AlertController();
