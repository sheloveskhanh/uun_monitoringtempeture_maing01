const { TestHelper } = require("uu_appg01_server-test");

async function createActiveDeviceWithRule(session, name, eui) {
  const created = await TestHelper.executePostCommand("device/create", { name, deviceEui: eui }, session);
  await TestHelper.executePostCommand("device/setState", { id: created.data.id, state: "active" }, session);
  const rule = await TestHelper.executePostCommand(
    "rule/create",
    { deviceEui: eui, minC: "2", maxC: "8", batteryLowV: "3.2" },
    session,
  );
  return rule.data;
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

describe("rule/update", () => {
  test("HDS - updates rule thresholds", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const rule = await createActiveDeviceWithRule(session, "Rule Update Device", "RUPD00000001");

    const result = await TestHelper.executePostCommand(
      "rule/update",
      { id: rule.id, minC: "0", maxC: "10", batteryLowV: "3.0" },
      session,
    );
    expect(result.status).toBe(200);
    expect(String(result.data.minC)).toBe("0");
    expect(String(result.data.maxC)).toBe("10");
    expect(String(result.data.batteryLowV)).toBe("3.0");
  });

  test("HDS - partial update works", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const rule = await createActiveDeviceWithRule(session, "Rule Partial Update Device", "RUPD00000002");

    const result = await TestHelper.executePostCommand("rule/update", { id: rule.id, maxC: "12" }, session);
    expect(result.status).toBe(200);
    expect(String(result.data.maxC)).toBe("12");
  });

  test("HDS - saves and returns notificationEmail", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const rule = await createActiveDeviceWithRule(session, "Rule Email Device", "RUPD00000003");

    const result = await TestHelper.executePostCommand(
      "rule/update",
      { id: rule.id, notificationEmail: "test@example.com" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.notificationEmail).toBe("test@example.com");

    // Verify it persists via list
    const list = await TestHelper.executeGetCommand("rule/list", { deviceEui: "RUPD00000003" }, session);
    expect(list.data.itemList[0].notificationEmail).toBe("test@example.com");
  });

  test("E1 - non-existent rule returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("rule/update", { id: "000000000000000000000001", minC: "1" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
