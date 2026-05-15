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

describe("rule/delete", () => {
  test("HDS - deletes an existing rule", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await TestHelper.executePostCommand("device/create", { name: "Rule Del Device", deviceEui: "RDEL00000001" }, session);
    await TestHelper.executePostCommand("device/setState", { id: device.data.id, state: "active" }, session);
    const rule = await TestHelper.executePostCommand(
      "rule/create",
      { deviceEui: "RDEL00000001", minC: "2", maxC: "8", batteryLowV: "3.2" },
      session,
    );

    const result = await TestHelper.executePostCommand("rule/delete", { id: rule.data.id }, session);
    expect(result.status).toBe(200);
  });

  test("E1 - non-existent rule returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("rule/delete", { id: "000000000000000000000001" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
