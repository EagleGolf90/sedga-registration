<?php
/**
 * Header - Meta tags, stylesheets, and scripts initialization
 * Included at the top of every page
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration with Cart</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="../css/registration-style.css" rel="stylesheet">
    <!-- reCAPTCHA commented out to save -->
    <script>
        // Define reCAPTCHA callback early so it's available when the API loads
        function onRecaptchaChange() {
            const recaptchaResponse = grecaptcha.getResponse();
            const startBtn = document.getElementById('startRegistrationBtn');
            
            if (startBtn) {
                if (recaptchaResponse && recaptchaResponse.length > 0) {
                    // reCAPTCHA is checked, enable the button
                    startBtn.disabled = false;
                } else {
                    // reCAPTCHA is not checked, disable the button
                    startBtn.disabled = true;
                }
            }
        }
    </script>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <script src="../js/registration-script.js" defer></script>
 </head>
<body>
