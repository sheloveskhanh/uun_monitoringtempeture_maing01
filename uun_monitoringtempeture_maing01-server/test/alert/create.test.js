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

describe("alert/create", () => {
  test("HDS - creates alert for existing device", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await TestHelper.executePostCommand(
      "device/create",
      { name: "Alert Device A", deviceEui: "ALRT00000001" },
      session,
    );

    const result = await TestHelper.executePostCommand(
      "alert/create",
      {
        deviceEui: device.data.deviceEui,
        type: "tempTooHigh",
        message: "Temperature 10°C is above maximum 8°C",
        severity: "critical",
      },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.status).toBe("open");
    expect(result.data.severity).toBe("critical");
    expect(result.data.type).toBe("tempTooHigh");
    expect(result.data.createdAt).toBeDefined();
  });

  test("HDS - defaults to warning severity", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const device = await TestHelper.executePostCommand(
      "device/create",
      { name: "Alert Device B", deviceEui: "ALRT00000002" },
      session,
    );

    const result = await TestHelper.executePostCommand(
      "alert/create",
      { deviceEui: device.data.deviceEui, type: "batteryLow", message: "Battery low" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.severity).toBe("warning");
    expect(result.data.status).toBe("open");
  });

  test("E1 - device not found returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand(
        "alert/create",
        { deviceEui: "DOESNOTEXIST", type: "tempTooHigh", message: "Ghost alert" },
        session,
      );
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
