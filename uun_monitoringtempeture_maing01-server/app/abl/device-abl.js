"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/device-error.js");
const Warnings = require("../api/warnings/device-warning.js");

const VALID_STATES = ["initial", "active", "suspended", "closed", "cancelled"];

class DeviceAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("device");
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

    const existingDevice = await this.dao.getByDeviceEui(awid, dtoIn.deviceEui);
    if (existingDevice) {
      throw new Errors.Create.DeviceEuiAlreadyExists({ uuAppErrorMap }, { deviceEui: dtoIn.deviceEui });
    }

    dtoIn.awid = awid;
    dtoIn.state = "initial";
    const device = await this.dao.create(dtoIn);
    return { ...device, uuAppErrorMap };
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

    const filter = { state: dtoIn.state };
    const dtoOut = await this.dao.list(awid, filter, dtoIn.pageInfo);
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }

  async setState(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("deviceSetStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.SetState.UnsupportedKeys.code,
      Errors.SetState.InvalidDtoIn,
    );

    if (!VALID_STATES.includes(dtoIn.state)) {
      throw new Errors.SetState.InvalidState({ uuAppErrorMap }, { state: dtoIn.state, validStates: VALID_STATES });
    }

    const device = await this.dao.get(awid, dtoIn.id);
    if (!device) {
      throw new Errors.SetState.DeviceDoesNotExist({ uuAppErrorMap }, { deviceId: dtoIn.id });
    }

    device.state = dtoIn.state;
    const updated = await this.dao.update(device);
    return { ...updated, uuAppErrorMap };
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
    return { uuAppErrorMap };
  }
}

module.exports = new DeviceAbl();
