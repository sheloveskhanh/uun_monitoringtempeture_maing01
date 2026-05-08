"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/rule-error.js");
const Warnings = require("../api/warnings/rule-warning.js");

class RuleAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("rule");
    this.deviceDao = DaoFactory.getDao("device");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("ruleCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn,
    );

    const device = await this.deviceDao.getByDeviceEui(awid, dtoIn.deviceEui);
    if (!device) {
      throw new Errors.Create.DeviceNotFound({ uuAppErrorMap }, { deviceEui: dtoIn.deviceEui });
    }
    if (device.state !== "active") {
      throw new Errors.Create.DeviceIsNotActive({ uuAppErrorMap }, { deviceEui: dtoIn.deviceEui, currentState: device.state });
    }

    const existing = await this.dao.getByDeviceEui(awid, dtoIn.deviceEui);
    if (existing) {
      throw new Errors.Create.RuleAlreadyExists({ uuAppErrorMap }, { deviceEui: dtoIn.deviceEui });
    }

    dtoIn.awid = awid;
    const rule = await this.dao.create(dtoIn);
    return { ...rule, uuAppErrorMap };
  }

  async list(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("ruleListDtoInType", dtoIn);
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

    const dtoOut = await this.dao.list(awid, { deviceEui: dtoIn.deviceEui }, dtoIn.pageInfo);
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }

  async update(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("ruleUpdateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Update.UnsupportedKeys.code,
      Errors.Update.InvalidDtoIn,
    );

    const rule = await this.dao.get(awid, dtoIn.id);
    if (!rule) {
      throw new Errors.Update.RuleNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    if (dtoIn.minC !== undefined) rule.minC = dtoIn.minC;
    if (dtoIn.maxC !== undefined) rule.maxC = dtoIn.maxC;
    if (dtoIn.batteryLowV !== undefined) rule.batteryLowV = dtoIn.batteryLowV;

    const updated = await this.dao.update(rule);
    return { ...updated, uuAppErrorMap };
  }

  async delete(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("ruleDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Delete.UnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn,
    );

    const rule = await this.dao.get(awid, dtoIn.id);
    if (!rule) {
      throw new Errors.Delete.RuleNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    await this.dao.delete(awid, dtoIn.id);
    return { uuAppErrorMap };
  }
}

module.exports = new RuleAbl();
