"use strict";

const MonitoringtempetureMainUseCaseError = require("./monitoringtempeture-main-use-case-error.js");
const LOCATION_ERROR_PREFIX = `${MonitoringtempetureMainUseCaseError.ERROR_PREFIX}location/`;

const Create = {
  UC_CODE: `${LOCATION_ERROR_PREFIX}create/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  LocationNameAlreadyExists: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}locationNameAlreadyExists`;
      this.message = "Location with this name already exists.";
    }
  },
};

const Get = {
  UC_CODE: `${LOCATION_ERROR_PREFIX}get/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  LocationDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}locationDoesNotExist`;
      this.message = "Location does not exist.";
    }
  },
};

const List = {
  UC_CODE: `${LOCATION_ERROR_PREFIX}list/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const Update = {
  UC_CODE: `${LOCATION_ERROR_PREFIX}update/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  LocationDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}locationDoesNotExist`;
      this.message = "Location does not exist.";
    }
  },
  LocationNameAlreadyExists: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}locationNameAlreadyExists`;
      this.message = "Location with this name already exists.";
    }
  },
};

const Delete = {
  UC_CODE: `${LOCATION_ERROR_PREFIX}delete/`,
  InvalidDtoIn: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  LocationDoesNotExist: class extends MonitoringtempetureMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}locationDoesNotExist`;
      this.message = "Location does not exist.";
    }
  },
};

module.exports = { Create, Get, List, Update, Delete };
