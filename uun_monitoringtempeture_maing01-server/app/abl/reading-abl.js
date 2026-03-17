"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/reading-error.js");
const Warnings = require("../api/warnings/reading-warning.js");

class ReadingAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("reading");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("readingCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    dtoIn.awid = awid;
    if (!dtoIn.processed_at) {
      dtoIn.processed_at = new Date().toISOString();
    }

    const reading = await this.dao.create(dtoIn);
    return { ...reading, uuAppErrorMap };
  }

  async list(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("readingListDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.List.UnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );

    if (!dtoIn.pageInfo) dtoIn.pageInfo = {};
    dtoIn.pageInfo.pageSize ??= 100;
    dtoIn.pageInfo.pageIndex ??= 0;

    const filter = {
      deviceEui: dtoIn.deviceEui,
      from: dtoIn.from,
      to: dtoIn.to,
    };

    const dtoOut = await this.dao.list(awid, filter, dtoIn.pageInfo);
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }
}

module.exports = new ReadingAbl();
