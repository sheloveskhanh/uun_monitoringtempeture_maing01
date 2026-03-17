"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class ReadingMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, device_eui: 1 });
    await super.createIndex({ awid: 1, processed_at: -1 });
  }

  async create(reading) {
    return await super.insertOne(reading);
  }

  async list(awid, filter = {}, pageInfo = {}) {
    const mongoFilter = { awid };
    if (filter.deviceEui) mongoFilter.device_eui = filter.deviceEui;
    if (filter.from || filter.to) {
      mongoFilter.processed_at = {};
      if (filter.from) mongoFilter.processed_at.$gte = new Date(filter.from);
      if (filter.to) mongoFilter.processed_at.$lte = new Date(filter.to);
    }
    return await super.find(mongoFilter, pageInfo, { processed_at: -1 });
  }

  async getLatestByDeviceEui(awid, deviceEui) {
    const result = await super.find(
      { awid, device_eui: deviceEui },
      { pageIndex: 0, pageSize: 1 },
      { processed_at: -1 }
    );
    return result.itemList?.[0] || null;
  }
}

module.exports = ReadingMongo;