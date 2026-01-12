                                        <!-- Personal Information Accordion Item -->
                                        <div class="accordion-item">
                                            <h2 class="accordion-header" id="personalInfoHeading">
                                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#personalInfoCollapse" aria-expanded="true" aria-controls="personalInfoCollapse">
                                                    <i class="fas fa-user me-2 text-primary"></i>
                                                    <strong>Personal Information</strong>
                                                    <span class="ms-2 text-muted">(Required Fields *)</span>
                                                </button>
                                            </h2>
                                            <div id="personalInfoCollapse" class="accordion-collapse collapse show" aria-labelledby="personalInfoHeading" data-bs-parent="#registrationAccordion">
                                                <div class="accordion-body">
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <label for="firstName" class="form-label">
                                                                <i class="fas fa-user me-1"></i>First Name *
                                                            </label>
                                                            <input type="text" class="form-control" id="firstName" required>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <label for="lastName" class="form-label">
                                                                <i class="fas fa-user me-1"></i>Last Name *
                                                            </label>
                                                            <input type="text" class="form-control" id="lastName" required>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <label for="email" class="form-label">
                                                                <i class="fas fa-envelope me-1"></i>Email Address *
                                                            </label>
                                                            <input type="email" class="form-control" id="email" required>
                                                            <div id="emailStatus" class="form-text"></div>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="phoneType" class="form-label">
                                                                <i class="fas fa-phone-alt me-1"></i>Phone Type *
                                                            </label>
                                                            <?php include '../data/phoneType-data.php'; ?>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="phone" class="form-label">
                                                                <i class="fas fa-phone me-1"></i>Phone Number *
                                                            </label>
                                                            <input type="tel" class="form-control" id="phone" required>
                                                        </div>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="address" class="form-label">
                                                            <i class="fas fa-map-marker-alt me-1"></i>Address *
                                                        </label>
                                                        <input type="text" class="form-control" id="address" required>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-3 mb-3">
                                                            <label for="city" class="form-label">City *</label>
                                                            <input type="text" class="form-control" id="city" required>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="state" class="form-label">State *</label>
                                                            <?php include '../data/states-data.php'; ?>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="zipCode" class="form-label">Zip Code *</label>
                                                            <input type="text" class="form-control" id="zipCode" required>
                                                        </div>
                                                        <div class="col-md-3 mb-3">
                                                            <label for="country" class="form-label">Country *</label>
                                                            <?php include '../data/countries-data.php'; ?>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
