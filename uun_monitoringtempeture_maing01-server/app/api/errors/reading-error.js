"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const READING_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}reading/`;

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

const Create = {
  UC_CODE: `${READING_ERROR_PREFIX}create/`,

  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

module.exports = { List, Create };
