const mockSendMail = jest.fn();
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
}));

const { sendTemperatureAlert } = require("../../app/utils/mailer.js");

describe("sendTemperatureAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMTP_HOST = "smtp.plus4u.net";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@plus4u.net";
    process.env.SMTP_PASS = "testpass";
    process.env.NOTIFICATION_EMAIL = "notify@example.com";
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.NOTIFICATION_EMAIL;
  });

  test("sends correct subject and body when temperature too high", async () => {
    mockSendMail.mockResolvedValue({});

    await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "Temperature 15°C is above maximum 8°C",
      temperature: 15,
      minC: "2",
      maxC: "8",
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.subject).toContain("too high");
    expect(mail.subject).toContain("AABBCCDDEEFF");
    expect(mail.text).toContain("15°C");
    expect(mail.text).toContain("2°C – 8°C");
    expect(mail.to).toBe("notify@example.com");
  });

  test("sends correct subject when temperature too low", async () => {
    mockSendMail.mockResolvedValue({});

    await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooLow",
      message: "Temperature -5°C is below minimum 2°C",
      temperature: -5,
      minC: "2",
      maxC: "8",
    });

    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.subject).toContain("too low");
    expect(mail.subject).toContain("AABBCCDDEEFF");
  });

  test("uses notificationEmail param over NOTIFICATION_EMAIL env var", async () => {
    mockSendMail.mockResolvedValue({});

    await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "",
      temperature: 15,
      minC: "2",
      maxC: "8",
      notificationEmail: "custom@example.com",
    });

    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.to).toBe("custom@example.com");
  });

  test("returns success when email is sent", async () => {
    mockSendMail.mockResolvedValue({});

    const result = await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "",
      temperature: 15,
      minC: "2",
      maxC: "8",
    });

    expect(result.success).toBe(true);
    expect(result.recipient).toBe("notify@example.com");
  });

  test("returns failure when SMTP transport throws", async () => {
    mockSendMail.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "",
      temperature: 15,
      minC: "2",
      maxC: "8",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("ECONNREFUSED");
  });

  test("skips sending when SMTP is not configured", async () => {
    delete process.env.SMTP_HOST;

    const result = await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "",
      temperature: 15,
      minC: "2",
      maxC: "8",
    });

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toContain("SMTP not configured");
  });

  test("skips sending when no recipient is configured", async () => {
    delete process.env.NOTIFICATION_EMAIL;

    const result = await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "",
      temperature: 15,
      minC: "2",
      maxC: "8",
    });

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toContain("no recipient");
  });
});
