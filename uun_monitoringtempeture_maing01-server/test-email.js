require("dotenv").config();
const { sendTemperatureAlert, sendBatteryLowAlert } = require("./app/utils/mailer.js");

sendTemperatureAlert({
  deviceEui: "24c4c981ad293382",
  type: "tempTooLow",
  message: "Temperature -3°C is below minimum 2°C",
  temperature: -3,
  minC: "2",
  maxC: "8",
  notificationEmail: "khanhpham2001pm@gmail.com",
}).then((r) => console.log("[temp]", r));

sendBatteryLowAlert({
  deviceEui: "24c4c981ad293382",
  voltage: 2.8,
  batteryLowV: 3.0,
  notificationEmail: "khanhpham2001pm@gmail.com",
}).then((r) => console.log("[battery]", r));
