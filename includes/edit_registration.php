<?php
function html_escape($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function normalize_status($value) {
    return strtoupper(trim((string)$value));
}

function status_label($status) {
    $normalized = normalize_status($status);
    if ($normalized === 'P') {
        return 'Pending';
    }
    if ($normalized === 'R') {
        return 'Registered';
    }
    if ($normalized === 'W') {
        return 'Withdraw';
    }
    if ($normalized === '') {
        return 'Unknown';
    }
    return $normalized;
}

$registrations = [];
$errors = [];

$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
    $errors[] = 'Database connection failed.';
} else {
    $mysqli->set_charset('utf8mb4');
    $stmt = $mysqli->prepare(
        'SELECT registration_id, first_name, last_name, state, registration_status
         FROM registrations
         ORDER BY registration_id DESC'
    );
    if ($stmt && $stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $registrations[] = $row;
        }
        $stmt->close();
    } else {
        $errors[] = 'Unable to load registrations.';
    }
}

if ($mysqli && $mysqli->ping()) {
    $mysqli->close();
}
?>
