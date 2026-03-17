"use strict";
const Errors = require("../errors/reading-error.js");

const Warnings = {
  Create: { UnsupportedKeys: { code: `${Errors.Create.UC_CODE}unsupportedKeys` } },
  List: { UnsupportedKeys: { code: `${Errors.List.UC_CODE}unsupportedKeys` } },
};

module.exports = Warnings;