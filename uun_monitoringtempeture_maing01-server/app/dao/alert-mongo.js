"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("bson");

class AlertMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, deviceEui: 1 });
    await super.createIndex({ awid: 1, status: 1 });
    await super.createIndex({ awid: 1, createdAt: -1 });
  }

  async create(alert) {
    return await super.insertOne(alert);
  }

  async list(awid, filter = {}, pageInfo = {}) {
    const mongoFilter = { awid };
    if (filter.deviceEui) mongoFilter.deviceEui = filter.deviceEui;
    if (filter.status) mongoFilter.status = filter.status;
    if (filter.severity) mongoFilter.severity = filter.severity;
    if (filter.from || filter.to) {
      mongoFilter.createdAt = {};
      if (filter.from) mongoFilter.createdAt.$gte = new Date(filter.from);
      if (filter.to) mongoFilter.createdAt.$lte = new Date(filter.to);
    }
    return await super.find(mongoFilter, pageInfo, { createdAt: -1 });
  }

  async get(awid, id) {
    return await super.findOne({ awid, id });
  }

  async update(alert) {
    return await super.findOneAndUpdate({ id: alert.id }, alert);
  }

  async delete(awid, id) {
    await super.deleteOne({ awid, id: new ObjectId(id) });
  }
}

module.exports = AlertMongo;
