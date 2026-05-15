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

describe("gateway/setState", () => {
  test("HDS - activates a gateway", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "gateway/create",
      { name: "Gateway State Test", uuIdentity: "GW-STATE-0001" },
      session,
    );

    const result = await TestHelper.executePostCommand(
      "gateway/setState",
      { id: created.data.id, state: "active" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.state).toBe("active");
  });

  test("E1 - non-existent gateway returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("gateway/setState", { id: "000000000000000000000001", state: "active" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });

  test("E2 - invalid state value returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "gateway/create",
      { name: "Gateway Invalid State", uuIdentity: "GW-STATE-0002" },
      session,
    );
    try {
      await TestHelper.executePostCommand("gateway/setState", { id: created.data.id, state: "online" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
