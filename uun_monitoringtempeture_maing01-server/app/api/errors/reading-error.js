"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const READING_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}reading/`;

const Create = {
  UC_CODE: `${READING_ERROR_PREFIX}create/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  DeviceNotFound: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}deviceNotFound`;
      this.message = "Device with given deviceEui does not exist.";
    }
  },

  DeviceIsNotActive: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}deviceIsNotActive`;
      this.message = "Device is not in active state.";
    }
  },

  GatewayNotFound: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}gatewayNotFound`;
      this.message = "Gateway with given uuIdentity does not exist.";
    }
  },

  GatewayIsNotActive: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}gatewayIsNotActive`;
      this.message = "Gateway is not in active state.";
    }
  },
};

const List = {
  UC_CODE: `${READING_ERROR_PREFIX}list/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

module.exports = { Create, List };
