# 📚 IoT Smart Library System

An **IoT-based Smart Library system** integrating **ESP32**, **RFID**, and a **Node.js backend** with **Firebase** to manage book borrowing and returning securely and efficiently.

---

## 🚀 Features

* 📖 RFID-based book borrowing & returning
* 🔐 Secure backend using Firebase Admin SDK
* 🌐 Node.js server for API & data processing
* 📡 ESP32 firmware for hardware interaction
* 🗂 Real-time database updates
* 🧾 Automatic transaction logging

---

## 🏗 Project Structure

```text
IoT-Smart-Library/
├── esp32/
│   ├── Anti_Thef/
│   │   └── Anti_Thef.ino
│   └── Book_Reader/
│       └── Book_Reader.ino
│
├── server/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.js
│   └── src/
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## 🔧 Hardware Requirements

* ESP32
* RFID Reader (MFRC522 or compatible)
* RFID cards / tags
* Jumper wires
* Stable power supply

---

## 🖥 Software Requirements

* Arduino IDE or PlatformIO
* Node.js (v16+ recommended)
* npm
* Firebase project

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/akmaly255/IoT-Smart-Library.git
cd IoT-Smart-Library
```

---

### 2️⃣ Backend Setup (Node.js)

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=3000
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

> ⚠️ **Never commit `serviceAccountKey.json` or `.env` files**

Run the server:

```bash
npm start
```

---

### 3️⃣ ESP32 Setup

1. Open `.ino` files using Arduino IDE
2. Select the correct **ESP32 board** and **COM port**
3. Install required libraries:

   * MFRC522
   * WiFi
   * HTTPClient
4. Upload firmware to ESP32

---

## 🔐 Security Notes

* Secrets are excluded using `.gitignore`
* Firebase credentials are loaded via environment variables
* GitHub Push Protection is enabled

---

## 📦 Dependency Management

* `package.json` → project dependencies
* `package-lock.json` → locked dependency versions
* `node_modules/` → auto-generated (ignored)

Install dependencies with:

```bash
npm install
```

---

## 🧪 Development Notes

* Line endings normalized with `.gitattributes`
* Cross-platform (Windows / Linux / macOS)
* Clean commit history (no secrets)

---

## 📌 Future Improvements

* Web-based admin dashboard
* User authentication system
* Book availability analytics
* OTA firmware updates for ESP32

---

## 👨‍💻 Author

**Akmal Muhammad Yusuf**
Mechatronics Engineering Student
Yogyakarta State University

---

## 📄 License

This project is intended for **educational and research purposes**.
