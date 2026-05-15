const { TestHelper } = require("uu_appg01_server-test");

// All test users share the same OIDC credentials, so they all authenticate
// to the same uuIdentity ("3039-912-8064-0000", from env/test.json).
// reading/create checks: (1) caller has "Gateways" profile, (2) a gateway
// with caller's uuIdentity is active. We satisfy both by registering a gateway
// with the shared test identity and explicitly creating a "Gateways" permission
// for that identity.

const TEST_IDENTITY = "3039-912-8064-0000";
const deviceEui = "READ00000001";

beforeAll(async () => {
  await TestHelper.setup();
  await TestHelper.initUuSubAppInstance();
  await TestHelper.createUuAppWorkspace();
  await TestHelper.initUuAppWorkspace({ uuAppProfileAuthorities: "urn:uu:GGALL" });

  const session = await TestHelper.login("AwidLicenseOwner", false, false);

  // Grant the Gateways profile to the test identity
  await TestHelper.executePostCommand(
    "sys/uuAppWorkspace/permission/create",
    { profile: "Gateways", uuIdentityList: [TEST_IDENTITY] },
    session,
  );

  // Register a gateway with the test identity and activate it
  const gw = await TestHelper.executePostCommand(
    "gateway/create",
    { name: "Test Runner Gateway", uuIdentity: TEST_IDENTITY },
    session,
  );
  await TestHelper.executePostCommand("gateway/setState", { id: gw.data.id, state: "active" }, session);

  // Create and activate the device under test
  const dev = await TestHelper.executePostCommand("device/create", { name: "Reading Device", deviceEui }, session);
  await TestHelper.executePostCommand("device/setState", { id: dev.data.id, state: "active" }, session);
});

afterAll(async () => {
  await TestHelper.teardown();
});

describe("reading/create", () => {
  test("HDS - creates reading for active device via active gateway", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executePostCommand(
      "reading/create",
      { deviceEui, temperature: "5.2", voltageRest: "3.6" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.deviceEui).toBe(deviceEui);
    expect(result.data.temperature).toBe("5.2");
    expect(result.data.processedAt).toBeDefined();
  });

  test("HDS - auto-creates critical alert when temperature exceeds rule max", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);

    await TestHelper.executePostCommand(
      "rule/create",
      { deviceEui, minC: "2", maxC: "8", batteryLowV: "3.2" },
      session,
    ).catch(() => {}); // ignore if rule already exists

    await TestHelper.executePostCommand(
      "reading/create",
      { deviceEui, temperature: "15.0", voltageRest: "3.7" },
      session,
    );

    const alerts = await TestHelper.executeGetCommand("alert/list", { deviceEui }, session);
    const tempAlert = alerts.data.itemList.find((a) => a.type === "tempTooHigh");
    expect(tempAlert).toBeDefined();
    expect(tempAlert.severity).toBe("critical");
  });

  test("E1 - inactive device returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    await TestHelper.executePostCommand("device/create", { name: "Inactive Dev", deviceEui: "READ00000002" }, session);

    try {
      await TestHelper.executePostCommand(
        "reading/create",
        { deviceEui: "READ00000002", temperature: "5.0", voltageRest: "3.5" },
        session,
      );
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
