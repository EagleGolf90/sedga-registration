                                        <!-- Security Verification Accordion Item -->
                                        <div class="accordion-item">
                                            <h2 class="accordion-header" id="securityVerificationHeading">
                                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#securityVerificationCollapse" aria-expanded="false" aria-controls="securityVerificationCollapse">
                                                    <i class="fas fa-shield-alt me-2 text-success"></i>
                                                    <strong>Security Verification</strong>
                                                    <span class="ms-2 text-muted">(Required)</span>
                                                </button>
                                            </h2>
                                            <div id="securityVerificationCollapse" class="accordion-collapse collapse" aria-labelledby="securityVerificationHeading" data-bs-parent="#registrationAccordion">
                                                <div class="accordion-body">
                                                    <?php $recaptchaSiteKey = trim((string)($_ENV["RECAPTCHA_SITE_KEY"] ?? '')); ?>
                                                    <?php $recaptchaEnabled = $recaptchaSiteKey !== ''; ?>
                                                    <?php if ($recaptchaEnabled): ?>
                                                        <div class="d-flex justify-content-center mb-3">
                                                            <div class="g-recaptcha" data-sitekey="<?php echo htmlspecialchars($recaptchaSiteKey, ENT_QUOTES, 'UTF-8'); ?>" data-callback="onRecaptchaChange"></div>
                                                        </div>
                                                        <div id="recaptchaError" class="text-danger mb-3" style="display: none;">
                                                            <i class="fas fa-exclamation-circle me-1"></i>Please complete the reCAPTCHA verification
                                                        </div>
                                                    <?php endif; ?>
                                                    <div class="form-check mb-3">
                                                        <input class="form-check-input" type="checkbox" id="terms" required>
                                                        <label class="form-check-label" for="terms">
                                                            I agree to the <a href="#" class="text-primary">Terms and Conditions</a> *
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
