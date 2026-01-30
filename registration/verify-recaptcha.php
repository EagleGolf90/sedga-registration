<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $secretKey = "6LcO9vErAAAAAPoISNkpB5yWsjASlSjai5tGjGyU";
    $recaptchaResponse = $_POST['g-recaptcha-response'];

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
