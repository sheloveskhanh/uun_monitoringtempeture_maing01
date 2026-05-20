# uuMonitor — IoT Temperature Monitoring System

> A full-stack IoT application for real-time temperature monitoring via LoRaWAN sensors, built on the [Plus4U / uuApp](https://plus4u.net) cloud platform.

![Version](https://img.shields.io/badge/version-0.4.3-blue)
![Platform](https://img.shields.io/badge/platform-uuApp%20Cloud-informational)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)

**[Live demo](https://uuapp-dev.plus4u.net/uun-monitoringtempeture-maing01/30432a1b3f9bf4b331d13618c90cec94/dashboard)** — requires a Plus4U account to log in.

---

## What is this?

uuMonitor collects temperature data from wireless LoRaWAN sensors and displays it in a live web dashboard. Readings flow automatically from a physical sensor through a LoRaWAN network into the cloud, where you can:

- Watch live and historical temperature charts
- Define alert rules that trigger when thresholds are exceeded
- Manage multiple devices and gateways
- Export readings as CSV with a custom date range

The project was built as a bachelor's thesis at [UNICORN UNIVERSITY]([https://www.fit.vut.cz/](https://unicornuniversity.net/cs/home)) and runs end-to-end on the Plus4U cloud with no manual steps after initial deployment.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Hardware layer                                                 │
│                                                                 │
│   CHESTER Clime  ──LoRaWAN radio──►  LoRaWAN Gateway           │
│   (HARDWARIO)                        (connected to Pi)          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│  Raspberry Pi                                                   │
│                                                                 │
│   ChirpStack  ──MQTT──►  Python bridge  ──HTTPS POST──►  Cloud  │
│   (LoRaWAN NS)           lorawan_mqtt_bridge.py                 │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│  Plus4U Cloud (uuApp platform)                                  │
│                                                                 │
│   uuApp Backend (Node.js)  ──►  MongoDB Atlas                   │
│          │                                                      │
│          ▼                                                      │
│   uuApp Frontend (uu5g05 / React)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| IoT Sensor | [HARDWARIO CHESTER Clime](https://www.hardwario.com/chester/) |
| Radio Protocol | LoRaWAN |
| LoRaWAN Network Server | [ChirpStack v4](https://www.chirpstack.io/) |
| IoT Gateway Bridge | Python 3, Paho MQTT |
| Edge Device | Raspberry Pi (systemd service) |
| Backend | Node.js ≥ 16, [uuApp Server g01](https://uuapp.plus4u.net) v6 |
| Database | MongoDB Atlas (via `mongodb` driver v6) |
| Frontend | [uu5g05](https://uuapp.plus4u.net) (React-based component library) |
| Charts | [Recharts](https://recharts.org/) |
| Cloud Platform | [Plus4U / uuApp Cloud](https://plus4u.net) |
| Auth | Plus4U OIDC |

---

## Features

- **Live dashboard** — current temperature with a 1-day / 5-day historical chart
- **Readings list** — paginated table with CSV export and date-range filter
- **Devices** — register and manage LoRaWAN sensors
- **Gateways** — track gateway connectivity
- **Alert rules** — define min/max thresholds; alerts fire automatically when breached
- **Mobile responsive** — hamburger menu, column hiding, and sticky topbar on small screens

---

## Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| [Plus4U account](https://plus4u.net) | Free registration; required for uuApp cloud deployment |
| Node.js ≥ 16 | Backend and frontend tooling |
| MongoDB Atlas cluster | Free tier is sufficient |
| Raspberry Pi (optional) | Only needed for the full IoT hardware pipeline |

---

### 1. Clone the repository

```bash
git clone https://github.com/sheloveskhanh/uun_monitoringtempeture_maing01.git
cd uun_monitoringtempeture_maing01
```

---

### 2. Configure the npm registry

All `uu_*` packages are published to the **Plus4U private npm registry**, not the public npm registry. Without this step, `npm install` will fail with a "package not found" error.

Both sub-projects already include an `.npmrc` file that points to the correct registry. You do not need to create it manually — just verify it is present:

```
uun_monitoringtempeture_maing01-server/.npmrc
uun_monitoringtempeture_maing01-hi/.npmrc
```

Both files contain:

```
registry=https://repo.plus4u.net/repository/public-javascript/
```

If you prefer to set this globally instead (applies to all projects on your machine):

```bash
npm config set registry https://repo.plus4u.net/repository/public-javascript/
```

---

### 3. Backend setup

```bash
cd uun_monitoringtempeture_maing01-server
npm install
```

Edit `env/development.json` and set your MongoDB connection string and uuApp credentials:

```json
{
  "mongodb": {
    "uri": "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>"
  }
}
```

Start the backend in development mode:

```bash
npm start
```

The server starts on `http://localhost:8080` by default.

---

### 4. Frontend setup

```bash
cd ../uun_monitoringtempeture_maing01-hi
npm install
npm start
```

The frontend dev server starts on `http://localhost:1234` and proxies API calls to the backend.

---

### 5. Deploy to uuApp Cloud

Both the server and frontend are deployed using the uuApp devkit:

```bash
# In the server directory
npm run deploy

# In the hi (frontend) directory
npm run deploy
```

Refer to the official uuApp guides for first-time setup:

- [uuApp Server — Getting Started](https://uuapp.plus4u.net/uu-bookkit-maing01/2590bf997d264d959b9d6a88ee1d0ff5/book/page?code=getStarted)
- [uuApp Client (UU5) — Getting Started](https://uuapp.plus4u.net/uu-bookkit-maing01/ed11ec379073476db0aa295ad6c00178/book/page?code=getStartedHooks)
- [uuAppg01 Devkit Documentation](https://uuapp.plus4u.net/uu-bookkit-maing01/e884539c8511447a977c7ff070e7f2cf/book)

---

### 6. Hardware & IoT bridge (optional)

> Skip this section if you only want to run the web app without real sensor data.

**Install ChirpStack on Raspberry Pi**

Follow the [ChirpStack Docker Compose](https://www.chirpstack.io/docs/getting-started/docker.html) guide to run ChirpStack on the Pi.

**Configure the MQTT bridge**

The Python bridge reads MQTT messages from ChirpStack and forwards them to the uuApp backend.

```bash
# On the Raspberry Pi
pip install paho-mqtt requests
```

Set the target URL in `lorawan_mqtt_bridge.py`:

```python
UUAPP_BASE_URL = "https://<your-uuapp-instance>/uu-monitorinh..."
```

Run as a systemd service for automatic startup:

```bash
sudo cp mqtt-bridge.service /etc/systemd/system/
sudo systemctl enable --now mqtt-bridge
```

Check bridge status and logs:

```bash
systemctl status mqtt-bridge
tail -f ~/chirpstack-docker/bridge.log
```

---

## Project Structure

```
uun_monitoringtempeture_maing01/
├── uun_monitoringtempeture_maing01-server/   # Node.js backend
│   ├── app/
│   │   ├── abl/          # Application business logic
│   │   ├── api/          # Controllers, validation, errors
│   │   └── dao/          # MongoDB data-access objects
│   ├── env/              # Environment configs (dev, test, prod)
│   └── test/             # Server-side tests (55 tests, 19 suites)
│
└── uun_monitoringtempeture_maing01-hi/       # uu5g05 frontend
    ├── src/
    │   ├── routes/       # Page-level route components (dashboard, readings, devices…)
    │   ├── core/         # App shell, layout, navigation
    │   ├── calls.js      # API client wrappers
    │   └── lsi/          # i18n strings (en.json)
    └── env/              # Frontend environment configs
```

---

## Running Tests

```bash
cd uun_monitoringtempeture_maing01-server
npm test
```

19 test suites · 55 tests · all passing.

---

## License

License Commercial — see `LICENSE` in each sub-project.
