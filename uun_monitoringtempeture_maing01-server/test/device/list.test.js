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

describe("device/list", () => {
  test("HDS - returns empty list when no devices", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand("device/list", {}, session);
    expect(result.status).toBe(200);
    expect(result.data.itemList).toBeDefined();
    expect(Array.isArray(result.data.itemList)).toBe(true);
    expect(result.data.pageInfo).toBeDefined();
  });

  test("HDS - lists created devices", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    await TestHelper.executePostCommand("device/create", { name: "Sensor X", deviceEui: "LIST00000001" }, session);
    await TestHelper.executePostCommand("device/create", { name: "Sensor Y", deviceEui: "LIST00000002" }, session);

    const result = await TestHelper.executeGetCommand("device/list", {}, session);
    expect(result.status).toBe(200);
    expect(result.data.itemList.length).toBeGreaterThanOrEqual(2);
    expect(result.data.pageInfo.total).toBeGreaterThanOrEqual(2);
  });

  test("HDS - pagination works", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand(
      "device/list",
      { pageInfo: { pageSize: 1, pageIndex: 0 } },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.itemList.length).toBeLessThanOrEqual(1);
  });

  test("HDS - filter by state", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const result = await TestHelper.executeGetCommand("device/list", { state: "initial" }, session);
    expect(result.status).toBe(200);
    result.data.itemList.forEach((d) => expect(d.state).toBe("initial"));
  });
});
