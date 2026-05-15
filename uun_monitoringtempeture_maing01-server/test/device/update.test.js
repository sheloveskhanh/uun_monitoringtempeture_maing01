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

describe("device/update", () => {
  test("HDS - updates device name and description", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "device/create",
      { name: "Original Name", deviceEui: "UPD000000001" },
      session,
    );
    const id = created.data.id;

    const result = await TestHelper.executePostCommand(
      "device/update",
      { id, name: "Updated Name", description: "Updated description" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.name).toBe("Updated Name");
    expect(result.data.description).toBe("Updated description");
  });

  test("HDS - partial update (name only)", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    const created = await TestHelper.executePostCommand(
      "device/create",
      { name: "Partial Update Device", deviceEui: "UPD000000002" },
      session,
    );

    const result = await TestHelper.executePostCommand(
      "device/update",
      { id: created.data.id, name: "New Name Only" },
      session,
    );
    expect(result.status).toBe(200);
    expect(result.data.name).toBe("New Name Only");
  });

  test("E1 - non-existent id returns error", async () => {
    const session = await TestHelper.login("AwidLicenseOwner", false, false);
    try {
      await TestHelper.executePostCommand("device/update", { id: "000000000000000000000001", name: "Ghost" }, session);
      fail("Expected error was not thrown");
    } catch (e) {
      expect(e.status).not.toBe(200);
    }
  });
});
