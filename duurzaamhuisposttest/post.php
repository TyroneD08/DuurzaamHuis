<?php
header('Access-Control-Allow-Origin: *');

$json = file_get_contents('php://input');

if (empty($json)) {
    $json = file_get_contents("jsonInput.json");
    echo $json;
} else {
    if (strlen($json) > 1024) {
        exit("not parsing data, data is over 1024 characters!");
    }

    $data = json_decode($json);

    $fileContents = file_get_contents("jsonInput.txt");
    $fileData = json_decode($fileContents);

    if (!$fileData) {
        $fileData = new stdClass();
    }

    $fileData->LDR = $data->LDR ?? null;
    $fileData->Temperature = $data->Temperature ?? null;
    $fileData->Humidity = $data->Humidity ?? null;
    $fileData->HeatIndex = $data->HeatIndex ?? null;

    if (!isset($fileData->lights) || !is_array($fileData->lights)) {
        $fileData->lights = ["LOW", "LOW", "LOW"]; // default 3 lights off
    }

    for ($i = 0; $i < count($fileData->lights); $i++) {
        //
    }

    $finalJson = json_encode($fileData, JSON_PRETTY_PRINT);

    file_put_contents("jsonInput.json", $finalJson . "\n");

    header('Content-Type: application/json; charset=utf-8');
    echo $finalJson;
}
?>
