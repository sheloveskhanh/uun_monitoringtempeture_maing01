"use strict";
const DeviceAbl = require("../../abl/device-abl.js");

class DeviceController {
  create(ucEnv) {
    return DeviceAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  list(ucEnv) {
    return DeviceAbl.list(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  setState(ucEnv) {
    return DeviceAbl.setState(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  delete(ucEnv) {
    return DeviceAbl.delete(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
}

module.exports = new DeviceController();
