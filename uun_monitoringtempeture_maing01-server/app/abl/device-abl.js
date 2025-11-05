"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/device-error.js");
const Warnings = require("../api/warnings/device-warning.js");

class DeviceAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("device");
  }

  async delete(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("deviceDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Delete.UnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn,
    );

    const device = await this.dao.get(awid, dtoIn.id);
    if (!device) {
      throw new Errors.Delete.DeviceDoesNotExist({ uuAppErrorMap }, { deviceId: dtoIn.id });
    }

    await this.dao.delete(awid, dtoIn.id);

    const dtoOut = { uuAppErrorMap };
    return dtoOut;
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("deviceCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn,
    );

    dtoIn.awid = awid;
    const device = await this.dao.create(dtoIn);

    const dtoOut = { ...device, uuAppErrorMap };
    return dtoOut;
  }

  async list(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("deviceListDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.List.UnsupportedKeys.code,
      Errors.List.InvalidDtoIn,
    );

    if (!dtoIn.pageInfo) dtoIn.pageInfo = {};
    dtoIn.pageInfo.pageSize ??= 100;
    dtoIn.pageInfo.pageIndex ??= 0;

    const dtoOut = await this.dao.list(awid, dtoIn.pageInfo);

    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }
}
module.exports = new DeviceAbl();
