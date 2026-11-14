"use strict";
const Errors = require("../errors/location-error.js");

const Warnings = {
  Create: { UnsupportedKeys: { code: `${Errors.Create.UC_CODE}unsupportedKeys` } },
  Get: { UnsupportedKeys: { code: `${Errors.Get.UC_CODE}unsupportedKeys` } },
  List: { UnsupportedKeys: { code: `${Errors.List.UC_CODE}unsupportedKeys` } },
  Update: { UnsupportedKeys: { code: `${Errors.Update.UC_CODE}unsupportedKeys` } },
  Delete: { UnsupportedKeys: { code: `${Errors.Delete.UC_CODE}unsupportedKeys` } },
};

module.exports = Warnings;
