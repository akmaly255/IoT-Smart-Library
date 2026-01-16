#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

#define WIFI_SSID "Infinix"
#define WIFI_PASSWORD "helloworld"
const String HTTP_SERVER = "http://192.168.170.234:3000";

#define SS_PIN 21
#define RST_PIN 22
#define pinLED 2
#define pinLED2 4
#define pinBuzzer 5

unsigned long lastReadTime = millis();
const unsigned long MAX_IDLE_TIME = 10000;

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
  pinMode(pinLED2, OUTPUT);
  pinMode(pinBuzzer, OUTPUT);

  digitalWrite(pinLED, LOW);
  digitalWrite(pinLED2, LOW);
  digitalWrite(pinBuzzer, LOW);
}

void loop() {
  String uid = rfidRead();

  if(uid != "" && WiFi.status() == WL_CONNECTED){
    DynamicJsonDocument res = getBookData(uid);
    Serial.println("\nSend HTTP POST Request!");
    Serial.println("Result:");
    if(res.containsKey("error")){
      Serial.println("Error: " + res["error"].as<String>());
    } else {
      Serial.println("Title: " + res["title"].as<String>());
      Serial.println("Status: " + res["status"].as<String>());

      if(res["isAvailable"]){
        digitalWrite(pinBuzzer, HIGH);
        digitalWrite(pinLED2, HIGH);
        delay(5000);
      }
      digitalWrite(pinLED2, LOW);
      digitalWrite(pinBuzzer, LOW);
    }
    Serial.println("---------------------------");
    lastReadTime = millis(); // reset timer
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

DynamicJsonDocument getBookData(String uid){
  StaticJsonDocument<200> req;
  req["uid"] = uid;

  String message;
  serializeJson(req, message);
  
  HTTPClient http;
  http.begin(HTTP_SERVER + "/get-book");
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(message);

  DynamicJsonDocument res(1024);
  if(httpResponseCode  == 200){
    String payload = http.getString();

    DeserializationError error = deserializeJson(res, payload);
    if(error){
      res["error"] = "Failed to parse JSON!";
    }
  } else if(httpResponseCode > 0){
    res["error"] = "HTTP Error code: " + String(httpResponseCode);
  } else {
    res["error"] = "Request Failed (No Connection)!";
  }

  http.end();
  return res;
}