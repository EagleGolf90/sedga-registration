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

$secretKey = trim((string)($_ENV['RECAPTCHA_SECRET_KEY'] ?? ''));
$siteKey = trim((string)($_ENV['RECAPTCHA_SITE_KEY'] ?? ''));
$recaptchaRequired = $secretKey !== '' && $siteKey !== '';

$requiredFields = ['firstName', 'lastName', 'email', 'cart'];
if ($recaptchaRequired) {
	$requiredFields[] = 'recaptchaToken';
}
foreach ($requiredFields as $field) {
	if (!isset($data[$field]) || ($field !== 'cart' && $field !== 'recaptchaToken' && trim((string)$data[$field]) === '')) {
		json_response(false, "Missing required field: {$field}.", [], 400);
	}
}

if (!is_array($data['cart'])) {
	json_response(false, 'Cart data must be an array.', [], 400);
}

// Verify reCAPTCHA (only when configured)
if ($recaptchaRequired) {
	$recaptchaResponse = (string)($data['recaptchaToken'] ?? '');
	if ($recaptchaResponse === '') {
		json_response(false, 'reCAPTCHA verification failed.', ['recaptcha' => ['success' => false, 'error-codes' => ['missing-input-response']]], 400);
	}

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

function html_escape($value) {
	return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function format_cart_rows($cart) {
	if (!is_array($cart) || empty($cart)) {
		return '<tr><td colspan="3">No items</td></tr>';
	}

	$rows = [];
	foreach ($cart as $item) {
		if (!is_array($item)) {
			continue;
		}
		$name = html_escape(get_value($item, 'name'));
		$price = number_format((float)get_value($item, 'price', 0), 2);
		$quantity = (int)get_value($item, 'quantity', 1);
		if ($quantity < 1) {
			$quantity = 1;
		}
		if ($name === '') {
			continue;
		}
		$rows[] = "<tr><td>{$name}</td><td style=\"text-align:right;\">{$quantity}</td><td style=\"text-align:right;\">\${$price}</td></tr>";
	}

	return empty($rows) ? '<tr><td colspan="3">No items</td></tr>' : implode('', $rows);
}

function build_registration_email($data, $registrationId, $secureId, $cartTotal) {
	$cartRows = format_cart_rows(get_value($data, 'cart', []));
	$totalFormatted = number_format((float)$cartTotal, 2);

	$body = 'Hello ' . html_escape(get_value($data, 'firstName')) . ',<br/><br/>On behalf of the SEDGA Board and the host committee, NCDGA, we ';
	$body .= 'have received your registration to participate in the 2026 SEDGA Tournament, to be held at Sea Trail Golf ';
	$body .= 'Resort (Byrd Course) in Sunset Beach, North Carolina—bordering Myrtle Beach, South Carolina—June 23–25, the week after Father’s Day.<br/><br/>';
	$body .= 'Thank you for registering to play in this tournament. We’re excited to have you join us.<br/><br/>';
	$body .= 'When submitting payment for your SEDGA registration package, please pay online using one of the following options: CashApp, Zelle, Venmo, or Apple ';
	$body .= 'Pay. We strongly encourage online payment, as it is much easier and more convenient for everyone involved.<br/><br/>';
  $body .= 'If you have any questions or concerns, please feel free to contact me at sedgasecretary@gmail.com, and/or Eli Pogue, SEDGA Treasurer, at sedgatreasurer22@gmail.com.<br/><br/>';
  $body .= 'We look forward to seeing you at Sea Trail Golf Resort this coming June!<br/><br/>';

  $body .= '******* PLEASE DO NOT LOSE OR DELETE THIS EMAIL *******<br/><br/>';
  $body .= 'How to pay entry fee to SEDGA Tournament:<br/>';
  $body .= 'You will see your payment information and how to pay your entry fee next.<br/><br/>';
  $body .= '*******************************************************<br/><br/>';

	$body .= '<h2>SEDGA Registration Summary</h2>';
	$body .= '<p><strong>Registration ID:</strong> ' . html_escape($registrationId) . '<br>';
	$body .= '<h3>Registrant</h3>';
	$body .= '<p>'
		. html_escape(get_value($data, 'firstName')) . ' '
		. html_escape(get_value($data, 'lastName')) . '<br>'
		. html_escape(get_value($data, 'email')) . '<br>'
		. html_escape(get_value($data, 'phone')) . '</p>';
	$body .= '<h3>Address</h3>';
	$body .= '<p>'
		. html_escape(get_value($data, 'address')) . '<br>'
		. html_escape(get_value($data, 'city')) . ', '
		. html_escape(get_value($data, 'state')) . ' '
		. html_escape(get_value($data, 'zipCode')) . '<br>'
		. html_escape(get_value($data, 'country')) . '</p>';
	$body .= '<h3>Emergency Contact</h3>';
	$body .= '<p>'
		. html_escape(get_value($data, 'emergencyName')) . '<br>'
		. html_escape(get_value($data, 'emergencyEmail')) . '<br>'
		. html_escape(get_value($data, 'emergencyPhone')) . '</p>';
	$body .= '<h3>Cart</h3>';
	$body .= '<table width="100%" cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;">'
		. '<thead><tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Price</th></tr></thead>'
		. '<tbody>' . $cartRows . '</tbody>'
		. '<tfoot><tr><td colspan="2" align="right"><strong>Total</strong></td><td align="right"><strong>$' . $totalFormatted . '</strong></td></tr></tfoot>'
		. '</table>';

	return $body;
}

try {
	$mysqli->begin_transaction();

	$result = $mysqli->query('SELECT COALESCE(MAX(UniqueID), 0) + 1 AS next_id FROM installation_table where BusinessUnit = \'SEDGA\' and FieldName = \'RegisterID\'');
	if (!$result) {
		throw new Exception('Failed to generate registration ID.');
	}
	$row = $result->fetch_assoc();
	$registrationId = (int)$row['next_id'];
	$result->free();

  // $registrationId = sprintf("%05s", $nextId);
	$stmt = $mysqli->prepare('UPDATE installation_table SET UniqueID = ? WHERE BusinessUnit = \'SEDGA\' and FieldName = \'RegisterID\'');
	$stmt->bind_param('i', $registrationId);
	if (!$stmt->execute()) {
		throw new Exception('Failed to update registration ID counter.');
	}

	$secureId = generate_secure_id();

	$stmt = $mysqli->prepare(
		'INSERT INTO registrations (
			secure_id, registration_id, registration_status, first_name, last_name, email, phone_type, phone,
			address, city, state, zip_code, country, age, gender, hole_18_average,
			org_id, sedga_officer, sedga_hall_of_fame, ghin_number,
			emergency_name, emergency_relationship, emergency_email, emergency_phone_type, emergency_phone,
			send_payment, send_username, receive_payment, receive_username,
			total_amount, remote_addr, http_user_agent, registration_date, last_updated
		) VALUES (
			?, ?, ?, ?, ?, ?, ?, ?,
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
	$registrationStatus = 'P';

	$bindOk = $stmt->bind_param(
		'sisssssssssssisdiiissssssssssdss',
		$secureId,
		$registrationId,
		$registrationStatus,
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

	if (!$bindOk) {
		throw new Exception('Failed to bind registration parameters: ' . $stmt->error);
	}

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

	$mailStatus = [
		'user' => ['attempted' => false, 'sent' => false],
		'admin' => ['attempted' => false, 'sent' => false]
	];

	$registrantEmail = $email;
	$fromEmail = trim((string)($_ENV['REGISTRATION_FROM_EMAIL'] ?? ''));
	$replyTo = trim((string)($_ENV['REGISTRATION_REPLY_TO'] ?? $registrantEmail));
	$officersEmail = trim((string)($_ENV['REGISTRATION_OFFICERS_EMAIL'] ?? ''));
	$officerEmails = [];
	if ($officersEmail !== '') {
		$parts = preg_split('/[\s,;]+/', $officersEmail);
		if (is_array($parts)) {
			foreach ($parts as $part) {
				$cleanEmail = trim($part);
				if ($cleanEmail !== '') {
					$officerEmails[$cleanEmail] = true;
				}
			}
		}
	}
	$officerEmails = array_keys($officerEmails);
	$host = $_SERVER['HTTP_HOST'] ?? 'example.com';
	if ($fromEmail === '') {
		$cleanHost = preg_replace('/[^a-z0-9.-]/i', '', $host);
		$fromEmail = 'no-reply@' . ($cleanHost !== '' ? $cleanHost : 'example.com');
	}

	$emailBody = build_registration_email($data, $registrationId, $secureId, $totalAmount);
	$subjectUser = "SEDGA Registration Confirmation #{$registrationId}";
	$subjectAdmin = $subjectUser;
	$fromName = trim((string)($_ENV['REGISTRATION_FROM_NAME'] ?? ''));

	$emailsPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'src-includes' . DIRECTORY_SEPARATOR . 'emails.php';
	if (is_readable($emailsPath)) {
		include_once $emailsPath;
	}

    ini_set("include_path", '/home/mddgaorg/php:' . ini_get("include_path"));
    include('Mail.php');

	if (class_exists('Email')) {
		if (filter_var($registrantEmail, FILTER_VALIDATE_EMAIL)) {
			$mailStatus['user']['attempted'] = true;
			$sender = new Email();
			$sender->setSkipPrint(false);
			$sender->setName($fromName);
			$sender->setFromEmailAddress($fromEmail);
			$sender->setToEmailAddress($registrantEmail);
			$sender->setContent($emailBody);
			$sender->setSubject($subjectUser);
			$sender->setFileAttached('');
			$mailStatus['user']['sent'] = (bool)$sender->send();
		}

		foreach ($officerEmails as $officerEmail) {
			if (!filter_var($officerEmail, FILTER_VALIDATE_EMAIL)) {
				continue;
			}
			$mailStatus['admin']['attempted'] = true;
			$sender = new Email();
			$sender->setSkipPrint(false);
			$sender->setName($fromName);
			$sender->setFromEmailAddress($fromEmail);
			$sender->setToEmailAddress($officerEmail);
			$sender->setContent($emailBody);
			$sender->setSubject($subjectAdmin);
			$sender->setFileAttached('');
			if ((bool)$sender->send()) {
				$mailStatus['admin']['sent'] = true;
			}
		}
	} else {
		$headers = [
			'MIME-Version: 1.0',
			'Content-Type: text/html; charset=UTF-8',
			'From: ' . $fromEmail,
			'Reply-To: ' . $replyTo
		];
		$headerString = implode("\r\n", $headers);

		if (filter_var($registrantEmail, FILTER_VALIDATE_EMAIL)) {
			$mailStatus['user']['attempted'] = true;
			$mailStatus['user']['sent'] = @mail(
				$registrantEmail,
				$subjectUser,
				$emailBody,
				$headerString
			);
		}

		foreach ($officerEmails as $officerEmail) {
			if (!filter_var($officerEmail, FILTER_VALIDATE_EMAIL)) {
				continue;
			}
			$mailStatus['admin']['attempted'] = true;
			if (@mail(
				$officerEmail,
				$subjectAdmin,
				$emailBody,
				$headerString
			)) {
				$mailStatus['admin']['sent'] = true;
			}
		}
	}

	json_response(true, 'Registration saved successfully.', [
		'registration_id' => $registrationId,
		'secure_id' => $secureId,
		'email' => $mailStatus
	]);
} catch (Exception $e) {
	$mysqli->rollback();
	json_response(false, $e->getMessage(), [], 500);
} finally {
	$mysqli->close();
}
?>
