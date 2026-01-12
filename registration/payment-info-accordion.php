                                        <!-- Payment Information Accordion Item -->
                                        <div class="accordion-item">
                                            <h2 class="accordion-header" id="paymentInfoHeading">
                                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paymentInfoCollapse" aria-expanded="false" aria-controls="paymentInfoCollapse">
                                                    <i class="fas fa-credit-card me-2 text-info"></i>
                                                    <strong>Payment Information</strong>
                                                    <span class="ms-2 text-muted">(Required Fields *)</span>
                                                </button>
                                            </h2>
                                            <div id="paymentInfoCollapse" class="accordion-collapse collapse" aria-labelledby="paymentInfoHeading" data-bs-parent="#registrationAccordion">
                                                <div class="accordion-body">
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <label class="form-label">
                                                                <i class="fas fa-paper-plane me-1"></i>Send Payment Type *
                                                            </label>
                                                            <select class="form-select" id="sendPayment" required>
                                                                <option value="">Select Send Payment Type</option>
                                                                <?php
                                                                $paymentType = 'SendPayment';
                                                                include '../data/payment-type-data.php';
                                                                ?>
                                                            </select>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <label for="sendUsername" class="form-label">
                                                                <i class="fas fa-wallet me-1"></i>Send UserName *
                                                            </label>
                                                            <input type="text" class="form-control" id="sendUsername" placeholder="Enter sender username" required>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <label class="form-label">
                                                                <i class="fas fa-download me-1"></i>Receive Payment Type *
                                                            </label>
                                                            <select class="form-select" id="receivePayment" required>
                                                                <option value="">Select Receive Payment Type</option>
                                                                <?php
                                                                $paymentType = 'ReceivePayment';
                                                                include '../data/payment-type-data.php';
                                                                ?>
                                                            </select>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <label for="receiveUsername" class="form-label">
                                                                <i class="fas fa-user-arrow-down me-1"></i>Receive UserName *
                                                            </label>
                                                            <div class="input-group">
                                                                <input type="text" class="form-control" id="receiveUsername" placeholder="Enter receiver username" required>
                                                                <button class="btn btn-outline-secondary" type="button" id="copyUsernameBtn" onclick="copyUsername()" title="Copy from Send UserName">
                                                                    <i class="fas fa-copy"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
