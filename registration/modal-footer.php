            <div class="modal-footer border-0 pt-0">
                <!-- Step 1 Footer (Registration Form) -->
                <div id="step1Footer" class="w-100 d-flex justify-content-between">
                    <button type="button" class="btn btn-info" onclick="fillDummyData()">
                        <i class="fas fa-database me-1"></i>Fill Dummy Data
                    </button>
                    <div>
                        <button type="button" class="btn btn-secondary" onclick="closeRegistrationWizard()">
                            <i class="fas fa-times me-1"></i>Cancel
                        </button>
                        <button type="submit" form="registrationForm" class="btn btn-success" id="proceedToPreview">
                            <i class="fas fa-arrow-right me-1"></i>Next: Preview
                        </button>
                    </div>
                </div>

                <!-- Step 2 Footer (Preview/Confirmation) -->
                <div id="step2Footer" class="w-100 d-flex justify-content-between" style="display: none;">
                    <button type="button" class="btn btn-secondary" onclick="goBackToForm()">
                        <i class="fas fa-arrow-left me-1"></i>Back to Edit
                    </button>
                    <div class="d-flex gap-2">
                        <button type="button" id="editDetailsPreviewBtn" class="btn btn-secondary" style="display: none;">
                            <i class="fas fa-edit me-1"></i>Edit Details
                        </button>
                        <button type="button" class="btn btn-success" id="confirmRegistrationBtn" disabled>
                            <i class="fas fa-check-circle me-1"></i>Confirm Registration
                        </button>
                    </div>
                </div>
            </div>
