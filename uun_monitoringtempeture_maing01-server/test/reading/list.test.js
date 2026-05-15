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

describe("reading/list", () => {
  test("HDS - returns empty list when no readings", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand("reading/list", {}, session);
    expect(result.status).toBe(200);
    expect(result.data.itemList).toBeDefined();
    expect(Array.isArray(result.data.itemList)).toBe(true);
    expect(result.data.pageInfo).toBeDefined();
  });

  test("HDS - filter by deviceEui returns only that device's readings", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand("reading/list", { deviceEui: "NONEXISTENTEUI" }, session);
    expect(result.status).toBe(200);
    expect(result.data.itemList).toHaveLength(0);
  });

  test("HDS - pagination parameters are accepted", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand(
      "reading/list",
      { pageInfo: { pageSize: 10, pageIndex: 0 } },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.itemList.length).toBeLessThanOrEqual(10);
  });

  test("HDS - date range filter is accepted", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();
    const result = await TestHelper.executeGetCommand("reading/list", { from, to }, session);
    expect(result.status).toBe(200);
    expect(result.data.itemList).toBeDefined();
  });
});
