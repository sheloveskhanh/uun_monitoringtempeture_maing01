"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const DEVICE_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}device/`;

const Create = {
  UC_CODE: `${DEVICE_ERROR_PREFIX}create/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  DeviceEuiAlreadyExists: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}deviceEuiAlreadyExists`;
      this.message = "Device with this deviceEui already exists.";
    }
  },
};

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

const SetState = {
  UC_CODE: `${DEVICE_ERROR_PREFIX}setState/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  DeviceDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}deviceDoesNotExist`;
      this.message = "Device does not exist.";
    }
  },
  InvalidState: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}invalidState`;
      this.message = "Invalid state value.";
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

const Update = {
  UC_CODE: `${DEVICE_ERROR_PREFIX}update/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  DeviceDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}deviceDoesNotExist`;
      this.message = "Device does not exist.";
    }
  },
};

module.exports = { Create, List, SetState, Delete, Update };
