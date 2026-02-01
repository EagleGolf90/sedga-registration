<?php
header('Content-Type: application/json; charset=utf-8');

// require_once __DIR__ . '/../includes/config.php';
require_once '../includes/config.php';

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

$requiredFields = ['firstName', 'lastName', 'email', 'cart', 'recaptchaToken'];
foreach ($requiredFields as $field) {
	if (!isset($data[$field]) || ($field !== 'cart' && trim((string)$data[$field]) === '')) {
		json_response(false, "Missing required field: {$field}.", [], 400);
	}
}

if (!is_array($data['cart'])) {
	json_response(false, 'Cart data must be an array.', [], 400);
}

// Verify reCAPTCHA
$secretKey = '6LcO9vErAAAAAPoISNkpB5yWsjASlSjai5tGjGyU';
$recaptchaResponse = $data['recaptchaToken'];

$verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
$verifyParams = http_build_query([
	'secret' => $secretKey,
	'response' => $recaptchaResponse,
	'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
]);

$verifyContext = stream_context_create([
	'http' => [
		'method' => 'POST',
		'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
		'content' => $verifyParams,
		'timeout' => 10
	]
]);

$verifyResponse = file_get_contents($verifyUrl, false, $verifyContext);
if ($verifyResponse === false) {
	json_response(false, 'Unable to verify reCAPTCHA.', [], 500);
}

$verifyData = json_decode($verifyResponse, true);
if (empty($verifyData['success'])) {
	json_response(false, 'reCAPTCHA verification failed.', ['recaptcha' => $verifyData], 400);
}

// Connect to database
$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
	json_response(false, 'Database connection failed.', ['error' => $mysqli->connect_error], 500);
}

$mysqli->set_charset('utf8mb4');

// Helper to safely read values
function get_value($source, $key, $default = '') {
	return isset($source[$key]) ? $source[$key] : $default;
}

function generate_secure_id() {
	return strtoupper(bin2hex(random_bytes(16)));
}

try {
	$mysqli->begin_transaction();

	$result = $mysqli->query('SELECT COALESCE(MAX(registration_id), 0) + 1 AS next_id FROM registrations FOR UPDATE');
	if (!$result) {
		throw new Exception('Failed to generate registration ID.');
	}
	$row = $result->fetch_assoc();
	$registrationId = (int)$row['next_id'];
	$result->free();

	$secureId = generate_secure_id();

	$stmt = $mysqli->prepare(
		'INSERT INTO registrations (
			secure_id, registration_id, first_name, last_name, email, phone_type, phone,
			address, city, state, zip_code, country, age, gender, hole_18_average,
			org_id, sedga_officer, sedga_hall_of_fame, ghin_number,
			emergency_name, emergency_relationship, emergency_email, emergency_phone_type, emergency_phone,
			send_payment, send_username, receive_payment, receive_username,
			total_amount, remote_addr, http_user_agent, registration_date, last_updated
		) VALUES (
			?, ?, ?, ?, ?, ?, ?,
			?, ?, ?, ?, ?, ?, ?, ?,
			?, ?, ?, ?,
			?, ?, ?, ?, ?,
			?, ?, ?, ?,
			?, ?, ?, NOW(), NOW()
		)'
	);

	if (!$stmt) {
		throw new Exception('Failed to prepare registration insert statement.');
	}

	$firstName = trim((string)get_value($data, 'firstName'));
	$lastName = trim((string)get_value($data, 'lastName'));
	$email = trim((string)get_value($data, 'email'));
	$phoneType = (string)get_value($data, 'phoneType');
	$phone = trim((string)get_value($data, 'phone'));
	$address = trim((string)get_value($data, 'address'));
	$city = trim((string)get_value($data, 'city'));
	$state = trim((string)get_value($data, 'state'));
	$zipCode = trim((string)get_value($data, 'zipCode'));
	$country = trim((string)get_value($data, 'country'));
	$age = (int)get_value($data, 'age', 0);
	$gender = (string)get_value($data, 'gender');
	$hole18Average = (float)get_value($data, 'hole18Average', 0);
	$orgId = (int)get_value($data, 'org_id', 0);
	$sedgaOfficer = (int)(get_value($data, 'sedgaOfficer', 0) ? 1 : 0);
	$sedgaHallOfFame = (int)(get_value($data, 'sedgaHallOfFame', 0) ? 1 : 0);
	$ghinNumber = trim((string)get_value($data, 'ghinNumber'));
	$emergencyName = trim((string)get_value($data, 'emergencyName'));
	$emergencyRelationship = (string)get_value($data, 'emergencyRelationship');
	$emergencyEmail = trim((string)get_value($data, 'emergencyEmail'));
	$emergencyPhoneType = (string)get_value($data, 'emergencyPhoneType');
	$emergencyPhone = trim((string)get_value($data, 'emergencyPhone'));
	$sendPayment = (string)get_value($data, 'sendPayment');
	$sendUsername = trim((string)get_value($data, 'sendUsername'));
	$receivePayment = (string)get_value($data, 'receivePayment');
	$receiveUsername = trim((string)get_value($data, 'receiveUsername'));
	$totalAmount = (float)get_value($data, 'cartTotal', 0);
	$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
	$userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 350);

	$stmt->bind_param(
		'sissssssssssisdiiissssssssssdss',
		$secureId,
		$registrationId,
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
		$userAgent
	);

	if (!$stmt->execute()) {
		throw new Exception('Failed to insert registration: ' . $stmt->error);
	}
	$stmt->close();

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

	json_response(true, 'Registration saved successfully.', [
		'registration_id' => $registrationId,
		'secure_id' => $secureId
	]);
} catch (Exception $e) {
	$mysqli->rollback();
	json_response(false, $e->getMessage(), [], 500);
} finally {
	$mysqli->close();
}
?>
