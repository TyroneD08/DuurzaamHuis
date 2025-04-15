// JSON API: https://arduinojson.org/v6/api/

// JSON libraries
#include <ArduinoJson.h>

// JSON document
JsonDocument doc;

String CreateJSON() {
  static int attempt = 0;
  doc["attempt"] = ++attempt;
  doc["Temperature"] = GlobalValues.Temperature;
  doc["Humidity"] = GlobalValues.Humidity;
  doc["HeatIndex"] = GlobalValues.HeatIndex;
  doc["LDR"] = GlobalValues.LDR;

  String jsonString;
  serializeJson(doc, jsonString);
  SendJSONToSerial();
  
  return jsonString;
}

void SendJSONToSerial() {
  serializeJson(doc, Serial);
  Serial.println();
}

void ReadJSON(String resJSON) {
  if (resJSON.startsWith("response: ")) {
    resJSON.remove(0, 9);
  }

  // moest doen want anders werkte niet
  StaticJsonDocument<512> resDoc;  // Increased from 200 to 512

  DeserializationError error = deserializeJson(resDoc, resJSON);
  if (error) {
    Serial.print("JSON Parsing failed: ");
    Serial.println(error.c_str());
    return;  // Stop execution if JSON is invalid
  }

  //check of bestaat
  if (!resDoc.containsKey("lights")) {
    Serial.println("Error: 'lights' key is missing in JSON!");
    return;  // Prevent crash
  }

  //check of groot genoeg
  JsonArray lightsArray = resDoc["lights"].as<JsonArray>();
  if (lightsArray.size() < 3) {
    Serial.println("Error: 'lights' array is too small!");
    return;  // Prevent crash
  }
  
  const char* light0 = lightsArray[0] | "";
  const char* light1 = lightsArray[1] | "";
  const char* light2 = lightsArray[2] | "";

  int lightD3 = (strcmp(light0, "HIGH") == 0) ? HIGH : LOW;
  int lightD5 = (strcmp(light1, "HIGH") == 0) ? HIGH : LOW;
  int lightD6 = (strcmp(light2, "HIGH") == 0) ? HIGH : LOW;

  // alleen veranderen als het anders is, zodat het licht random blijft
  digitalWrite(D3, lightD3);
  digitalWrite(D5, lightD5);
  digitalWrite(D6, lightD6);
  // debug output
  // Serial.println("Light values (D3, D5, D6):");
  //Serial.print(lightD3);
  //Serial.print(" ");
  //Serial.print(lightD5);
  //Serial.print(" ");
  //Serial.println(lightD6);
}
