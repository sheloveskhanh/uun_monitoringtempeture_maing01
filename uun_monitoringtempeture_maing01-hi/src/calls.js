import { Environment } from "uu5g05";
import Plus4U5 from "uu_plus4u5g02";

// NOTE During frontend development it's possible to redirect uuApp command calls elsewhere, e.g. to production/staging
// backend, by configuring it in *-hi/env/development.json:
//   "uu5Environment": {
//     "callsBaseUri": "https://uuapp-dev.plus4u.net/vnd-app/awid"
//   }

const Calls = {
  call(method, url, dtoIn, clientOptions) {
    return Plus4U5.Utils.AppClient[method](url, dtoIn, clientOptions);
  },

  // // example for mock calls
  // loadDemoContent(dtoIn) {
  //   const commandUri = Calls.getCommandUri("loadDemoContent");
  //   return Calls.call("cmdGet", commandUri, dtoIn);
  // },

  loadIdentityProfiles() {
    const commandUri = Calls.getCommandUri("sys/uuAppWorkspace/initUve");
    return Calls.call("cmdGet", commandUri);
  },

  initWorkspace(dtoInData) {
    const commandUri = Calls.getCommandUri("sys/uuAppWorkspace/init");
    return Calls.call("cmdPost", commandUri, dtoInData);
  },

  getWorkspace() {
    const commandUri = Calls.getCommandUri("sys/uuAppWorkspace/get");
    return Calls.call("cmdGet", commandUri);
  },

  async initAndGetWorkspace(dtoInData) {
    await Calls.initWorkspace(dtoInData);
    return await Calls.getWorkspace();
  },

  listReadings(dtoIn) {
    const commandUri = Calls.getCommandUri("reading/list");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  listAlerts(dtoIn) {
    const commandUri = Calls.getCommandUri("alert/list");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  listDevices(dtoIn) {
    const commandUri = Calls.getCommandUri("device/list");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  createDevice(dtoIn) {
    const commandUri = Calls.getCommandUri("device/create");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  setDeviceState(dtoIn) {
    const commandUri = Calls.getCommandUri("device/setState");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  deleteDevice(dtoIn) {
    const commandUri = Calls.getCommandUri("device/delete");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  listRules(dtoIn) {
    const commandUri = Calls.getCommandUri("rule/list");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  createRule(dtoIn) {
    const commandUri = Calls.getCommandUri("rule/create");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  updateRule(dtoIn) {
    const commandUri = Calls.getCommandUri("rule/update");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  deleteRule(dtoIn) {
    const commandUri = Calls.getCommandUri("rule/delete");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  acknowledgeAlert(dtoIn) {
    const commandUri = Calls.getCommandUri("alert/acknowledge");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  deleteAlert(dtoIn) {
    const commandUri = Calls.getCommandUri("alert/delete");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  getCommandUri(useCase, baseUri = Environment.appBaseUri) {
    return (!baseUri.endsWith("/") ? baseUri + "/" : baseUri) + (useCase.startsWith("/") ? useCase.slice(1) : useCase);
  },
};

export default Calls;
