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
$secureId = trim((string)($data['secureId'] ?? ''));
if ($registrationId <= 0) {
    json_response(false, 'Missing or invalid registration ID.', [], 400);
}

$requiredFields = ['firstName', 'lastName', 'email', 'cart'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || ($field !== 'cart' && trim((string)$data[$field]) === '')) {
        json_response(false, "Missing required field: {$field}.", [], 400);
    }
}

if (!isset($data['cart']) || !is_array($data['cart'])) {
    json_response(false, 'Cart data must be an array.', [], 400);
}

$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
    json_response(false, 'Database connection failed.', ['error' => $mysqli->connect_error], 500);
}

$mysqli->set_charset('utf8mb4');

function get_value($source, $key, $default = '') {
    return isset($source[$key]) ? $source[$key] : $default;
}

function calculate_cart_total($cart) {
    $total = 0.0;
    foreach ($cart as $item) {
        if (!is_array($item)) {
            continue;
        }
        $price = (float)get_value($item, 'price', 0);
        $quantity = (int)get_value($item, 'quantity', 1);
        if ($quantity < 1) {
            $quantity = 1;
        }
        $total += $price * $quantity;
    }
    return $total;
}

try {
    $mysqli->begin_transaction();

    if ($secureId !== '') {
        $checkStmt = $mysqli->prepare('SELECT registration_id FROM registrations WHERE registration_id = ? AND secure_id = ?');
        if (!$checkStmt) {
            throw new Exception('Failed to prepare registration check statement.');
        }
        $checkStmt->bind_param('is', $registrationId, $secureId);
    } else {
        $checkStmt = $mysqli->prepare('SELECT registration_id FROM registrations WHERE registration_id = ?');
        if (!$checkStmt) {
            throw new Exception('Failed to prepare registration check statement.');
        }
        $checkStmt->bind_param('i', $registrationId);
    }

    if (!$checkStmt->execute()) {
        throw new Exception('Failed to verify registration.');
    }

    $checkResult = $checkStmt->get_result();
    if ($checkResult->num_rows === 0) {
        $checkStmt->close();
        throw new Exception('Registration not found.');
    }
    $checkStmt->close();

    $firstName = trim((string)get_value($data, 'firstName'));
    $lastName = trim((string)get_value($data, 'lastName'));
    $email = trim((string)get_value($data, 'email'));
    $phoneType = (int)get_value($data, 'phoneType', 0);
    $phone = trim((string)get_value($data, 'phone'));
    $address = trim((string)get_value($data, 'address'));
    $city = trim((string)get_value($data, 'city'));
    $state = trim((string)get_value($data, 'state'));
    $zipCode = trim((string)get_value($data, 'zipCode'));
    $country = trim((string)get_value($data, 'country'));
    $age = (int)get_value($data, 'age', 0);
    $gender = (int)get_value($data, 'gender', 0);
    $hole18Average = (float)get_value($data, 'hole18Average', 0);
    $orgId = (int)get_value($data, 'org_id', 0);
    $sedgaOfficer = (int)(get_value($data, 'sedgaOfficer', 0) ? 1 : 0);
    $sedgaHallOfFame = (int)(get_value($data, 'sedgaHallOfFame', 0) ? 1 : 0);
    $ghinNumber = trim((string)get_value($data, 'ghinNumber'));
    $emergencyName = trim((string)get_value($data, 'emergencyName'));
    $emergencyRelationship = (int)get_value($data, 'emergencyRelationship', 0);
    $emergencyEmail = trim((string)get_value($data, 'emergencyEmail'));
    $emergencyPhoneType = (int)get_value($data, 'emergencyPhoneType', 0);
    $emergencyPhone = trim((string)get_value($data, 'emergencyPhone'));
    $sendPayment = (int)get_value($data, 'sendPayment', 0);
    $sendUsername = trim((string)get_value($data, 'sendUsername'));
    $receivePayment = (int)get_value($data, 'receivePayment', 0);
    $receiveUsername = trim((string)get_value($data, 'receiveUsername'));
    $totalAmount = (float)get_value($data, 'cartTotal', calculate_cart_total($data['cart']));
    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 350);

    $updateSql =
        'UPDATE registrations SET
            first_name = ?,
            last_name = ?,
            email = ?,
            phone_type = ?,
            phone = ?,
            address = ?,
            city = ?,
            state = ?,
            zip_code = ?,
            country = ?,
            age = ?,
            gender = ?,
            hole_18_average = ?,
            org_id = ?,
            sedga_officer = ?,
            sedga_hall_of_fame = ?,
            ghin_number = ?,
            emergency_name = ?,
            emergency_relationship = ?,
            emergency_email = ?,
            emergency_phone_type = ?,
            emergency_phone = ?,
            send_payment = ?,
            send_username = ?,
            receive_payment = ?,
            receive_username = ?,
            total_amount = ?,
            remote_addr = ?,
            http_user_agent = ?,
            last_updated = NOW()
         WHERE registration_id = ?';

    if ($secureId !== '') {
        $updateSql .= ' AND secure_id = ?';
    }

    $stmt = $mysqli->prepare($updateSql);
    if (!$stmt) {
        throw new Exception('Failed to prepare registration update statement.');
    }

    if ($secureId !== '') {
        $bindOk = $stmt->bind_param(
            'sssissssssiidiiissisisisisdssis',
            $firstName,
            $lastName,
            $email,
            $phoneType,
            $phone,
            $address,
            $city,
            $state,
            $zipCode,
            $country,
            $age,
            $gender,
            $hole18Average,
            $orgId,
            $sedgaOfficer,
            $sedgaHallOfFame,
            $ghinNumber,
            $emergencyName,
            $emergencyRelationship,
            $emergencyEmail,
            $emergencyPhoneType,
            $emergencyPhone,
            $sendPayment,
            $sendUsername,
            $receivePayment,
            $receiveUsername,
            $totalAmount,
            $remoteAddr,
            $userAgent,
            $registrationId,
            $secureId
        );
    } else {
        $bindOk = $stmt->bind_param(
            'sssissssssiidiiissisisisisdssi',
            $firstName,
            $lastName,
            $email,
            $phoneType,
            $phone,
            $address,
            $city,
            $state,
            $zipCode,
            $country,
            $age,
            $gender,
            $hole18Average,
            $orgId,
            $sedgaOfficer,
            $sedgaHallOfFame,
            $ghinNumber,
            $emergencyName,
            $emergencyRelationship,
            $emergencyEmail,
            $emergencyPhoneType,
            $emergencyPhone,
            $sendPayment,
            $sendUsername,
            $receivePayment,
            $receiveUsername,
            $totalAmount,
            $remoteAddr,
            $userAgent,
            $registrationId
        );
    }

    if (!$bindOk) {
        throw new Exception('Failed to bind registration update parameters: ' . $stmt->error);
    }

    if (!$stmt->execute()) {
        throw new Exception('Failed to update registration: ' . $stmt->error);
    }
    $stmt->close();

    $deleteStmt = $mysqli->prepare('DELETE FROM registrations_items WHERE registration_id = ?');
    if (!$deleteStmt) {
        throw new Exception('Failed to prepare registration items delete statement.');
    }
    $deleteStmt->bind_param('i', $registrationId);
    if (!$deleteStmt->execute()) {
        throw new Exception('Failed to clear registration items.');
    }
    $deleteStmt->close();

    if (!empty($data['cart'])) {
        $itemStmt = $mysqli->prepare(
            'INSERT INTO registrations_items (registration_id, item_name, item_price, quantity)
             VALUES (?, ?, ?, ?)'
        );

        if (!$itemStmt) {
            throw new Exception('Failed to prepare registration items insert statement.');
        }

        foreach ($data['cart'] as $item) {
            if (!is_array($item)) {
                continue;
            }
            $itemName = trim((string)get_value($item, 'name'));
            $itemPrice = (float)get_value($item, 'price', 0);
            $quantity = (int)get_value($item, 'quantity', 1);
            if ($quantity < 1) {
                $quantity = 1;
            }
            if ($itemName === '') {
                continue;
            }

            $itemStmt->bind_param('isdi', $registrationId, $itemName, $itemPrice, $quantity);
            if (!$itemStmt->execute()) {
                throw new Exception('Failed to insert registration item.');
            }
        }

        $itemStmt->close();
    }

    $mysqli->commit();

    json_response(true, 'Registration updated successfully.', [
        'registrationId' => $registrationId
    ]);
} catch (Exception $ex) {
    $mysqli->rollback();
    json_response(false, $ex->getMessage(), [], 500);
}
