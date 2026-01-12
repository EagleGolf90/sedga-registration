                                        <!-- Emergency Contact Accordion Item -->
                                        <div class="accordion-item">
                                            <h2 class="accordion-header" id="emergencyContactHeading">
                                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#emergencyContactCollapse" aria-expanded="false" aria-controls="emergencyContactCollapse">
                                                    <i class="fas fa-phone-square-alt me-2 text-danger"></i>
                                                    <strong>Emergency Contact Information</strong>
                                                    <span class="ms-2 text-muted">(Required Fields *)</span>
                                                </button>
                                            </h2>
                                            <div id="emergencyContactCollapse" class="accordion-collapse collapse" aria-labelledby="emergencyContactHeading" data-bs-parent="#registrationAccordion">
                                                <div class="accordion-body">
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <label for="emergencyName" class="form-label">
                                                                <i class="fas fa-user-shield me-1"></i>Emergency Contact Name *
                                                            </label>
                                                            <input type="text" class="form-control" id="emergencyName" required>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <label for="emergencyRelationship" class="form-label">
                                                                <i class="fas fa-heart me-1"></i>Relationship *
                                                            </label>
                                                            <?php include '../data/emergency-relationship-data.php'; ?>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <label for="emergencyEmail" class="form-label">
                                                                <i class="fas fa-envelope me-1"></i>Emergency Contact Email *
                                                            </label>
                                                            <input type="email" class="form-control" id="emergencyEmail" required>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="emergencyPhoneType" class="form-label">
                                                                <i class="fas fa-phone-alt me-1"></i>Phone Type *
                                                            </label>
                                                            <?php include '../data/emergency-phoneType-data.php'; ?>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="emergencyPhone" class="form-label">
                                                                <i class="fas fa-phone me-1"></i>Phone Number *
                                                            </label>
                                                            <input type="tel" class="form-control" id="emergencyPhone" required>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
