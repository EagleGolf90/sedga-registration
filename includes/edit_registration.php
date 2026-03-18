<?php
function html_escape($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

$registrations = [];
$errors = [];

$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
    $errors[] = 'Database connection failed.';
} else {
    $mysqli->set_charset('utf8mb4');
    $stmt = $mysqli->prepare(
        'SELECT registration_id, first_name, last_name, state
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
