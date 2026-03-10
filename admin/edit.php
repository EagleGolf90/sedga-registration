<?php
/**
 * Officer Edit Registration Page
 * Allows officers to load and update existing registrations.
 */

require_once '../includes/env.php';

include '../html/header.php';
?>

<div class="container py-4">
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                <i class="fas fa-user-edit me-2"></i>Officer Registration Edit
            </h5>
        </div>
        <div class="card-body">
            <p class="text-muted mb-3">Enter a registration ID to load an existing registration for editing.</p>
            <div class="row g-3 align-items-end">
                <div class="col-md-4">
                    <label for="editRegistrationId" class="form-label">Registration ID</label>
                    <input type="text" class="form-control" id="editRegistrationId" placeholder="e.g. 10245">
                </div>
                <div class="col-md-4">
                    <button type="button" class="btn btn-success" id="loadRegistrationBtn">
                        <i class="fas fa-search me-1"></i>Load Registration
                    </button>
                </div>
            </div>
            <div id="editLookupStatus" class="mt-3"></div>
        </div>
    </div>
</div>

<?php include '../registration/modal-registration.php'; ?>
<?php include '../registration/modal-success.php'; ?>

<script src="../js/registration-edit.js" defer></script>

<?php include '../html/footer.php'; ?>
