#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

#define WIFI_SSID "Infinix"
#define WIFI_PASSWORD "helloworld"

#define SS_PIN 21
#define RST_PIN 22
#define pinLED 2

const char* websocket_server_host = "192.168.170.234";
const uint16_t websocket_server_port = 3000;
const char* websocket_path = "/";

unsigned long lastReadTime = millis();
const unsigned long MAX_IDLE_TIME = 10000;

WebSocketsClient webSocket;
MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi\n");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP address: ");
  Serial.println(WiFi.localIP());

  SPI.begin();
  rfid.PCD_Init();
  pinMode(pinLED, OUTPUT);
  
  webSocket.begin(websocket_server_host, websocket_server_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();

  String uid = rfidRead();
  if(uid != ""){
    lastReadTime = millis(); // reset timer
    sendUID(uid);
    Serial.println("Sending UID via WebSocket!");
    delay(500);
  }

  if (millis() - lastReadTime > MAX_IDLE_TIME) {
    Serial.println("🛠 Reinitializing RFID...");
    rfid.PCD_Init();  // Soft-reset the reader
    lastReadTime = millis();
  }
}

String rfidRead() {
  if(!rfid.PICC_IsNewCardPresent()) return "";
  if(!rfid.PICC_ReadCardSerial()) return "";

  digitalWrite(pinLED, HIGH);
  String uid = "";
  for(byte i = 0; i < rfid.uid.size; i++){
    uid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  
  delay(500);
  digitalWrite(pinLED, LOW);
  uid.toUpperCase();
  Serial.println("UID: " + uid);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  return uid;
}

void sendUID(String uid){
  StaticJsonDocument<200> doc;
  doc["type"] = "uid";
  doc["uid"] = uid;

  String message;
  serializeJson(doc, message);
  webSocket.sendTXT(message);
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WebSocket] Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("[WebSocket] Connected to server");
      {
        StaticJsonDocument<200> doc;
        doc["type"] = "register";
        doc["stationId"] = "station-000";

        String message;
        serializeJson(doc, message);
        webSocket.sendTXT(message);
      }
      break;
    case WStype_TEXT:
      Serial.printf("[WebSocket] Received text: %s\n", payload);
      break;
  }
}