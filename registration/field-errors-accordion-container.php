                            <!-- Field Errors Accordion Container -->
                            <div id="fieldErrorsContainer" class="alert alert-warning" role="alert" style="display: none; margin: 15px 15px 0 15px; border-radius: 8px;">
                                <div class="accordion accordion-flush" id="fieldErrorsAccordion">
                                    <div class="accordion-item border-0">
                                        <h2 class="accordion-header" id="fieldErrorsHeading">
                                            <button class="accordion-button collapsed bg-transparent text-warning fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#fieldErrorsCollapse" aria-expanded="false" aria-controls="fieldErrorsCollapse">
                                                <i class="fas fa-exclamation-circle me-2"></i>
                                                <span id="fieldErrorsTitle">Field Validation Errors</span>
                                                <span class="badge bg-warning text-dark ms-2" id="fieldErrorsCount">0</span>
                                            </button>
                                        </h2>
                                        <div id="fieldErrorsCollapse" class="accordion-collapse collapse" aria-labelledby="fieldErrorsHeading" data-bs-parent="#fieldErrorsAccordion">
                                            <div class="accordion-body pt-2">
                                                <div id="fieldErrorsList" class="list-group list-group-flush">
                                                    <!-- Field errors will be populated here -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn-close position-absolute" style="top: 8px; right: 8px;" aria-label="Close" onclick="hideFieldErrorsAccordion()"></button>
                            </div>
