"use strict";
const MonitoringtempetureMainAbl = require("../../abl/monitoringtempeture-main-abl.js");

class MonitoringtempetureMainController {
  init(ucEnv) {
    return MonitoringtempetureMainAbl.init(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  load(ucEnv) {
    return MonitoringtempetureMainAbl.load(ucEnv.getUri(), ucEnv.getSession());
  }

  loadBasicData(ucEnv) {
    return MonitoringtempetureMainAbl.loadBasicData(ucEnv.getUri(), ucEnv.getSession());
  }
}

module.exports = new MonitoringtempetureMainController();
