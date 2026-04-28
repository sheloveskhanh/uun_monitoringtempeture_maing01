"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/gateway-error.js");
const Warnings = require("../api/warnings/gateway-warning.js");

const VALID_STATES = ["initial", "active", "suspended", "closed", "cancelled"];

class GatewayAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("gateway");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("gatewayCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Create.UnsupportedKeys.code,
      Errors.Create.InvalidDtoIn,
    );

    const existingGateway = await this.dao.getByUuIdentity(awid, dtoIn.uuIdentity);
    if (existingGateway) {
      throw new Errors.Create.GatewayUuIdentityAlreadyExists(
        { uuAppErrorMap },
        { uuIdentity: dtoIn.uuIdentity },
      );
    }

    dtoIn.awid = awid;
    dtoIn.state = "initial";
    const gateway = await this.dao.create(dtoIn);
    return { ...gateway, uuAppErrorMap };
  }

  async list(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("gatewayListDtoInType", dtoIn);
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
    const validationResult = this.validator.validate("gatewaySetStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.SetState.UnsupportedKeys.code,
      Errors.SetState.InvalidDtoIn,
    );

    if (!VALID_STATES.includes(dtoIn.state)) {
      throw new Errors.SetState.InvalidState(
        { uuAppErrorMap },
        { state: dtoIn.state, validStates: VALID_STATES },
      );
    }

    const gateway = await this.dao.get(awid, dtoIn.id);
    if (!gateway) {
      throw new Errors.SetState.GatewayDoesNotExist({ uuAppErrorMap }, { gatewayId: dtoIn.id });
    }

    gateway.state = dtoIn.state;
    const updated = await this.dao.update(gateway);
    return { ...updated, uuAppErrorMap };
  }

  async delete(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("gatewayDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      Warnings.Delete.UnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn,
    );

    const gateway = await this.dao.get(awid, dtoIn.id);
    if (!gateway) {
      throw new Errors.Delete.GatewayDoesNotExist({ uuAppErrorMap }, { gatewayId: dtoIn.id });
    }

    await this.dao.delete(awid, dtoIn.id);
    return { uuAppErrorMap };
  }
}

module.exports = new GatewayAbl();
