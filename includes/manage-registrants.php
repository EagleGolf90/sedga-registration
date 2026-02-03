<?php
$sqlTable = new SQLTable();

$yearPlayed = date("Y");
$rows = $sqlTable->load('getYearPlayed', array());
foreach ($rows as $row) $yearPlayed = $row['YearPlayed'];

$imageFile = '';
$rows = $sqlTable->load('loadHosts', array());
foreach ($rows as $row) $imageFile = $row['image_file'];

$registrants = $sqlTable->load('listRegistrants', array());
$byState = $sqlTable->load('listRegistrantsByState', array());
$byDivisions = $sqlTable->load('listRegistrantsByDivision', array());
$byClubs = $sqlTable->load('listRegistrantsByClubs', array());
$byStatus = $sqlTable->load('listRegistrantsByStatus', array());
?>
