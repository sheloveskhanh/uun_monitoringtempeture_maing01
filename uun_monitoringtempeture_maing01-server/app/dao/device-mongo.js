"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("bson");

const VALID_STATES = ["initial", "active", "suspended", "closed", "cancelled"];

class DeviceMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, deviceEui: 1 }, { unique: true });
  }

  async create(device) {
    return await super.insertOne(device);
  }

  async list(awid, filter = {}, pageInfo = {}) {
    const mongoFilter = { awid };
    if (filter.state) mongoFilter.state = filter.state;
    return await super.find(mongoFilter, pageInfo);
  }

  async delete(awid, id) {
    await super.deleteOne({ awid, id: new ObjectId(id) });
  }

  async get(awid, id) {
    return await super.findOne({ awid, id });
  }

  async getByDeviceEui(awid, deviceEui) {
    return await super.findOne({ awid, deviceEui });
  }

  async update(device) {
    const filter = { id: device.id };
    return await super.findOneAndUpdate(filter, device);
  }
}

module.exports = DeviceMongo;
