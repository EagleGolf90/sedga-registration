                    <!-- Cart Card -->
                    <div class="col-lg-4">
                        <div class="card cart-card h-100">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0 d-flex justify-content-between align-items-center">
                                    <span>
                                        <i class="fas fa-shopping-cart me-2"></i>Your Cart
                                        <span class="badge bg-light text-success ms-2" id="cartCount">0</span>
                                    </span>
                                    <span class="fw-bold">Total: <span id="headerTotal" class="text-white">$0.00</span></span>
                                </h6>
                            </div>
                            <div class="card-body">
                                <!-- Main Tournament Categories -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3 border-bottom pb-2">
                                        <i class="fas fa-golf-ball me-1"></i>Event Categories
                                    </h6>
                                    <div class="service-item" data-service="open" data-price="320.00">
                                        <div class="service-info">
                                            <div class="service-title">Open</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$320.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="service-item" data-service="seniors" data-price="310.00">
                                        <div class="service-info">
                                            <div class="service-title">Seniors</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$310.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="service-item" data-service="super-seniors" data-price="300.00">
                                        <div class="service-info">
                                            <div class="service-title">Super Seniors</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$300.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="service-item" data-service="women" data-price="320.00">
                                        <div class="service-info">
                                            <div class="service-title">Women</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$320.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Optional Services -->
                                <div class="mb-4">
                                    <h6 class="text-info mb-3 border-bottom pb-2">
                                        <i class="fas fa-plus-circle me-1"></i>Optional
                                    </h6>
                                    <div class="service-item" data-service="handicap" data-price="20.00">
                                        <div class="service-info">
                                            <div class="service-title">Handicap Tournament</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$20.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="service-item" data-service="banquet" data-price="25.00">
                                        <div class="service-info">
                                            <div class="service-title">Awards & Luncheon</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$25.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="service-item" data-service="skins-tuesday" data-price="5.00">
                                        <div class="service-info">
                                            <div class="service-title">Skins - Tuesday</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$5.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="service-item" data-service="skins-wednesday" data-price="5.00">
                                        <div class="service-info">
                                            <div class="service-title">Skins - Wednesday</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$5.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="service-item" data-service="skins-thursday" data-price="5.00">
                                        <div class="service-info">
                                            <div class="service-title">Skins - Thursday</div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$5.00</span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Cart Items -->
                                <div class="cart-items">
                                    <h6 class="text-muted mb-3">
                                        <i class="fas fa-list me-1"></i>Cart Items
                                    </h6>
                                    <div id="cartItemsContainer">
                                        <div class="empty-cart text-center text-muted py-4">
                                            <i class="fas fa-shopping-cart fa-2x mb-2 opacity-50"></i>
                                            <div>Your cart is empty</div>
                                            <small>Add services to get started</small>
                                        </div>
                                    </div>
                                </div>

                                <!-- Cart Summary -->
                                <div class="cart-summary mt-4 pt-3 border-top" style="display: none;">
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span id="total" class="text-success">$0.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
