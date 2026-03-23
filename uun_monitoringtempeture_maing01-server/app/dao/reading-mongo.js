"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class ReadingMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, deviceEui: 1 });
    await super.createIndex({ awid: 1, processedAt: -1 });
  }

  async create(reading) {
    return await super.insertOne(reading);
  }

  async list(awid, filter = {}, pageInfo = {}) {
    const mongoFilter = { awid };
    if (filter.deviceEui) mongoFilter.deviceEui = filter.deviceEui;
    if (filter.from || filter.to) {
      mongoFilter.processedAt = {};
      if (filter.from) mongoFilter.processedAt.$gte = new Date(filter.from);
      if (filter.to) mongoFilter.processedAt.$lte = new Date(filter.to);
    }
    return await super.find(mongoFilter, pageInfo, { processedAt: -1 });
  }
}

module.exports = ReadingMongo;
