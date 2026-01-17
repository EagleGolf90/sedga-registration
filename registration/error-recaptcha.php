<?php
/**
 * reCAPTCHA Error Page
 * Displayed when reCAPTCHA verification fails
 */

// Include header
include '../html/header.php';
?>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="alert alert-danger" role="alert">
                <div class="text-center">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h2 class="mb-3">Verification Failed</h2>
                    <p class="lead mb-4">
                        reCAPTCHA verification could not be completed. This may indicate suspicious activity or a network issue.
                    </p>
                    <div class="mb-4">
                        <p class="text-muted mb-2">
                            <strong>What went wrong?</strong>
                        </p>
                        <ul class="text-start" style="display: inline-block;">
                            <li>You may have submitted the form too quickly</li>
                            <li>Your browser may not be compatible with reCAPTCHA</li>
                            <li>JavaScript may be disabled in your browser</li>
                            <li>There may be a temporary network issue</li>
                        </ul>
                    </div>
                    <div class="mb-4">
                        <p class="text-muted">
                            <strong>What should you do?</strong>
                        </p>
                        <ol class="text-start" style="display: inline-block;">
                            <li>Ensure JavaScript is enabled in your browser</li>
                            <li>Clear your browser cache and cookies</li>
                            <li>Try again in a few moments</li>
                            <li>If the problem persists, please contact support</li>
                        </ol>
                    </div>
                    <hr>
                    <div class="mt-4">
                        <a href="index.php" class="btn btn-primary btn-lg me-2">
                            <i class="fas fa-redo me-2"></i>Return to Registration
                        </a>
                        <a href="mailto:support@example.com" class="btn btn-secondary btn-lg">
                            <i class="fas fa-envelope me-2"></i>Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
// Include footer
include '../html/footer.php';
?>
