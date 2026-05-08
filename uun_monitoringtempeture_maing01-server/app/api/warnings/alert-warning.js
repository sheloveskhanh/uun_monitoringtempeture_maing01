"use strict";
const Errors = require("../errors/alert-error.js");

const Warnings = {
  Create: { UnsupportedKeys: { code: `${Errors.Create.UC_CODE}unsupportedKeys` } },
  List: { UnsupportedKeys: { code: `${Errors.List.UC_CODE}unsupportedKeys` } },
  Acknowledge: { UnsupportedKeys: { code: `${Errors.Acknowledge.UC_CODE}unsupportedKeys` } },
  Delete: { UnsupportedKeys: { code: `${Errors.Delete.UC_CODE}unsupportedKeys` } },
};

module.exports = Warnings;
