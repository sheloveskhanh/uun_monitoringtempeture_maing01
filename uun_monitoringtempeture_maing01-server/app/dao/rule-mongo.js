"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("bson");

class RuleMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, deviceEui: 1 }, { unique: true });
  }

  async create(rule) {
    return await super.insertOne(rule);
  }

  async list(awid, filter = {}, pageInfo = {}) {
    const mongoFilter = { awid };
    if (filter.deviceEui) mongoFilter.deviceEui = filter.deviceEui;
    return await super.find(mongoFilter, pageInfo);
  }

  async get(awid, id) {
    return await super.findOne({ awid, id });
  }

  async getByDeviceEui(awid, deviceEui) {
    return await super.findOne({ awid, deviceEui });
  }

  async update(rule) {
    return await super.findOneAndUpdate({ id: rule.id }, rule);
  }

  async delete(awid, id) {
    await super.deleteOne({ awid, id: new ObjectId(id) });
  }
}

module.exports = RuleMongo;
