<?php
header('Access-Control-Allow-Origin: *');

// Takes raw data from the request
$json = file_get_contents('php://input');

if(empty($json)) {
  $json = file_get_contents("jsonInput.txt");
  echo $json;
}
else {
  // If length of the json is longer than 1024, do not change the json file.
  if(strlen($json) > 1024) {
    exit("not parsing data, data is over 1024 characters!");
  }

  // Converts it into a PHP object
  // can be used later to read specific keys
  $data = json_decode($json);

  //open & write to file
  $jsonFile = fopen("jsonInput.txt", "w");
  fwrite($jsonFile, $json . "\n");
  fclose($jsonFile);

  // Send back a response
  echo "response: " . $json;

}?>
