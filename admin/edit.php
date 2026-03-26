<?php
/**
 * Officer Edit Registration Page
 * Allows officers to load and update existing registrations.
 */

require_once '../includes/config.php';
require_once '../includes/env.php';

include '../includes/edit_registration.php';

include '../html/header.php';

include('../menus/return_menu.php');
?>

<div class="container py-4">
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                <i class="fas fa-user-edit me-2"></i>Officer Registration Edit
            </h5>
        </div>
        <div class="card-body">
            <p class="text-muted mb-3">Select a registration to load and edit.</p>

            <?php if (!empty($errors)) { ?>
                <div class="alert alert-danger">
                    <?php echo html_escape(implode(' ', $errors)); ?>
                </div>
            <?php } ?>

            <div class="table-responsive">
                <table class="table table-striped table-bordered align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Registration ID</th>
                            <th>Name</th>
                            <th class="text-center">State</th>
                            <th class="text-center">Status</th>
                            <th class="text-center" style="width:120px;">Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($registrations)) { ?>
                            <tr>
                                <td colspan="5" class="text-center text-muted">No registrations found.</td>
                            </tr>
                        <?php } else { ?>
                            <?php foreach ($registrations as $row) {
                                $registrationId = (int)($row['registration_id'] ?? 0);
                                $firstName = (string)($row['first_name'] ?? '');
                                $lastName = (string)($row['last_name'] ?? '');
                                $state = (string)($row['state'] ?? '');
                                $statusLabel = status_label($row['registration_status'] ?? '');
                                $fullName = trim($firstName . ' ' . $lastName);
                            ?>
                                <tr>
                                    <td><?php echo html_escape($registrationId); ?></td>
                                    <td><?php echo html_escape($fullName); ?></td>
                                    <td class="text-center"><?php echo html_escape($state); ?></td>
                                    <td class="text-center"><?php echo html_escape($statusLabel); ?></td>
                                    <td class="text-center">
                                        <?php if ($registrationId > 0) { ?>
                                            <button type="button"
                                                    class="btn btn-sm btn-success edit-registration-btn"
                                                    data-registration-id="<?php echo html_escape($registrationId); ?>">
                                                <i class="fas fa-pen me-1"></i>Edit
                                            </button>
                                        <?php } ?>
                                    </td>
                                </tr>
                            <?php } ?>
                        <?php } ?>
                    </tbody>
                </table>
            </div>

            <div id="editLookupStatus" class="mt-3"></div>
        </div>
    </div>
</div>

<?php include '../registration/modal-registration.php'; ?>
<?php include '../registration/modal-success.php'; ?>

<script src="../js/registration-edit.js" defer></script>

<?php include '../html/footer.php'; ?>
