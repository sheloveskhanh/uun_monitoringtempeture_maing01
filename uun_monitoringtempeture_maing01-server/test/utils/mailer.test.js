const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
}));

describe("sendTemperatureAlert", () => {
  let sendTemperatureAlert;

  beforeAll(() => {
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "testpass";
    process.env.NOTIFICATION_EMAIL = "notify@example.com";
    sendTemperatureAlert = require("../../app/utils/mailer.js").sendTemperatureAlert;
  });

  beforeEach(() => {
    mockSendMail.mockClear();
  });

  test("sends email with correct subject when temperature too high", async () => {
    await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooHigh",
      message: "Temperature 15°C is above maximum 8°C",
      temperature: 15,
      minC: "2",
      maxC: "8",
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const [mail] = mockSendMail.mock.calls[0];
    expect(mail.subject).toContain("too high");
    expect(mail.subject).toContain("AABBCCDDEEFF");
    expect(mail.text).toContain("15°C");
    expect(mail.text).toContain("2°C – 8°C");
    expect(mail.to).toBe("notify@example.com");
  });

  test("sends email with correct subject when temperature too low", async () => {
    await sendTemperatureAlert({
      deviceEui: "AABBCCDDEEFF",
      type: "tempTooLow",
      message: "Temperature -5°C is below minimum 2°C",
      temperature: -5,
      minC: "2",
      maxC: "8",
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const [mail] = mockSendMail.mock.calls[0];
    expect(mail.subject).toContain("too low");
  });

  test("skips sending when SMTP credentials are missing", async () => {
    jest.resetModules();
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    const { sendTemperatureAlert: fn } = require("../../app/utils/mailer.js");

    await fn({ deviceEui: "X", type: "tempTooHigh", message: "", temperature: 10, minC: "2", maxC: "8" });

    expect(mockSendMail).not.toHaveBeenCalled();
  });
});
