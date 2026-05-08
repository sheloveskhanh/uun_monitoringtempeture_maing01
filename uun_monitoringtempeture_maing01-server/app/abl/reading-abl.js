"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/reading-error.js");
const Warnings = require("../api/warnings/reading-warning.js");

class ReadingAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("reading");
    this.deviceDao = DaoFactory.getDao("device");
    this.gatewayDao = DaoFactory.getDao("gateway");
    this.ruleDao = DaoFactory.getDao("rule");
    this.alertDao = DaoFactory.getDao("alert");
  }

  async create(awid, dtoIn, uuIdentity) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("readingCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn,
    );

    // Verify calling gateway exists and is active
    const gateway = await this.gatewayDao.getByUuIdentity(awid, uuIdentity);
    if (!gateway) {
      throw new Errors.Create.GatewayNotFound({ uuAppErrorMap }, { uuIdentity });
    }
    if (gateway.state !== "active") {
      throw new Errors.Create.GatewayIsNotActive(
        { uuAppErrorMap },
        { uuIdentity, currentState: gateway.state },
      );
    }

    // Verify device exists
    const device = await this.deviceDao.getByDeviceEui(awid, dtoIn.deviceEui);
    if (!device) {
      throw new Errors.Create.DeviceNotFound({ uuAppErrorMap }, { deviceEui: dtoIn.deviceEui });
    }

    // Verify device is active
    if (device.state !== "active") {
      throw new Errors.Create.DeviceIsNotActive(
        { uuAppErrorMap },
        { deviceEui: dtoIn.deviceEui, currentState: device.state },
      );
    }

    dtoIn.awid = awid;
    if (!dtoIn.processedAt) {
      dtoIn.processedAt = new Date();
    } else {
      dtoIn.processedAt = new Date(dtoIn.processedAt);
    }

    const reading = await this.dao.create(dtoIn);

    // Auto-trigger alerts if a rule exists for this device
    const rule = await this.ruleDao.getByDeviceEui(awid, dtoIn.deviceEui);
    if (rule) {
      const temp = parseFloat(dtoIn.temperature);
      const voltage = parseFloat(dtoIn.voltageRest);
      const alerts = [];

      if (!isNaN(temp)) {
        if (rule.minC !== undefined && temp < parseFloat(rule.minC)) {
          alerts.push({ type: "tempTooLow", message: `Temperature ${temp}°C is below minimum ${rule.minC}°C`, severity: "critical" });
        } else if (rule.maxC !== undefined && temp > parseFloat(rule.maxC)) {
          alerts.push({ type: "tempTooHigh", message: `Temperature ${temp}°C is above maximum ${rule.maxC}°C`, severity: "critical" });
        }
      }

      if (!isNaN(voltage) && rule.batteryLowV !== undefined && voltage < parseFloat(rule.batteryLowV)) {
        alerts.push({ type: "batteryLow", message: `Battery voltage ${voltage}V is below threshold ${rule.batteryLowV}V`, severity: "warning" });
      }

      for (const alertData of alerts) {
        await this.alertDao.create({
          awid,
          deviceEui: dtoIn.deviceEui,
          type: alertData.type,
          message: alertData.message,
          severity: alertData.severity,
          status: "open",
          createdAt: new Date(),
        });
      }
    }

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
      Errors.List.InvalidDtoIn,
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
