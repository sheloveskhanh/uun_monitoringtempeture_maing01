"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/alert-error.js");
const Warnings = require("../api/warnings/alert-warning.js");

class AlertAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("alert");
    this.deviceDao = DaoFactory.getDao("device");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("alertCreateDtoInType", dtoIn);
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

    dtoIn.awid = awid;
    dtoIn.status = "open";
    dtoIn.severity = dtoIn.severity || "warning";
    dtoIn.createdAt = new Date();

    const alert = await this.dao.create(dtoIn);
    return { ...alert, uuAppErrorMap };
  }

  async list(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("alertListDtoInType", dtoIn);
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

    const dtoOut = await this.dao.list(
      awid,
      { deviceEui: dtoIn.deviceEui, status: dtoIn.status, severity: dtoIn.severity },
      dtoIn.pageInfo,
    );
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }

  async acknowledge(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("alertAcknowledgeDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Acknowledge.UnsupportedKeys.code,
      Errors.Acknowledge.InvalidDtoIn,
    );

    const alert = await this.dao.get(awid, dtoIn.id);
    if (!alert) {
      throw new Errors.Acknowledge.AlertNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    alert.status = "acknowledged";
    alert.acknowledgedAt = new Date();

    const updated = await this.dao.update(alert);
    return { ...updated, uuAppErrorMap };
  }

  async delete(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("alertDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Delete.UnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn,
    );

    const alert = await this.dao.get(awid, dtoIn.id);
    if (!alert) {
      throw new Errors.Delete.AlertNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    await this.dao.delete(awid, dtoIn.id);
    return { uuAppErrorMap };
  }
}

module.exports = new AlertAbl();
