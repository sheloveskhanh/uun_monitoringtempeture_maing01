"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const DEVICE_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}device/`;

const List = {
  UC_CODE: `${DEVICE_ERROR_PREFIX}list/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const Create = {
  UC_CODE: `${DEVICE_ERROR_PREFIX}create/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const Delete = {
  UC_CODE: `${DEVICE_ERROR_PREFIX}delete/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  DeviceDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}deviceDoesNotExist`;
      this.message = "Device does not exist.";
    }
  },
};

module.exports = {
  Delete,
  Create,
  List,
};
