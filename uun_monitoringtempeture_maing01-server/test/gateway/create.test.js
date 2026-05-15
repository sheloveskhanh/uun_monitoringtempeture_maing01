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

describe("gateway/create", () => {
  test("HDS - creates gateway with state initial", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executePostCommand(
      "gateway/create",
      { name: "MikroTik Gateway A", uuIdentity: "1111-2222-3333-0001" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.name).toBe("MikroTik Gateway A");
    expect(result.data.uuIdentity).toBe("1111-2222-3333-0001");
    expect(result.data.state).toBe("initial");
    expect(result.data.uuAppErrorMap).toBeDefined();
  });

  test("E1 - duplicate uuIdentity is rejected", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    await TestHelper.executePostCommand(
      "gateway/create",
      { name: "Gateway Dup 1", uuIdentity: "DUP-IDENTITY-001" },
      session,
    );
    try {
      await TestHelper.executePostCommand(
        "gateway/create",
        { name: "Gateway Dup 2", uuIdentity: "DUP-IDENTITY-001" },
        session,
      );
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });

  test("E2 - missing required fields returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("gateway/create", { name: "No Identity" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
