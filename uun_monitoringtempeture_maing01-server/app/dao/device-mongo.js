"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("bson");

class DeviceMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, uuThing: 1 }, { unique: true });
  }

  async create(device) {
    return await super.insertOne(device);
  }

  async list(awid, pageInfo = {}) {
    const filter = { awid };

    return await super.find(filter, pageInfo);
  }

  async delete(awid, id) {
    await super.deleteOne({ awid, id: new ObjectId(id) });
  }

  async get(awid, id) {
    return await super.findOne({
      awid,
      id,
    });
  }
}

module.exports = DeviceMongo;
