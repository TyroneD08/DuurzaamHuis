// DHT11 library
#include "DHT.h"
#define DHTTYPE DHT11


// DHT11 variables
uint8_t DHTPin = D7;
DHT dht(DHTPin, DHTTYPE);

// Light utility functions
void turnOffAll(){
  digitalWrite(D3, LOW);
  digitalWrite(D5, LOW);
  digitalWrite(D6, LOW);
}

void turnOnIfDark(int ldrV){
    //Serial.println(String(ldrV) + " is the LDR Value."); // for debugging

    if (ldrV < 30){
      digitalWrite(D3, HIGH);
    } else {
      turnOffAll();  
    }
}

// Read function
void ReadDHT11(){
  int ldrValue = analogRead(A0);
  
  float temperature = round(dht.readTemperature()*10)/10;
  float humidity = round(dht.readHumidity()*10)/10;
  float heatIndex = round(dht.computeHeatIndex(temperature, humidity, false)*10)/10;

  if (isnan(temperature) || isnan(humidity) || isnan(heatIndex)) {
    //sensor error
    Serial.println("DHT11 Sensor Error");
  }
  else {
    GlobalValues.Temperature = temperature;
    GlobalValues.Humidity = humidity;
    GlobalValues.HeatIndex = heatIndex;
  }
  GlobalValues.LDR = ldrValue;
  
  // turnOnIfDark(ldrValue);
}
