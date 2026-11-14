"use strict";
const LocationAbl = require("../../abl/location-abl.js");

class LocationController {
  create(ucEnv) {
    return LocationAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  get(ucEnv) {
    return LocationAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  list(ucEnv) {
    return LocationAbl.list(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  update(ucEnv) {
    return LocationAbl.update(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  delete(ucEnv) {
    return LocationAbl.delete(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
}

module.exports = new LocationController();
