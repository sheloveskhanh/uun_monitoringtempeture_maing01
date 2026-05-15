const { TestHelper } = require("uu_appg01_server-test");

beforeAll(async () => {
  await TestHelper.setup();
  await TestHelper.initUuSubAppInstance();
  await TestHelper.createUuAppWorkspace();
  await TestHelper.initUuAppWorkspace({ uuAppProfileAuthorities: "urn:uu:GGALL" });
});

afterAll(async () => {
  await TestHelper.teardown();
});

describe("alert/list", () => {
  test("HDS - lists all alerts", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await TestHelper.executePostCommand(
      "device/create",
      { name: "Alert List Device", deviceEui: "ALSTL0000001" },
      session,
    );
    const eui = device.data.deviceEui;

    await TestHelper.executePostCommand("alert/create", { deviceEui: eui, type: "tempTooHigh", message: "Too hot", severity: "critical" }, session);
    await TestHelper.executePostCommand("alert/create", { deviceEui: eui, type: "batteryLow", message: "Low battery", severity: "warning" }, session);

    const result = await TestHelper.executeGetCommand("alert/list", {}, session);
    expect(result.status).toBe(200);
    expect(result.data.itemList.length).toBeGreaterThanOrEqual(2);
    expect(result.data.pageInfo.total).toBeGreaterThanOrEqual(2);
  });

  test("HDS - filter by status open", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand("alert/list", { status: "open" }, session);
    expect(result.status).toBe(200);
    result.data.itemList.forEach((a) => expect(a.status).toBe("open"));
  });

  test("HDS - filter by deviceEui", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await TestHelper.executePostCommand(
      "device/create",
      { name: "Filtered Device", deviceEui: "ALSTL0000002" },
      session,
    );
    await TestHelper.executePostCommand(
      "alert/create",
      { deviceEui: device.data.deviceEui, type: "tempTooLow", message: "Too cold", severity: "critical" },
      session,
    );

    const result = await TestHelper.executeGetCommand("alert/list", { deviceEui: device.data.deviceEui }, session);
    expect(result.status).toBe(200);
    result.data.itemList.forEach((a) => expect(a.deviceEui).toBe(device.data.deviceEui));
  });

  test("HDS - filter by severity", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand("alert/list", { severity: "critical" }, session);
    expect(result.status).toBe(200);
    result.data.itemList.forEach((a) => expect(a.severity).toBe("critical"));
  });
});
