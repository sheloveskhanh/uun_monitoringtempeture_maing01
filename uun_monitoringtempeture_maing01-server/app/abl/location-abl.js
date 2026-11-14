"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/location-error.js");
const Warnings = require("../api/warnings/location-warning.js");

class LocationAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("location");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("locationCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn,
    );

    const existing = await this.dao.getByName(awid, dtoIn.name);
    if (existing) {
      throw new Errors.Create.LocationNameAlreadyExists({ uuAppErrorMap }, { name: dtoIn.name });
    }

    dtoIn.awid = awid;
    const location = await this.dao.create(dtoIn);
    return { ...location, uuAppErrorMap };
  }

  async get(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("locationGetDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Get.UnsupportedKeys.code,
      Errors.Get.InvalidDtoIn,
    );

    const location = await this.dao.get(awid, dtoIn.id);
    if (!location) {
      throw new Errors.Get.LocationDoesNotExist({ uuAppErrorMap }, { locationId: dtoIn.id });
    }

    return { ...location, uuAppErrorMap };
  }

  async list(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("locationListDtoInType", dtoIn);
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

  async update(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("locationUpdateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Update.UnsupportedKeys.code,
      Errors.Update.InvalidDtoIn,
    );

    const location = await this.dao.get(awid, dtoIn.id);
    if (!location) {
      throw new Errors.Update.LocationDoesNotExist({ uuAppErrorMap }, { locationId: dtoIn.id });
    }

    if (dtoIn.name && dtoIn.name !== location.name) {
      const existing = await this.dao.getByName(awid, dtoIn.name);
      if (existing) {
        throw new Errors.Update.LocationNameAlreadyExists({ uuAppErrorMap }, { name: dtoIn.name });
      }
    }

    if (dtoIn.name !== undefined) location.name = dtoIn.name;
    if (dtoIn.description !== undefined) location.description = dtoIn.description;

    const updated = await this.dao.update(location);
    return { ...updated, uuAppErrorMap };
  }

  async delete(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("locationDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Delete.UnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn,
    );

    const location = await this.dao.get(awid, dtoIn.id);
    if (!location) {
      throw new Errors.Delete.LocationDoesNotExist({ uuAppErrorMap }, { locationId: dtoIn.id });
    }

    await this.dao.delete(awid, dtoIn.id);
    return { uuAppErrorMap };
  }
}

module.exports = new LocationAbl();
