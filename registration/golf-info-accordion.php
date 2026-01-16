                                        <!-- Golf Information Accordion Item -->
                                        <div class="accordion-item">
                                            <h2 class="accordion-header" id="golfInfoHeading">
                                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#golfInfoCollapse" aria-expanded="false" aria-controls="golfInfoCollapse">
                                                    <i class="fas fa-golf-ball me-2 text-success"></i>
                                                    <strong>Golf Information</strong>
                                                    <span class="ms-2 text-muted">(Required Fields *)</span>
                                                </button>
                                            </h2>
                                            <div id="golfInfoCollapse" class="accordion-collapse collapse" aria-labelledby="golfInfoHeading" data-bs-parent="#registrationAccordion">
                                                <div class="accordion-body">
                                                    <!-- SEDGA Membership Information -->
                                                    <div class="row">
                                                        <div class="col-12 mb-3">
                                                            <h6 class="text-muted">SEDGA Membership</h6>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" id="sedgaOfficer" value="yes">
                                                                <label class="form-check-label" for="sedgaOfficer">
                                                                    <i class="fas fa-user-tie me-1"></i>Are you a current SEDGA Officer?
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="checkbox" id="sedgaHallOfFame" value="yes">
                                                                <label class="form-check-label" for="sedgaHallOfFame">
                                                                    <i class="fas fa-trophy me-1"></i>Are you a SEDGA Hall of Fame member?
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="row mt-3 ">
                                                        <div class="col-md-3 mb-3">
                                                            <label for="age" class="form-label">
                                                                <i class="fas fa-calendar me-1"></i>Age *
                                                            </label>
                                                            <input type="number" class="form-control" id="age" required>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="gender" class="form-label">Gender *</label>
                                                            <?php include '../data/gender-data.php'; ?>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="hole18Average" class="form-label">
                                                                <i class="fas fa-calculator me-1"></i>18 Hole Average *
                                                            </label>
                                                            <input type="number" class="form-control" id="hole18Average" required>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="org_id" class="form-label">Organization *</label>
                                                            <?php include '../data/organizations-data.php'; ?>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
