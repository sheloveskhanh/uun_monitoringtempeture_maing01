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

describe("gateway/delete", () => {
  test("HDS - deletes an existing gateway", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "gateway/create",
      { name: "Gateway To Delete", uuIdentity: "GW-DEL-00001" },
      session,
    );
    const id = created.data.id;

    const result = await TestHelper.executePostCommand("gateway/delete", { id }, session);
    expect(result.status).toBe(200);
  });

  test("E1 - non-existent gateway returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("gateway/delete", { id: "000000000000000000000001" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
