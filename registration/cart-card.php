                    <?php include '../data/prices-loader.php'; ?>

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
                                    <?php foreach ($prices['eventCategories'] as $category): ?>
                                    <div class="service-item" data-service="<?php echo htmlspecialchars($category['id']); ?>" data-price="<?php echo number_format($category['price'], 2); ?>">
                                        <div class="service-info">
                                            <div class="service-title"><?php echo htmlspecialchars($category['name']); ?></div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$<?php echo number_format($category['price'], 2); ?></span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </div>

                                <!-- Optional Services -->
                                <div class="mb-4">
                                    <h6 class="text-info mb-3 border-bottom pb-2">
                                        <i class="fas fa-plus-circle me-1"></i>Optional
                                    </h6>
                                    <?php foreach ($prices['optionalServices'] as $service): ?>
                                    <div class="service-item" data-service="<?php echo htmlspecialchars($service['id']); ?>" data-price="<?php echo number_format($service['price'], 2); ?>">
                                        <div class="service-info">
                                            <div class="service-title"><?php echo htmlspecialchars($service['name']); ?></div>
                                        </div>
                                        <div class="service-price">
                                            <span class="price-text">$<?php echo number_format($service['price'], 2); ?></span>
                                            <button class="btn btn-sm btn-outline-success add-to-cart">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
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
