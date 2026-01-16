<?php
if (empty($_POST)) {
    $registrationId = 1;
    http_response_code(500);
    echo json_encode([
        'success' => true,
        'message' => 'Registration saved successfully.',
        'registrationId' => $registrationId
    ]);
} else {
    http_response_code(201);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
