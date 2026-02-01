<?php
require_once '../includes/env.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $secretKey = $_ENV['RECAPTCHA_SECRET_KEY'] ?? '';
    $recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';

    // Verify with Google
    $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    $response = file_get_contents($verifyUrl . '?secret=' . $secretKey . '&response=' . $recaptchaResponse);
    $responseKeys = json_decode($response, true);

    if ($responseKeys["success"]) {
        // reCAPTCHA passed
        // echo "Form submitted successfully!";
        // Process form data here
    } else {
        die("reCAPTCHA verification failed. Please try again.");
    }
}
?>
