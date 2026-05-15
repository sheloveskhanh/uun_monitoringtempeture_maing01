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

describe("alert/acknowledge", () => {
  test("HDS - acknowledges an open alert", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await TestHelper.executePostCommand(
      "device/create",
      { name: "Ack Device", deviceEui: "ACK000000001" },
      session,
    );
    const alert = await TestHelper.executePostCommand(
      "alert/create",
      { deviceEui: device.data.deviceEui, type: "tempTooHigh", message: "Too hot", severity: "critical" },
      session,
    );

    const result = await TestHelper.executePostCommand("alert/acknowledge", { id: alert.data.id }, session);
    expect(result.status).toBe(200);
    expect(result.data.status).toBe("acknowledged");
    expect(result.data.acknowledgedAt).toBeDefined();
  });

  test("E1 - non-existent alert returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("alert/acknowledge", { id: "000000000000000000000001" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
