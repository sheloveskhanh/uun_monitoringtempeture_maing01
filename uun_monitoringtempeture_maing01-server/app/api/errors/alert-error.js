"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const ALERT_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}alert/`;

const Create = {
  UC_CODE: `${ALERT_ERROR_PREFIX}create/`,

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
};

const List = {
  UC_CODE: `${ALERT_ERROR_PREFIX}list/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const Acknowledge = {
  UC_CODE: `${ALERT_ERROR_PREFIX}acknowledge/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Acknowledge.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AlertNotFound: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Acknowledge.UC_CODE}alertNotFound`;
      this.message = "Alert with given id does not exist.";
    }
  },
};

const Delete = {
  UC_CODE: `${ALERT_ERROR_PREFIX}delete/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AlertNotFound: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}alertNotFound`;
      this.message = "Alert with given id does not exist.";
    }
  },
};

module.exports = { Create, List, Acknowledge, Delete };
