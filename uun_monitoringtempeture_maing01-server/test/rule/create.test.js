const { TestHelper } = require("uu_appg01_server-test");

// Helper: creates a device and activates it, returns the device
async function createActiveDevice(session, name, eui) {
  const created = await TestHelper.executePostCommand("device/create", { name, deviceEui: eui }, session);
  await TestHelper.executePostCommand("device/setState", { id: created.data.id, state: "active" }, session);
  return created.data;
}

beforeAll(async () => {
  await TestHelper.setup();
  await TestHelper.initUuSubAppInstance();
  await TestHelper.createUuAppWorkspace();
  await TestHelper.initUuAppWorkspace({ uuAppProfileAuthorities: "urn:uu:GGALL" });
});

afterAll(async () => {
  await TestHelper.teardown();
});

describe("rule/create", () => {
  test("HDS - creates rule for active device", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await createActiveDevice(session, "Rule Test Device A", "RULE00000001");

    const result = await TestHelper.executePostCommand(
      "rule/create",
      { deviceEui: device.deviceEui, minC: "2", maxC: "8", batteryLowV: "3.2" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.deviceEui).toBe(device.deviceEui);
    expect(result.data.minC).toBeDefined();
    expect(result.data.maxC).toBeDefined();
    expect(result.data.batteryLowV).toBeDefined();
  });

  test("E1 - device not found returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand(
        "rule/create",
        { deviceEui: "NONEXISTENTEUI", minC: "2", maxC: "8", batteryLowV: "3.2" },
        session,
      );
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });

  test("E2 - device not active returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    // Create device but do NOT activate it
    const created = await TestHelper.executePostCommand(
      "device/create",
      { name: "Inactive Device", deviceEui: "RULE00000002" },
      session,
    );
    try {
      await TestHelper.executePostCommand(
        "rule/create",
        { deviceEui: created.data.deviceEui, minC: "2", maxC: "8", batteryLowV: "3.2" },
        session,
      );
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });

  test("E3 - duplicate rule for same device returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await createActiveDevice(session, "Rule Test Device B", "RULE00000003");

    await TestHelper.executePostCommand(
      "rule/create",
      { deviceEui: device.deviceEui, minC: "2", maxC: "8", batteryLowV: "3.2" },
      session,
    );
    try {
      await TestHelper.executePostCommand(
        "rule/create",
        { deviceEui: device.deviceEui, minC: "0", maxC: "10", batteryLowV: "3.0" },
        session,
      );
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
