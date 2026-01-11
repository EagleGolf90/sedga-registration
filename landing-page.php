<?php
/**
 * Landing Page - Hero section with features and start registration button
 */
?>

<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="text-center mb-4">
                <h1 class="display-4 text-primary mb-3">
                    <i class="fas fa-user me-3"></i>SEDGA 2026 Registration
                </h1>
                <p class="lead text-muted">Join us today and start your journey</p>
            </div>

            <!-- Main Registration Button -->
            <div class="text-center mb-5">
                <!-- reCAPTCHA commented out to save -->
                <!-- <div class="d-flex justify-content-center mb-3">
                    <div class="g-recaptcha" data-sitekey="6LcO9vErAAAAACrXaBNfrSQmeR8A3sw62g1rzxr-" data-callback="onRecaptchaChange"></div>
                </div> -->
                <button type="button" id="startRegistrationBtn" class="btn btn-primary btn-lg px-5 py-3" onclick="openRegistrationModal()">
                    <i class="fas fa-rocket me-2"></i>Start Registration
                </button>
                <!-- <div id="recaptchaError" class="text-danger mt-2" style="display: none;">
                    <i class="fas fa-exclamation-circle me-1"></i>Please complete the reCAPTCHA verification
                </div> -->
            </div>

            <!-- Features Section -->
            <div class="row mb-5">
                <div class="col-md-4 text-center mb-3">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt fa-3x text-success mb-3"></i>
                    </div>
                    <h5>Secure Registration</h5>
                    <p class="text-muted">Your data is protected with enterprise-grade security</p>
                </div>
                <div class="col-md-4 text-center mb-3">
                    <div class="feature-icon">
                        <i class="fas fa-shopping-cart fa-3x text-info mb-3"></i>
                    </div>
                    <h5>Smart Cart System</h5>
                    <p class="text-muted">Add services and products during registration</p>
                </div>
                <div class="col-md-4 text-center mb-3">
                    <div class="feature-icon">
                        <i class="fas fa-clock fa-3x text-warning mb-3"></i>
                    </div>
                    <h5>Quick Process</h5>
                    <p class="text-muted">Complete your registration in just a few minutes</p>
                </div>
            </div>

        </div>
    </div>
</div>
