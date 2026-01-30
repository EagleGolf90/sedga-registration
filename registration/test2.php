<?php
$fileName = "files/" . date("Ymd") . ".txt";

if (file_exists($fileName)) {
  unlink($fileName);
}

$myfile = fopen($fileName, "w") or die("Unable to open file!");

fwrite($myfile, $data['firstName'] . "\n");
fwrite($myfile, $data['lastName'] . "\n");
fwrite($myfile, $data['email'] . "\n");
fwrite($myfile, $data['phoneType'] . "\n");
fwrite($myfile, $data['phone'] . "\n");
fwrite($myfile, $data['address'] . "\n");
fwrite($myfile, $data['city'] . "\n");
fwrite($myfile, $data['state'] . "\n");
fwrite($myfile, $data['zipCode'] . "\n");
fwrite($myfile, $data['country'] . "\n");
fwrite($myfile, $data['age'] . "\n");
fwrite($myfile, $data['gender'] . "\n");
fwrite($myfile, $data['hole18Average'] . "\n");
fwrite($myfile, $data['org_id'] . "\n");
fwrite($myfile, $data['sedgaOfficer'] . "\n");
fwrite($myfile, $data['sedgaHallOfFame'] . "\n");
fwrite($myfile, $data['ghinNumber'] . "\n");
fwrite($myfile, $data['emergencyName'] . "\n");
fwrite($myfile, $data['emergencyRelationship'] . "\n");
fwrite($myfile, $data['emergencyEmail'] . "\n");
fwrite($myfile, $data['emergencyPhoneType'] . "\n");
fwrite($myfile, $data['emergencyPhone'] . "\n");
fwrite($myfile, $data['sendPayment'] . "\n");
fwrite($myfile, $data['sendUsername'] . "\n");
fwrite($myfile, $data['receivePayment'] . "\n");
fwrite($myfile, $data['receiveUsername'] . "\n");

$arr = $data['cart'];
foreach ($arr as $item) {
    $value = $item['name'] . ', ' . $item['quantity'] . ', ' . $item['price'] . "\n";
    fwrite($myfile, $value);
}

fwrite($myfile, $data['cartTotal'] . "\n");

fclose($myfile);
?>
