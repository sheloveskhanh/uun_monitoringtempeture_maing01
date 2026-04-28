"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const GATEWAY_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}gateway/`;

const Create = {
  UC_CODE: `${GATEWAY_ERROR_PREFIX}create/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  GatewayUuIdentityAlreadyExists: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}gatewayUuIdentityAlreadyExists`;
      this.message = "Gateway with this uuIdentity already exists.";
    }
  },
};

const List = {
  UC_CODE: `${GATEWAY_ERROR_PREFIX}list/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const SetState = {
  UC_CODE: `${GATEWAY_ERROR_PREFIX}setState/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  GatewayDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}gatewayDoesNotExist`;
      this.message = "Gateway does not exist.";
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
  UC_CODE: `${GATEWAY_ERROR_PREFIX}delete/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  GatewayDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}gatewayDoesNotExist`;
      this.message = "Gateway does not exist.";
    }
  },
};

module.exports = { Create, List, SetState, Delete };
