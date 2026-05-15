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

describe("device/setState", () => {
  test("HDS - sets device to active", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "device/create",
      { name: "State Test Device", deviceEui: "STATE000001" },
      session,
    );
    const id = created.data.id;

    const result = await TestHelper.executePostCommand("device/setState", { id, state: "active" }, session);
    expect(result.status).toBe(200);
    expect(result.data.state).toBe("active");
  });

  test("HDS - transitions through multiple states", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "device/create",
      { name: "State Transition Device", deviceEui: "STATE000002" },
      session,
    );
    const id = created.data.id;

    await TestHelper.executePostCommand("device/setState", { id, state: "active" }, session);
    const suspended = await TestHelper.executePostCommand("device/setState", { id, state: "suspended" }, session);
    expect(suspended.data.state).toBe("suspended");
  });

  test("E1 - non-existent device returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("device/setState", { id: "000000000000000000000001", state: "active" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });

  test("E2 - invalid state value returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "device/create",
      { name: "Invalid State Device", deviceEui: "STATE000003" },
      session,
    );
    try {
      await TestHelper.executePostCommand("device/setState", { id: created.data.id, state: "flying" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
