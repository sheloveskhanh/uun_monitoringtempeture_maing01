"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const RULE_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}rule/`;

const Create = {
  UC_CODE: `${RULE_ERROR_PREFIX}create/`,

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

  RuleAlreadyExists: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}ruleAlreadyExists`;
      this.message = "A rule for this deviceEui already exists. Use rule/update to change it.";
    }
  },
};

const List = {
  UC_CODE: `${RULE_ERROR_PREFIX}list/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const Update = {
  UC_CODE: `${RULE_ERROR_PREFIX}update/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  RuleNotFound: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}ruleNotFound`;
      this.message = "Rule with given id does not exist.";
    }
  },
};

const Delete = {
  UC_CODE: `${RULE_ERROR_PREFIX}delete/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  RuleNotFound: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}ruleNotFound`;
      this.message = "Rule with given id does not exist.";
    }
  },
};

module.exports = { Create, List, Update, Delete };
