"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("bson");

class LocationMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, name: 1 }, { unique: true });
  }

  async create(location) {
    return await super.insertOne(location);
  }

  async get(awid, id) {
    return await super.findOne({ awid, id });
  }

  async getByName(awid, name) {
    return await super.findOne({ awid, name });
  }

  async list(awid, pageInfo = {}) {
    return await super.find({ awid }, pageInfo);
  }

  async update(location) {
    return await super.findOneAndUpdate({ id: location.id }, location);
  }

  async delete(awid, id) {
    await super.deleteOne({ awid, id: new ObjectId(id) });
  }
}

module.exports = LocationMongo;
