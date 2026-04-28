"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { ObjectId } = require("bson");

class GatewayMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1, uuIdentity: 1 }, { unique: true });
  }

  async create(gateway) {
    return await super.insertOne(gateway);
  }

  async list(awid, filter = {}, pageInfo = {}) {
    const mongoFilter = { awid };
    if (filter.state) mongoFilter.state = filter.state;
    return await super.find(mongoFilter, pageInfo);
  }

  async get(awid, id) {
    return await super.findOne({ awid, id });
  }

  async getByUuIdentity(awid, uuIdentity) {
    return await super.findOne({ awid, uuIdentity });
  }

  async update(gateway) {
    const filter = { id: gateway.id };
    return await super.findOneAndUpdate(filter, gateway);
  }

  async delete(awid, id) {
    await super.deleteOne({ awid, id: new ObjectId(id) });
  }
}

module.exports = GatewayMongo;
