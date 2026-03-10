<?php
header('Content-Type: application/json; charset=utf-8');

require_once '../includes/config.php';
require_once '../includes/env.php';

function json_response($success, $message, $extra = [], $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method.', [], 405);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || trim($rawBody) === '') {
    json_response(false, 'Empty request body.', [], 400);
}

$data = json_decode($rawBody, true);
if (!is_array($data)) {
    json_response(false, 'Invalid JSON payload.', [], 400);
}

$registrationId = (int)($data['registrationId'] ?? 0);
if ($registrationId <= 0) {
    json_response(false, 'Missing or invalid registration ID.', [], 400);
}

$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
    json_response(false, 'Database connection failed.', ['error' => $mysqli->connect_error], 500);
}

$mysqli->set_charset('utf8mb4');

try {
    $stmt = $mysqli->prepare(
        'SELECT secure_id, registration_id, registration_status, first_name, last_name, email, phone_type, phone,
                address, city, state, zip_code, country, age, gender, hole_18_average, org_id, sedga_officer,
                sedga_hall_of_fame, ghin_number, emergency_name, emergency_relationship, emergency_email,
                emergency_phone_type, emergency_phone, send_payment, send_username, receive_payment,
                receive_username, total_amount
         FROM registrations
         WHERE registration_id = ?'
    );

    if (!$stmt) {
        throw new Exception('Failed to prepare registration lookup statement.');
    }

    $stmt->bind_param('i', $registrationId);
    if (!$stmt->execute()) {
        throw new Exception('Failed to fetch registration.');
    }

    $result = $stmt->get_result();
    $registration = $result->fetch_assoc();
    $stmt->close();

    if (!$registration) {
        json_response(false, 'Registration not found.', [], 404);
    }

    $itemStmt = $mysqli->prepare(
        'SELECT item_name, item_price, quantity
         FROM registrations_items
         WHERE registration_id = ?
         ORDER BY item_id ASC'
    );

    if (!$itemStmt) {
        throw new Exception('Failed to prepare registration items lookup statement.');
    }

    $itemStmt->bind_param('i', $registrationId);
    if (!$itemStmt->execute()) {
        throw new Exception('Failed to fetch registration items.');
    }

    $itemsResult = $itemStmt->get_result();
    $items = [];
    while ($row = $itemsResult->fetch_assoc()) {
        $items[] = $row;
    }
    $itemStmt->close();

    json_response(true, 'Registration loaded successfully.', [
        'registration' => $registration,
        'items' => $items
    ]);
} catch (Exception $ex) {
    json_response(false, $ex->getMessage(), [], 500);
}
