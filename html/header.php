<?php
/**
 * Header - Meta tags, stylesheets, and scripts initialization
 * Included at the top of every page
 */
?>
<html>
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
            const recaptchaWidget = document.querySelector('.g-recaptcha');
            const siteKey = recaptchaWidget ? recaptchaWidget.getAttribute('data-sitekey') : '';

            if (!recaptchaWidget || !siteKey) {
                return;
            }

            if (!window.grecaptcha || typeof grecaptcha.getResponse !== 'function') {
                return;
            }

            const recaptchaResponse = grecaptcha.getResponse();
            const recaptchaError = document.getElementById('recaptchaError');

            if (recaptchaError && recaptchaResponse && recaptchaResponse.length > 0) {
                recaptchaError.style.display = 'none';
            }
        }
    </script>
    <script>
        window.SEDGA_API_BASE = <?php echo json_encode(rtrim(dirname($_SERVER['SCRIPT_NAME']), '/')); ?>;
    </script>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <script src="../js/registration-scripts.js?v=1" defer></script>
 </head>
<body>
