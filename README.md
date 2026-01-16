📚 IoT Smart Library System

An IoT-based Smart Library system that integrates ESP32, RFID, and a Node.js backend with Firebase to manage book borrowing and returning efficiently and securely.

🚀 Features

📖 RFID-based book borrowing & returning

🔐 Secure backend using Firebase Admin SDK

🌐 Node.js server for data processing and API

📡 ESP32 firmware for hardware interaction

🗂 Real-time database updates

🧾 Automatic transaction logging

🏗 Project Structure
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
├── README.md

🔧 Hardware Requirements

ESP32

RFID Reader (MFRC522 or compatible)

RFID Cards / Tags

Jumper wires

Power supply

🖥 Software Requirements

Arduino IDE / PlatformIO

Node.js (v16+ recommended)

npm

Firebase project

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/akmaly255/IoT-Smart-Library.git
cd IoT-Smart-Library

2️⃣ Backend Setup (Node.js)
cd server
npm install


Create a .env file:

GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
PORT=3000


⚠️ Do NOT commit serviceAccountKey.json

Run server:

npm start

3️⃣ ESP32 Setup

Open .ino files in Arduino IDE

Select correct ESP32 board & port

Install required libraries:

MFRC522

WiFi

HTTPClient

Upload firmware

🔐 Security Notes

serviceAccountKey.json is excluded from Git

Secrets are managed using environment variables

Firebase keys must never be committed

📦 Dependency Management

package.json → defines dependencies

package-lock.json → locks versions

node_modules/ → ignored (auto-generated)

Install dependencies with:

npm install

🧪 Development Notes

Line endings normalized using .gitattributes

Cross-platform (Windows / Linux compatible)

Push protection enabled on GitHub

📌 Future Improvements

Web dashboard for admin

User authentication

Book availability analytics

OTA firmware update for ESP32

👨‍💻 Author

Akmal Muhammad Yusuf
Mechatronics Engineering Student
Yogyakarta State University

📄 License

This project is for educational and research purposes.