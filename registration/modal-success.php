<?php
/**
 * Success Modal - Displayed after successful registration
 */
?>

<!-- Success Modal -->
<div class="modal fade" id="successModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-body text-center py-5">
                <div class="success-icon mb-4">
                    <i class="fas fa-check-circle fa-4x text-success"></i>
                </div>
                <h4 class="text-success mb-3">Registration Complete!</h4>
                <p class="text-muted mb-4">Welcome aboard! Your registration has been successfully completed.</p>
                <div id="registrationSummary" class="mb-4"></div>
                <div class="d-flex gap-2 justify-content-center">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                        <i class="fas fa-home me-1"></i>Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
