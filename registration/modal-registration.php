<?php
/**
 * Registration Modal - Main registration form with accordions and cart
 */
?>

<!-- Registration Modal -->
<div class="modal fade" id="registrationModal" tabindex="-1" aria-labelledby="registrationModalLabel">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content modal-custom">
            <?php include 'wizard-steps-indicator.php'; ?>

            <?php include 'modal-main-title.php'; ?>

            <div class="modal-body">
                <!-- Step 1: Registration Form -->
                <div id="wizardStep1" class="wizard-step-content">
                    <div class="row g-4">
                    <!-- Registration Form Card -->
                    <div class="col-lg-8">
                        <div class="card registration-card h-100">
                            <?php include 'error-message-container.php'; ?>

                            <?php include 'field-errors-accordion-container.php'; ?>

                            <div class="card-header bg-primary text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-edit me-2"></i>Registration Details (* Required Fields)
                                </h6>
                            </div>
                            <div class="card-body">
                                <form id="registrationForm" novalidate>
                                    <!-- Registration Accordion -->
                                    <div class="accordion" id="registrationAccordion">
                                        <?php include 'personal-info-accordion.php'; ?>

                                        <?php include 'golf-info-accordion.php'; ?>

                                        <?php include 'ghin-info-accordion.php'; ?>

                                        <?php include 'emergency-contact-accordion.php'; ?>

                                        <?php include 'payment-info-accordion.php'; ?>

                                        <?php include 'security-verification-accordion.php'; ?>
                                    </div><!-- End Accordion -->
                                </form>
                            </div>
                        </div>
                    </div> <!-- End Registration Form Card -->

                    <?php include 'cart-card.php'; ?>
                  </div>
                </div>

                <?php include 'preview-confirmation.php'; ?>
            </div>

            <?php include 'modal-footer.php'; ?>
        </div>
    </div>
</div>
