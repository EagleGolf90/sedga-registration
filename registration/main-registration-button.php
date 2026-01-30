            <!-- Main Registration Button -->
            <div class="text-center mb-5">
                <!-- reCAPTCHA commented out to save -->
                <div class="d-flex justify-content-center mb-3">
                    <div class="g-recaptcha" data-sitekey="6LcO9vErAAAAACrXaBNfrSQmeR8A3sw62g1rzxr-" data-callback="onRecaptchaChange"></div>
                </div>
                <button type="button" id="startRegistrationBtn" class="btn btn-primary btn-lg px-5 py-3" onclick="openRegistrationModal()" disabled>
                    <i class="fas fa-rocket me-2"></i>Start Registration
                </button>
                <div id="recaptchaError" class="text-danger mt-2" style="display: none;">
                    <i class="fas fa-exclamation-circle me-1"></i>Please complete the reCAPTCHA verification
                </div>
            </div>
