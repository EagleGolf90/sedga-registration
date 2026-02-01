// Prices data object
let pricesData = {
    eventCategories: [],
    optionalServices: []
};

// Winners data object
let winnersData = [];

// Load prices from JSON file
async function loadPricesData() {
    try {
        const response = await fetch('../data/prices-data.json');
        if (!response.ok) {
            console.error('Failed to load prices data:', response.statusText);
            return false;
        }
        pricesData = await response.json();
        updatePricesInDOM();
        return true;
    } catch (error) {
        console.error('Error loading prices data:', error);
        return false;
    }
}

// Load winners data from JSON file
async function loadWinnersData() {
    try {
        const response = await fetch('../data/winners-data.json');
        if (!response.ok) {
            console.error('Failed to load winners data:', response.statusText);
            return false;
        }
        winnersData = await response.json();
        console.log('Winners data loaded:', winnersData);
        return true;
    } catch (error) {
        console.error('Error loading winners data:', error);
        return false;
    }
}

// Map tournament category IDs to division names
function mapCategoryToDivision(categoryId) {
    const categoryDivisionMap = {
        'open': 'Open',
        'seniors': 'Seniors',
        'super-seniors': 'Super Seniors',
        'women': 'Women'
    };
    return categoryDivisionMap[categoryId] || null;
}

// Get the selected tournament category (division) from cart
function getSelectedDivision() {
    const selectedCategory = cart.find(item => tournamentCategories.includes(item.service));
    if (selectedCategory) {
        return mapCategoryToDivision(selectedCategory.service);
    }
    return null;
}

// Check if current registrant is a winner with matching division
function getWinnerInfo(firstName, lastName, division = null) {
    if (!firstName || !lastName) {
        return null;
    }
    
    const firstNameLower = firstName.trim().toLowerCase();
    const lastNameLower = lastName.trim().toLowerCase();
    
    const winner = winnersData.find(w => 
        w.firstName.toLowerCase() === firstNameLower && 
        w.lastName.toLowerCase() === lastNameLower &&
        (!division || w.division === division) // Check division if provided
    );
    
    return winner || null;
}

// Check if user is a winner in ANY division (without division filter)
function getWinnerInfoAnyDivision(firstName, lastName) {
    if (!firstName || !lastName) {
        return null;
    }
    
    const firstNameLower = firstName.trim().toLowerCase();
    const lastNameLower = lastName.trim().toLowerCase();
    
    const winner = winnersData.find(w => 
        w.firstName.toLowerCase() === firstNameLower && 
        w.lastName.toLowerCase() === lastNameLower
    );
    
    return winner || null;
}

// Update cart total in both header and summary section to ensure consistency
function updateCartTotal(totalAmount) {
    const formattedTotal = `$${totalAmount.toFixed(2)}`;
    document.getElementById('total').textContent = formattedTotal;
    document.getElementById('headerTotal').textContent = formattedTotal;
}

// Check if first name matches last name for discount
function checkMatchedNameDiscount(firstName, lastName) {
    if (!firstName || !lastName) {
        return false;
    }
    
    const firstNameLower = firstName.trim().toLowerCase();
    const lastNameLower = lastName.trim().toLowerCase();
    
    // Check if the first name is contained in the last name (e.g., John Johnson)
    return firstNameLower === lastNameLower;
}

// Apply matched name discount to cart
function applyMatchedNameDiscount() {
    const firstName = (document.getElementById('firstName')?.value?.trim() || '').toLowerCase().replace(/^./, c => c.toUpperCase());
    const lastName = (document.getElementById('lastName')?.value?.trim() || '').toLowerCase().replace(/^./, c => c.toUpperCase());
    
    // Check if matched name discount should be applied
    const hasMatchedNames = checkMatchedNameDiscount(firstName, lastName);
    const hasMatchedNameDiscount = cart.some(item => item.service === 'matched-name-discount');
    
    if (hasMatchedNames && !hasMatchedNameDiscount) {
        // Add matched name discount to cart
        cart.push({
            service: 'matched-name-discount',
            title: 'Matched Name Discount',
            price: -10.00, // $10 discount for matched first and last names
            quantity: 1,
            isMatchedNameDiscount: true
        });
        console.log('Matched name discount added to cart:', firstName, lastName);
    } else if (!hasMatchedNames && hasMatchedNameDiscount) {
        // Remove matched name discount if names no longer match
        cart = cart.filter(item => item.service !== 'matched-name-discount');
        console.log('Matched name discount removed from cart');
    }
}

// Automatically add winner items to cart if user is a winner
function autoAddWinnerToCart() {
    const firstName = (document.getElementById('firstName')?.value?.trim() || '').toLowerCase().replace(/^./, c => c.toUpperCase());
    const lastName = (document.getElementById('lastName')?.value?.trim() || '').toLowerCase().replace(/^./, c => c.toUpperCase());
    const division = getSelectedDivision();
    
    if (!division) {
        // No tournament category selected yet, cannot check for winner
        return;
    }
    
    // First check if this person is a winner in ANY division
    const winnerAnyDivision = getWinnerInfoAnyDivision(firstName, lastName);
    
    // Then check if they're a winner in the SELECTED division
    const winner = getWinnerInfo(firstName, lastName, division);
    
    // Check if there's already a winner discount in cart
    const existingWinnerDiscount = cart.find(item => item.isWinnerDiscount);
    
    // If they're a winner in the selected division
    if (winner) {
        // Check if winner discount is already in cart
        const hasWinnerDiscount = cart.some(item => item.service === 'winner-discount');
        
        if (!hasWinnerDiscount) {
            // Add winner discount item to cart
            cart.push({
                service: 'winner-discount',
                title: `${winner.division} Champion`,
                price: winner.discount,
                quantity: 1,
                isWinnerDiscount: true,
                winnerInfo: winner
            });
            
            console.log('Winner detected and added to cart:', winner);
            updateCartDisplay();
        }
    } else if (winnerAnyDivision && !winner) {
        // They're a winner but not in the selected division
        // Check if there's an existing winner discount for a different division
        if (existingWinnerDiscount && existingWinnerDiscount.winnerInfo.division !== division) {
            // This shouldn't happen anymore since division changes are now blocked
            // But keep this as a safety net
            console.warn('Winner mismatch detected - division change should have been blocked');
        }
    } else if (!winner && existingWinnerDiscount) {
        // No winner match but there's a winner discount in cart
        // This could happen if user changed their name
        // Remove the winner discount in this case
        cart = cart.filter(item => !item.isWinnerDiscount);
        console.log('Winner discount removed due to name change');
        updateCartDisplay();
    }
}

// Remove cart items if the division doesn't match the selected division
function validateCartItemsByDivision() {
    const firstName = document.getElementById('firstName')?.value?.trim() || '';
    const lastName = document.getElementById('lastName')?.value?.trim() || '';
    const selectedDivision = getSelectedDivision();
    
    // Only proceed if both first name and last name are provided and division is selected
    if (!firstName || !lastName && !selectedDivision) {
        return;
    }
    
    console.log(`Validating cart items for ${firstName} ${lastName} in ${selectedDivision} division`);
    
    // Check if the person has a winner discount that doesn't match the division
    let winnerDiscountItem = cart.find(item => item.isWinnerDiscount);
    if (winnerDiscountItem && winnerDiscountItem.winnerInfo.division !== selectedDivision) {
        // Remove items that don't match the selected division
        const itemsRemoved = [];
        cart = cart.filter(item => {
            if (item.isWinnerDiscount) {
                itemsRemoved.push(`${item.winnerInfo.division} Champion discount`);
                return false; // Remove winner discount for non-matching division
            }
            return true; // Keep all other items
        });
        
        if (itemsRemoved.length > 0) {
            console.log('Removed items due to division mismatch:', itemsRemoved);
            console.log('Remaining cart:', cart);
            updateCartDisplay();
        }
    }
}

// Update prices in the DOM from pricesData
function updatePricesInDOM() {
    // Update event categories
    pricesData.eventCategories.forEach(category => {
        const serviceItem = document.querySelector(`[data-service="${category.id}"]`);
        if (serviceItem) {
            serviceItem.dataset.price = category.price.toFixed(2);
            const titleElement = serviceItem.querySelector('.service-title');
            const priceElement = serviceItem.querySelector('.price-text');
            if (titleElement) titleElement.textContent = category.name;
            if (priceElement) priceElement.textContent = '$' + category.price.toFixed(2);
        }
    });
    
    // Update optional services
    pricesData.optionalServices.forEach(service => {
        const serviceItem = document.querySelector(`[data-service="${service.id}"]`);
        if (serviceItem) {
            serviceItem.dataset.price = service.price.toFixed(2);
            const titleElement = serviceItem.querySelector('.service-title');
            const priceElement = serviceItem.querySelector('.price-text');
            if (titleElement) titleElement.textContent = service.name;
            if (priceElement) priceElement.textContent = '$' + service.price.toFixed(2);
        }
    });
}

// Cart functionality
let cart = [];
let cartTotal = 0;

// Modal state tracking
let isCompletingRegistration = false;
let isEditingDetails = false;

// Track last focused element before opening modals
let lastFocusedElement = null;

// Form data storage for edit functionality
let storedFormData = null;

// Track whether the confirm button should be enabled
let hasFormInput = false;

// reCAPTCHA verification functionality
function verifyRecaptchaAndOpenModal() {
    lastFocusedElement = document.activeElement;
    const recaptchaResponse = grecaptcha.getResponse();
    const errorDiv = document.getElementById('recaptchaError');
    
    if (!recaptchaResponse || recaptchaResponse.length === 0) {
        // reCAPTCHA not completed
        if (errorDiv) {
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
        return false;
    }
    
    // reCAPTCHA verified, hide error and open modal
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    
    const registrationModal = document.getElementById('registrationModal');
    if (registrationModal) {
        const modal = new bootstrap.Modal(registrationModal);
        modal.show();
        return true;
    }
    
    return false;
}

// Simplified function without reCAPTCHA verification
function openRegistrationModal() {
    lastFocusedElement = document.activeElement;
    const registrationModal = document.getElementById('registrationModal');
    if (registrationModal) {
        const modal = new bootstrap.Modal(registrationModal);
        modal.show();
        
        // Initialize button states when registration page starts
        // Enable: "Fill Dummy Data", "Cancel", "Next Preview"
        // Disable: "Confirm Registration", "Back to Edit"
        const fillDummyDataBtn = document.querySelector('button[onclick="fillDummyData()"]');
        const cancelBtn = document.querySelector('button[onclick="closeRegistrationWizard()"]');
        const nextPreviewBtn = document.getElementById('proceedToPreview');
        const confirmRegistrationBtn = document.getElementById('confirmRegistrationBtn');
        const backToEditBtn = document.querySelector('button[onclick="goBackToForm()"]');
        
        if (fillDummyDataBtn) fillDummyDataBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;
        if (nextPreviewBtn) nextPreviewBtn.disabled = false;
        if (confirmRegistrationBtn) confirmRegistrationBtn.disabled = true;
        if (backToEditBtn) backToEditBtn.disabled = true;
        
        return true;
    }
    
    return false;
}

function focusFallbackElement() {
    const startRegistrationBtn = document.getElementById('startRegistrationBtn');
    if (startRegistrationBtn) {
        startRegistrationBtn.focus();
        return;
    }

    document.body.setAttribute('tabindex', '-1');
    document.body.focus();
    document.body.removeAttribute('tabindex');
}

function moveFocusOutOfModal(modalElement) {
    if (!modalElement) return;

    const activeElement = document.activeElement;
    if (activeElement && modalElement.contains(activeElement)) {
        if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
            lastFocusedElement.focus();
        } else {
            focusFallbackElement();
        }
    }
}

// Email verification functionality (simplified)
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if form has any input
function checkFormHasInput() {
    const inputs = document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea');
    for (let input of inputs) {
        // Skip checkboxes and radio buttons for this check
        if (input.type === 'checkbox' || input.type === 'radio') continue;
        
        if (input.value.trim() !== '') {
            hasFormInput = true;
            updateConfirmButtonState();
            return true;
        }
    }
    hasFormInput = false;
    updateConfirmButtonState();
    return false;
}

// Update confirm registration button state based on form input and current wizard step
function updateConfirmButtonState() {
    const confirmBtn = document.getElementById('confirmRegistrationBtn');
    if (confirmBtn) {
        // Only enable the confirm button if:
        // 1. We're on the preview page (step 2)
        // 2. We have form input
        confirmBtn.disabled = !(hasFormInput && currentWizardStep === 2);
    }
}

// Error message functionality
function showErrorMessage(message) {
    const errorContainer = document.getElementById('errorMessageContainer');
    const errorText = document.getElementById('errorMessageText');
    
    if (errorContainer && errorText) {
        errorText.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.classList.add('show');
        
        // Scroll to the top of the modal to show the error message
        const modalBody = errorContainer.closest('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        
        // Also scroll the error container into view with more precise positioning
        setTimeout(() => {
            errorContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
        
        // Auto-hide after 10 seconds (increased from 8 for better readability)
        setTimeout(() => {
            hideErrorMessage();
        }, 10000);
    }
}

function hideErrorMessage() {
    const errorContainer = document.getElementById('errorMessageContainer');
    
    if (errorContainer) {
        errorContainer.classList.remove('show');
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 150); // Wait for fade animation
    }
}

// Field errors accordion functionality
function showFieldErrorsAccordion(errors) {
    const container = document.getElementById('fieldErrorsContainer');
    const errorsList = document.getElementById('fieldErrorsList');
    const errorsCount = document.getElementById('fieldErrorsCount');
    const errorsTitle = document.getElementById('fieldErrorsTitle');
    
    if (!container || !errorsList || !errorsCount || !errorsTitle) return;
    
    // Clear previous errors
    errorsList.innerHTML = '';
    
    // Update count and title
    errorsCount.textContent = errors.length;
    errorsTitle.textContent = errors.length === 1 ? 'Field Validation Error' : 'Field Validation Errors';
    
    // Populate errors list
    errors.forEach((error, index) => {
        const errorItem = document.createElement('div');
        errorItem.className = 'list-group-item list-group-item-action border-0 py-2 px-0';
        errorItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <i class="fas fa-arrow-right text-warning me-2"></i>
                        <strong class="text-dark">${error.fieldName}</strong>
                        <span class="badge bg-light text-muted ms-2 small">${error.sectionName}</span>
                    </div>
                    <div class="text-muted small">${error.message}</div>
                </div>
                <button class="btn btn-sm btn-outline-primary ms-2" onclick="focusField('${error.fieldId}')" title="Go to field">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </div>
        `;
        errorsList.appendChild(errorItem);
    });
    
    // Show the container
    container.style.display = 'block';
    
    // Scroll to show the errors accordion
    setTimeout(() => {
        container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
    }, 100);
}

function hideFieldErrorsAccordion() {
    const container = document.getElementById('fieldErrorsContainer');
    if (container) {
        container.style.display = 'none';
    }
}

function focusField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        // First, open the accordion section containing this field
        const accordionItem = field.closest('.accordion-item');
        if (accordionItem) {
            const collapseElement = accordionItem.querySelector('.accordion-collapse');
            const button = accordionItem.querySelector('.accordion-button');
            
            if (collapseElement && button) {
                // Open the accordion section
                if (!collapseElement.classList.contains('show')) {
                    button.click();
                }
                
                // Wait for accordion to open, then focus the field
                setTimeout(() => {
                    field.focus();
                    field.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                    
                    // Add a temporary highlight to the field
                    field.classList.add('field-error-highlight');
                    setTimeout(() => {
                        field.classList.remove('field-error-highlight');
                    }, 3000);
                }, 300);
            }
        } else {
            // Field is not in an accordion, just focus it
            field.focus();
            field.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }
}

// Clear error message when user starts typing or selecting
function clearErrorOnInteraction() {
    const errorContainer = document.getElementById('errorMessageContainer');
    const fieldErrorsContainer = document.getElementById('fieldErrorsContainer');
    
    if (errorContainer && errorContainer.style.display !== 'none') {
        hideErrorMessage();
    }
    
    if (fieldErrorsContainer && fieldErrorsContainer.style.display !== 'none') {
        hideFieldErrorsAccordion();
    }
}

// Security measures
let submissionAttempts = 0;
let lastSubmissionTime = 0;
let emailVerified = false;
const MAX_SUBMISSIONS = 3;
const SUBMISSION_COOLDOWN = 300000; // 5 minutes in milliseconds
// const ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com']; // Add more as needed
const ALLOWED_DOMAINS = ['gmail.com', 'juno.com', 'aol.com', 'me.com', 'icloud.com', 'rogers.com', 'comcast.net', 'yahoo.com', 'sbcglobal.net', 'rochester.rr.com', 'live.ca', 'atlanticbb.net', 'copi.org', 'msn.com', 'hotmail.com'];

// Check for suspicious behavior
function detectSuspiciousActivity() {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    
    // Check submission rate
    if (submissionAttempts >= MAX_SUBMISSIONS && timeSinceLastSubmission < SUBMISSION_COOLDOWN) {
        return {
            suspicious: true,
            reason: `Too many attempts. Please wait ${Math.ceil((SUBMISSION_COOLDOWN - timeSinceLastSubmission) / 60000)} minutes before trying again.`
        };
    }
    
    // Check for rapid submissions (less than 10 seconds)
    if (timeSinceLastSubmission > 0 && timeSinceLastSubmission < 10000) {
        return {
            suspicious: true,
            reason: 'Please wait a moment before submitting again.'
        };
    }
    
    return { suspicious: false };
}

// Define tournament categories that are mutually exclusive
const tournamentCategories = ['open', 'seniors', 'super-seniors', 'women'];

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const serviceItem = this.closest('.service-item');
        const serviceName = serviceItem.dataset.service;
        const servicePrice = parseFloat(serviceItem.dataset.price);
        const serviceTitle = serviceItem.querySelector('.service-title').textContent;
        
        // Check if this is a tournament category
        if (tournamentCategories.includes(serviceName)) {
            // Check if there's a winner discount in the cart from a different division
            let winnerDiscountItem = cart.find(item => item.isWinnerDiscount);
            if (winnerDiscountItem) {
                // Get the division of the winner discount
                const winnerDivision = winnerDiscountItem.winnerInfo.division;
                const selectedDivision = mapCategoryToDivision(serviceName);
                
                // If the divisions don't match, prevent the change
                if (winnerDivision !== selectedDivision) {
                    const errorMessage = `⚠️ CANNOT CHANGE DIVISION!\n\nYou have a ${winnerDivision} Champion prize (${winnerDiscountItem.winnerInfo.rounds} Free Round${winnerDiscountItem.winnerInfo.rounds > 1 ? 's' : ''}) in your cart.\n\nYou must remove the winner discount item from your cart before you can select a different division.`;
                    alert(errorMessage);
                    console.warn('Division change blocked due to mismatched winner discount');
                    return; // Prevent the division change
                }
            }
            
            // If no winner discount conflict, proceed with division change
            // Remove any existing tournament category from cart (but keep winner discount if it matches)
            cart = cart.filter(item => !tournamentCategories.includes(item.service));
            
            // Reset all tournament category buttons
            tournamentCategories.forEach(category => {
                const categoryButton = document.querySelector(`[data-service="${category}"] .add-to-cart`);
                if (categoryButton) {
                    categoryButton.innerHTML = '<i class="fas fa-plus"></i>';
                    categoryButton.classList.remove('btn-success');
                    categoryButton.classList.add('btn-outline-success');
                }
            });
            
            // Add the new tournament category
            cart.push({
                service: serviceName,
                title: serviceTitle,
                price: servicePrice,
                quantity: 1
            });
            
            // Update button for selected category
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.classList.remove('btn-outline-success');
            this.classList.add('btn-success');
            
            // Clear errors since a tournament category is now selected
            clearErrorOnInteraction();
            
            // Check if this user is a winner and auto-add to cart
            autoAddWinnerToCart();
            
            // Validate cart items against the newly selected division
            validateCartItemsByDivision();
        } else {
            // For non-tournament categories (optional services)
            const existingItem = cart.find(item => item.service === serviceName);
            if (existingItem) {
                // Item already exists, don't add again
                return;
            } else {
                // Special handling for banquet service - include people count
                const cartItem = {
                    service: serviceName,
                    title: serviceTitle,
                    price: servicePrice,
                    quantity: 1
                };
                
                // Add people count for banquet service
                if (serviceName === 'banquet') {
                    cartItem.peopleCount = 1; // Default to 1 person
                }
                
                cart.push(cartItem);
            }
            
            // Visual feedback for optional services
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.classList.remove('btn-outline-success');
            this.classList.add('btn-success');
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i>';
                this.classList.remove('btn-success');
                this.classList.add('btn-outline-success');
            }, 1000);
        }
        
        updateCartDisplay();
    });
});

function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const cartSummary = document.querySelector('.cart-summary');
    
    // Update cart count - count actual items (not discounts)
    const totalItems = cart.reduce((sum, item) => {
        // Skip discount-only items
        if (item.isWinnerDiscount || item.isSedgaOfficerItem || item.isMatchedNameDiscount) {
            return sum;
        }
        // For banquet, count people; for others count quantity
        if (item.service === 'banquet' && item.peopleCount) {
            return sum + item.peopleCount;
        }
        return sum + item.quantity;
    }, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart text-center text-muted py-4">
                <i class="fas fa-shopping-cart fa-2x mb-2 opacity-50"></i>
                <div>Your cart is empty</div>
                <small>Add services to get started</small>
            </div>
        `;
        updateCartTotal(0);
        cartSummary.style.display = 'none';
    } else {
        let cartItemsHtml = cart.map(item => {
            // Skip winner discount and matched name discount items in the normal cart display (will be shown separately)
            if (item.isWinnerDiscount || item.isMatchedNameDiscount) {
                return '';
            }
            
            const totalPrice = item.service === 'banquet' && item.peopleCount ? 
                (item.price * item.peopleCount).toFixed(2) : 
                (item.price * item.quantity).toFixed(2);
            
            let cartItemHtml = `
                <div class="cart-item mb-2 bg-light rounded p-2">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-truncate me-2"><strong>${item.title}</strong></span>
                        <div class="d-flex align-items-center">
                            <span class="fw-bold me-2">$${totalPrice}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item" data-service="${item.service}" style="padding: 0.125rem 0.25rem;">
                                <i class="fas fa-times" style="font-size: 0.7rem;"></i>
                            </button>
                        </div>
                    </div>`;
            
            // Add people count input for banquet service
            if (item.service === 'banquet') {
                cartItemHtml += `
                    <div class="d-flex align-items-center justify-content-between mt-2">
                        <label for="banquet-people-${item.service}" class="form-label mb-0 small text-muted">
                            <i class="fas fa-users me-1"></i>Number of People:
                        </label>
                        <div class="d-flex align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-secondary people-decrease" data-service="${item.service}" style="padding: 0.125rem 0.375rem;">
                                <i class="fas fa-minus" style="font-size: 0.7rem;"></i>
                            </button>
                            <input type="number" class="form-control form-control-sm people-count-input mx-1" 
                                   id="banquet-people-${item.service}" 
                                   data-service="${item.service}" 
                                   value="${item.peopleCount || 1}" 
                                   min="1" max="10" 
                                   style="width: 60px; text-align: center;">
                            <button type="button" class="btn btn-sm btn-outline-secondary people-increase" data-service="${item.service}" style="padding: 0.125rem 0.375rem;">
                                <i class="fas fa-plus" style="font-size: 0.7rem;"></i>
                            </button>
                        </div>
                    </div>`;
            }
            
            cartItemHtml += `</div>`;
            return cartItemHtml;
        }).join('');
        
        // Add Hall of Fame Member Fee discount if applicable
        const isHallOfFame = document.getElementById('sedgaHallOfFame')?.checked;
        if (isHallOfFame && cart.length > 0) {
            cartItemsHtml += `
                <div class="cart-item mb-2 bg-light rounded p-2" style="border-left: 4px solid #28a745;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-truncate me-2"><strong>Hall of Fame Discount</strong></span>
                        <span class="fw-bold text-success">-$45.00</span>
                    </div>
                </div>`;
        }
        
        // Add SEDGA Officer discount if applicable (only if Hall of Fame is NOT selected)
        const isSedgaOfficer = document.getElementById('sedgaOfficer')?.checked;
        if (isSedgaOfficer && !isHallOfFame && cart.length > 0) {
            cartItemsHtml += `
                <div class="cart-item mb-2 bg-light rounded p-2" style="border-left: 4px solid #007bff;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-truncate me-2"><strong>SEDGA Officer Discount</strong></span>
                        <span class="fw-bold text-info">-$25.00</span>
                    </div>
                </div>`;
        }
        
        // Add winner discount if applicable (auto-added to cart as a special item)
        let winnerDiscountItem = cart.find(item => item.isWinnerDiscount);
        if (winnerDiscountItem) {
            const discountAmount = Math.abs(winnerDiscountItem.price).toFixed(2);
            // cartItemsHtml += `
            //     <div class="cart-item mb-2 bg-light rounded p-2" style="border-left: 4px solid #20c997;">
            //         <div class="d-flex justify-content-between align-items-center">
            //             <div class="flex-grow-1">
            //                 <strong>${winnerDiscountItem.winnerInfo.division} Champion</strong><br/>
            //                 <small class="text-muted">${winnerDiscountItem.winnerInfo.rounds} Free Round${winnerDiscountItem.winnerInfo.rounds > 1 ? 's' : ''}</small>
            //             </div>
            //             <span class="fw-bold text-success">-$${discountAmount}</span>
            //         </div>
            //     </div>`;
            cartItemsHtml += `
                <div class="cart-item mb-2 bg-light rounded p-2" style="border-left: 4px solid #20c997;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <strong>${winnerDiscountItem.winnerInfo.division} Champion</strong>
                        </div>
                        <span class="fw-bold text-success">-$${discountAmount}</span>
                    </div>
                </div>`;
        }
        
        // Add matched name discount if applicable
        let matchedNameDiscountItem = cart.find(item => item.isMatchedNameDiscount);
        if (matchedNameDiscountItem) {
            const discountAmount = Math.abs(matchedNameDiscountItem.price).toFixed(2);
            cartItemsHtml += `
                <div class="cart-item mb-2 bg-light rounded p-2" style="border-left: 4px solid #ffc107;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-truncate me-2"><strong>Matched Name Discount</strong><br/><small class="text-muted">First and Last Name Match</small></span>
                        <span class="fw-bold text-warning">-$${discountAmount}</span>
                    </div>
                </div>`;
        }
        
        cartContainer.innerHTML = cartItemsHtml;
        
        // Add remove functionality
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const serviceName = this.dataset.service;
                
                // Check if the removed item is a tournament category (division)
                const isTournamentCategory = tournamentCategories.includes(serviceName);
                
                // Remove the item from cart
                cart = cart.filter(item => item.service !== serviceName);
                
                // If a division was removed and there's still a winner discount, remove it too
                if (isTournamentCategory) {
                    const winnerDiscountItem = cart.find(item => item.isWinnerDiscount);
                    if (winnerDiscountItem) {
                        cart = cart.filter(item => !item.isWinnerDiscount);
                        console.log('Winner discount removed because division was deleted from cart');
                    }
                }
                
                // Reset button state for removed item
                const serviceButton = document.querySelector(`[data-service="${serviceName}"] .add-to-cart`);
                if (serviceButton) {
                    serviceButton.innerHTML = '<i class="fas fa-plus"></i>';
                    serviceButton.classList.remove('btn-success');
                    serviceButton.classList.add('btn-outline-success');
                }
                
                updateCartDisplay();
            });
        });
        
        // Add people count functionality for banquet items
        document.querySelectorAll('.people-count-input').forEach(input => {
            input.addEventListener('input', function() {
                const serviceName = this.dataset.service;
                const peopleCount = parseInt(this.value) || 1;
                
                // Update cart item people count
                const cartItem = cart.find(item => item.service === serviceName);
                if (cartItem) {
                    cartItem.peopleCount = Math.max(1, Math.min(10, peopleCount));
                    updateCartDisplay();
                }
            });
        });
        
        // Add people count increase/decrease buttons
        document.querySelectorAll('.people-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const serviceName = this.dataset.service;
                const cartItem = cart.find(item => item.service === serviceName);
                if (cartItem && cartItem.peopleCount > 1) {
                    cartItem.peopleCount--;
                    updateCartDisplay();
                }
            });
        });
        
        document.querySelectorAll('.people-increase').forEach(button => {
            button.addEventListener('click', function() {
                const serviceName = this.dataset.service;
                const cartItem = cart.find(item => item.service === serviceName);
                if (cartItem && cartItem.peopleCount < 10) {
                    cartItem.peopleCount++;
                    updateCartDisplay();
                }
            });
        });
        
        // Calculate totals - properly handle all discount types
        let total = 0;
        
        // Add up all non-discount items (regular services and tournament categories)
        cart.forEach(item => {
            // Skip discount items in initial calculation
            if (item.isWinnerDiscount || item.isSedgaOfficerItem || item.isMatchedNameDiscount || item.isHallOfFameItem) {
                return;
            }
            
            if (item.service === 'banquet' && item.peopleCount) {
                // Banquet uses peopleCount for quantity (not item.quantity)
                total += (item.price * item.peopleCount);
            } else {
                // Regular items - use quantity field
                total += (item.price * (item.quantity || 1));
            }
        });
        
        // Apply winner discount if present (winner discount has negative price)
        winnerDiscountItem = cart.find(item => item.isWinnerDiscount);
        if (winnerDiscountItem) {
            total += winnerDiscountItem.price; // This is negative, so it subtracts
        }
        
        // Apply matched name discount if present (matched name discount has negative price)
        matchedNameDiscountItem = cart.find(item => item.isMatchedNameDiscount);
        if (matchedNameDiscountItem) {
            total += (matchedNameDiscountItem.price); // This is negative, so it subtracts
        }
        
        // Apply Hall of Fame discount ($45 off) - includes free lunch and free membership
        if (isHallOfFame && total > 0) {
            total -= 45;
            total = Math.max(0, total); // Ensure total doesn't go below zero
        }
        
        // Apply SEDGA Officer discount ($25 off for free lunch) - only if Hall of Fame is NOT selected
        if (isSedgaOfficer && !isHallOfFame && total > 0) {
            total -= 25;
            total = Math.max(0, total); // Ensure total doesn't go below zero
        }
        
        // Ensure total is never negative and is properly formatted
        total = Math.max(0, total);
        
        // Store the calculated total in the global cartTotal variable
        cartTotal = total;
        
        updateCartTotal(total);
        
        cartSummary.style.display = 'block';
    }
    
    // Show/hide GHIN accordion section based on handicap tournament selection
    const ghinAccordionItem = document.getElementById('ghinAccordionItem');
    const ghinInput = document.getElementById('ghinNumber');
    const hasHandicapTournament = cart.some(item => item.service === 'handicap');
    
    if (hasHandicapTournament) {
        ghinAccordionItem.style.display = 'block';
        ghinInput.setAttribute('required', 'required');
        
        // If golf section is completed and GHIN just became available, open GHIN section
        setTimeout(() => {
            const golfSection = document.getElementById('golfInfoCollapse');
            const ghinSection = document.getElementById('ghinInfoCollapse');
            if (golfSection && golfSection.classList.contains('show') && 
                ghinSection && !ghinSection.classList.contains('show')) {
                // Check if golf section is completed
                const golfRequiredFields = golfSection.querySelectorAll('input[required], select[required]');
                let golfCompleted = true;
                for (let field of golfRequiredFields) {
                    if (!field.value.trim()) {
                        golfCompleted = false;
                        break;
                    }
                }
                
                if (golfCompleted) {
                    const bsCollapse = new bootstrap.Collapse(ghinSection, { show: true });
                    setTimeout(() => {
                        const firstInput = ghinSection.querySelector('input, select');
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }, 300);
                }
            }
        }, 100);
    } else {
        ghinAccordionItem.style.display = 'none';
        ghinInput.removeAttribute('required');
        ghinInput.value = ''; // Clear the input when hidden
        
        // If GHIN section was open, close it and potentially open next section
        setTimeout(() => {
            const ghinSection = document.getElementById('ghinInfoCollapse');
            if (ghinSection && ghinSection.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(ghinSection, { hide: true });
            }
        }, 100);
    }
}

// Build cart data with proper structure and include all discounts for submission
function buildCartForSubmission() {
    const cartItems = [];
    
    // Add all cart items with proper field names (name instead of title, service -> type)
    cart.forEach(item => {
        // Skip displaying winner discount separately in items (it's a special item)
        // Include it but mark it specially
        cartItems.push({
            name: item.title,
            type: item.service,
            price: item.price,
            quantity: item.service === 'banquet' && item.peopleCount ? item.peopleCount : item.quantity,
            isDiscount: item.isWinnerDiscount ? true : false,
            originalQuantity: item.quantity
        });
    });
    
    // Add Hall of Fame discount as a separate line item if applicable
    const isHallOfFame = document.getElementById('sedgaHallOfFame')?.checked;
    if (isHallOfFame && cart.length > 0) {
        cartItems.push({
            name: 'Hall of Fame Discount',
            type: 'hall-of-fame-discount',
            price: -45.00,
            quantity: 1,
            isDiscount: true
        });
    }
    
    // Add SEDGA Officer discount if applicable (only if Hall of Fame is NOT selected)
    const isSedgaOfficer = document.getElementById('sedgaOfficer')?.checked;
    if (isSedgaOfficer && !isHallOfFame && cart.length > 0) {
        cartItems.push({
            name: 'SEDGA Officer Discount',
            type: 'sedga-officer-discount',
            price: -25.00,
            quantity: 1,
            isDiscount: true
        });
    }
    
    return cartItems;
}

// Complete registration function
function completeRegistration() {
    const getApiUrl = (endpoint) => {
        const base = (window.SEDGA_API_BASE || '').replace(/\/$/, '');
        if (base) {
            return `${base}/${endpoint.replace(/^\//, '')}`;
        }
        return new URL(endpoint, window.location.href).toString();
    };

    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value.toLowerCase().replace(/^./, c => c.toUpperCase()),
        lastName: document.getElementById('lastName').value.toLowerCase().replace(/^./, c => c.toUpperCase()),
        email: document.getElementById('email').value.toLowerCase(),
        phoneType: parseInt(document.getElementById('phoneType')?.value || 0),
        phone: document.getElementById('phone').value,
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        zipCode: document.getElementById('zipCode')?.value || '',
        country: document.getElementById('country')?.value || '',
        age: parseInt(document.getElementById('age')?.value || 0),
        gender: parseInt(document.getElementById('gender')?.value || 0),
        hole18Average: parseInt(document.getElementById('hole18Average')?.value || 0),
        org_id: parseInt(document.getElementById('org_id')?.value || 0),
        sedgaOfficer: document.getElementById('sedgaOfficer')?.checked ? 1 : 0,
        sedgaHallOfFame: document.getElementById('sedgaHallOfFame')?.checked ? 1 : 0,
        ghinNumber: document.getElementById('ghinNumber')?.value || '',
        emergencyName: document.getElementById('emergencyName')?.value || '',
        emergencyRelationship: parseInt(document.getElementById('emergencyRelationship')?.value || 0),
        emergencyEmail: (document.getElementById('emergencyEmail')?.value || '').toLowerCase(),
        emergencyPhoneType: parseInt(document.getElementById('emergencyPhoneType')?.value || 0),
        emergencyPhone: document.getElementById('emergencyPhone')?.value || '',
        sendPayment: parseInt(document.getElementById('sendPayment')?.value || 0),
        sendUsername: document.getElementById('sendUsername')?.value || '',
        receivePayment: parseInt(document.getElementById('receivePayment')?.value || 0),
        receiveUsername: document.getElementById('receiveUsername')?.value || '',
        cart: buildCartForSubmission(),
        cartTotal: cartTotal,
        recaptchaToken: grecaptcha.getResponse()
    };

    // Send AJAX request to demo.php
    fetch(getApiUrl('../js/demo.php'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(async response => {
        const contentType = response.headers.get('content-type') || '';
        const responseText = await response.text();
        const cleanedText = responseText.replace(/^\uFEFF/, '').trim();

        if (!cleanedText) {
            throw new Error(`Server returned empty response (${response.status})`);
        }

        try {
            return JSON.parse(cleanedText);
        } catch (parseError) {
            const firstJsonChar = cleanedText.search(/[\[{]/);
            if (firstJsonChar >= 0) {
                const possibleJson = cleanedText.slice(firstJsonChar);
                try {
                    return JSON.parse(possibleJson);
                } catch (innerError) {
                    const lastJsonChar = Math.max(possibleJson.lastIndexOf('}'), possibleJson.lastIndexOf(']'));
                    if (lastJsonChar !== -1) {
                        for (let end = lastJsonChar; end >= 0; end--) {
                            const ch = possibleJson[end];
                            if (ch === '}' || ch === ']') {
                                const candidate = possibleJson.slice(0, end + 1);
                                try {
                                    return JSON.parse(candidate);
                                } catch (candidateError) {
                                    // keep trying shorter tail
                                }
                            }
                        }
                    }
                }
            }
            console.error('Non-JSON response body:', responseText);
            throw new Error(`Server returned ${contentType || 'unknown content type'} (${response.status})`);
        }
    })
    .then(data => {
        if (data.success) {
            console.log('Registration saved successfully:', data);
            
            // Create simple success message
            const summary = `
                <div class="text-center">
                    <p class="text-muted">Thank you, <strong>${formData.firstName} ${formData.lastName}</strong>!</p>
                    <p class="text-muted">A confirmation email will be sent to <strong>${formData.email}</strong></p>
                </div>
            `;
            
            document.getElementById('registrationSummary').innerHTML = summary;
            
            // Show the "Edit Details" button in the success modal
            const editDetailsBtn = document.getElementById('editDetailsBtn');
            if (editDetailsBtn) {
                editDetailsBtn.style.display = 'inline-block';
            }
            
            // Hide all existing modals first
            const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
            const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
            
            if (registrationModal) {
                registrationModal.hide();
            }
            if (confirmationModal) {
                confirmationModal.hide();
            }
            
            // Show success modal after ensuring other modals are closed
            setTimeout(() => {
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
                
                // Auto-close success modal after 5 seconds and reset everything
                setTimeout(() => {
                    successModal.hide();
                    resetAllModalsAndForm();
                    console.log('All modals and form data have been reset');
                }, 5000);
            }, 500);
        } else {
            console.error('Registration failed:', data.message);
            
            // Check if this is a reCAPTCHA verification error
            if (data.message && data.message.includes('reCAPTCHA')) {
                // Redirect to error page for reCAPTCHA failures
                window.location.href = '../registration/error-recaptcha.php';
            } else {
                // Show error for other validation issues
                alert('Error saving registration: ' + (data.message || 'Unknown error'));
            }
        }
    })
    .catch(error => {
        console.error('AJAX error:', error);
        alert('Error connecting to server: ' + error.message);
    });
}

// Show confirmation modal with all user data (legacy - now uses wizard step 2)
function showConfirmationModal() {
    // This function is kept for backward compatibility
    // It now just proceeds to the wizard step 2 instead
    proceedToPreview();
}

// Handle Edit Details button click - close confirmation modal and reopen registration modal
function handleEditDetails() {
    // Check if storedFormData exists before proceeding
    if (!storedFormData) {
        console.error('Edit Details called but no form data is available. Please submit the form first.');
        return;
    }
    
    isEditingDetails = true;
    
    console.log('handleEditDetails called, storedFormData:', storedFormData);
    
    // Hide the confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }
    
    // After confirmation modal is hidden, show the registration modal first
    setTimeout(() => {
        console.log('Reopening registration modal for editing details, storedFormData:', storedFormData);
        
        // Get the registration modal element and show it
        const registrationModalElement = document.getElementById('registrationModal');
        let registrationModal = bootstrap.Modal.getInstance(registrationModalElement);
        
        // If no instance exists, create one
        if (!registrationModal) {
            registrationModal = new bootstrap.Modal(registrationModalElement);
        }
        
        // Show the modal
        registrationModal.show();
        
        // After the modal is shown, restore the data
        setTimeout(() => {
            console.log('Restoring data to form, storedFormData:', storedFormData);
            
            if (storedFormData) {
                console.log('Calling populateFormFields with:', storedFormData);
                // populateFormFields will handle both form data AND cart restoration
                populateFormFields(storedFormData);
                
                console.log('Data restoration complete');
            } else {
                console.error('storedFormData became null during restoration process');
            }
            
            // Reset the editing flag
            isEditingDetails = false;
        }, 500); // Wait for modal to be fully shown
    }, 300);
}

// Collect all form data
function collectFormData() {
    const formData = {
        // Personal Information
        firstName: document.getElementById('firstName').value.toLowerCase().replace(/^./, c => c.toUpperCase()),
        lastName: document.getElementById('lastName').value.toLowerCase().replace(/^./, c => c.toUpperCase()),
        email: document.getElementById('email').value.toLowerCase(),
        phoneType: document.getElementById('phoneType').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value,
        
        // Golf Information
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        hole18Average: document.getElementById('hole18Average').value,
        org_id: document.getElementById('org_id').value,
        sedgaOfficer: document.getElementById('sedgaOfficer').checked,
        sedgaHallOfFame: document.getElementById('sedgaHallOfFame').checked,
        
        // Emergency Contact
        emergencyName: document.getElementById('emergencyName').value,
        emergencyRelationship: document.getElementById('emergencyRelationship').value,
        emergencyEmail: document.getElementById('emergencyEmail').value.toLowerCase(),
        emergencyPhoneType: document.getElementById('emergencyPhoneType').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        
        // Payment Information
        sendPayment: document.getElementById('sendPayment').value,
        sendUsername: document.getElementById('sendUsername').value,
        receivePayment: document.getElementById('receivePayment').value,
        receiveUsername: document.getElementById('receiveUsername').value,
        
        // Security
        terms: document.getElementById('terms').checked
    };
    
    // Add GHIN number if handicap tournament is selected
    const hasHandicapTournament = cart.some(item => item.service === 'handicap');
    if (hasHandicapTournament) {
        formData.ghinNumber = document.getElementById('ghinNumber').value;
    }
    
    return formData;
}

// Populate form fields with stored data
function populateFormFields(storedData) {
    if (!storedData) {
        console.warn('No stored data provided to populateFormFields');
        return;
    }
    
    console.log('Populating form fields from stored data', storedData);
    
    const data = storedData.formData || storedData; // Handle both old and new data structure
    
    console.log('Extracted data:', data);
    
    // Personal Information
    console.log('Setting firstName to:', data.firstName);
    document.getElementById('firstName').value = data.firstName || '';
    document.getElementById('lastName').value = data.lastName || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phoneType').value = data.phoneType || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('city').value = data.city || '';
    document.getElementById('state').value = data.state || '';
    document.getElementById('zipCode').value = data.zipCode || '';
    document.getElementById('country').value = data.country || '';
    
    console.log('Personal information set');
    
    // Golf Information
    document.getElementById('age').value = data.age || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('hole18Average').value = data.hole18Average || '';
    document.getElementById('org_id').value = data.org_id || '';
    document.getElementById('sedgaOfficer').checked = data.sedgaOfficer || false;
    document.getElementById('sedgaHallOfFame').checked = data.sedgaHallOfFame || false;
    
    console.log('Golf information set');
    
    // Emergency Contact
    if (document.getElementById('emergencyName')) {
        document.getElementById('emergencyName').value = data.emergencyName || '';
    }
    if (document.getElementById('emergencyRelationship')) {
        document.getElementById('emergencyRelationship').value = data.emergencyRelationship || '';
    }
    if (document.getElementById('emergencyEmail')) {
        document.getElementById('emergencyEmail').value = data.emergencyEmail || '';
    }
    if (document.getElementById('emergencyPhoneType')) {
        document.getElementById('emergencyPhoneType').value = data.emergencyPhoneType || '';
    }
    if (document.getElementById('emergencyPhone')) {
        document.getElementById('emergencyPhone').value = data.emergencyPhone || '';
    }
    
    console.log('Emergency contact set');
    
    // Payment Information
    if (document.getElementById('sendPayment')) {
        document.getElementById('sendPayment').value = data.sendPayment || '';
    }
    if (document.getElementById('sendUsername')) {
        document.getElementById('sendUsername').value = data.sendUsername || '';
    }
    if (document.getElementById('receivePayment')) {
        document.getElementById('receivePayment').value = data.receivePayment || '';
    }
    if (document.getElementById('receiveUsername')) {
        document.getElementById('receiveUsername').value = data.receiveUsername || '';
    }
    
    console.log('Payment information set');
    
    // GHIN Information (if handicap tournament is selected)
    if (data.ghinNumber && document.getElementById('ghinNumber')) {
        document.getElementById('ghinNumber').value = data.ghinNumber || '';
    }
    
    // Security/Terms
    if (document.getElementById('terms')) {
        document.getElementById('terms').checked = data.terms || false;
    }
    
    console.log('Form fields populated, now restoring cart state');
    
    // Restore cart state if available in new format
    if (storedData.cartData) {
        console.log('Cart data found:', storedData.cartData);
        restoreCartState(storedData.cartData, storedData.cartTotal);
    } else {
        console.warn('No cartData found in storedData');
    }
    
    // Trigger email validation if email is populated
    if (data.email) {
        const emailEvent = new Event('input', { bubbles: true });
        document.getElementById('email').dispatchEvent(emailEvent);
    }
    
    console.log('Form fields populated successfully');
}

// Restore cart state from stored data
function restoreCartState(cartData, total) {
    if (!cartData || !Array.isArray(cartData)) {
        console.warn('No valid cart data to restore');
        return;
    }
    
    console.log('Restoring cart state. Items:', cartData.length, 'Total:', total);
    
    // First, clear current cart and reset button states
    cart = [];
    cartTotal = 0;
    
    // Reset all add-to-cart buttons to default state
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-success');
        button.innerHTML = '<i class="fas fa-plus"></i>';
    });
    
    // Restore cart items and update button states
    cartData.forEach(item => {
        // Add item back to cart
        cart.push(item);
        console.log('Restored cart item:', item.service);
        
        // Update corresponding button state
        const serviceButton = document.querySelector(`[data-service="${item.service}"] .add-to-cart`);
        if (serviceButton) {
            serviceButton.classList.remove('btn-outline-success');
            serviceButton.classList.add('btn-success');
            serviceButton.innerHTML = '<i class="fas fa-check"></i>';
            console.log('Updated button state for:', item.service);
        } else {
            console.warn('Button not found for service:', item.service);
        }
    });
    
    // Restore cart total
    cartTotal = total || 0;
    
    // Update cart display
    console.log('Updating cart display');
    updateCartDisplay();
    
    // Show/hide GHIN section based on handicap tournament selection
    const hasHandicapTournament = cart.some(item => item.service === 'handicap');
    const ghinAccordionItem = document.getElementById('ghinAccordionItem');
    if (ghinAccordionItem) {
        ghinAccordionItem.style.display = hasHandicapTournament ? 'block' : 'none';
        console.log('GHIN accordion visibility set to:', hasHandicapTournament ? 'visible' : 'hidden');
    }
    
    console.log('Cart restoration complete');
}

// Generate confirmation HTML
function generateConfirmationHTML(data) {
    // Helper function to get display text for select options
    const getSelectText = (selectId, value) => {
        const select = document.getElementById(selectId);
        const option = select.querySelector(`option[value="${value}"]`);
        return option ? option.textContent : value;
    };
    
    // Helper function to format phone type
    const getPhoneTypeText = (type) => {
        const types = {
            '1': 'Mobile',
            '2': 'Home', 
            '3': 'Video Relay Service (VRS)'
        };
        return types[type] || type;
    };
    
    // Helper function to format payment type
    const getPaymentTypeText = (type) => {
        const types = {
            '1': 'CashApp',
            '2': 'Venmo',
            '3': 'Zelle',
            '4': 'Mail',
            '5': 'Apple Pay'
        };
        return types[type] || type;
    };
    
    return `
        <div class="row">
            <!-- Personal Information -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-user me-2"></i>Personal Information</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless table-sm">
                            <tr><td><strong>Name:</strong></td><td>${data.firstName} ${data.lastName}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
                            <tr><td><strong>Phone:</strong></td><td>${getPhoneTypeText(data.phoneType)} - ${data.phone}</td></tr>
                            <tr><td><strong>Address:</strong></td><td>${data.address}</td></tr>
                            <tr><td><strong>City:</strong></td><td>${data.city}</td></tr>
                            <tr><td><strong>State:</strong></td><td>${getSelectText('state', data.state)}</td></tr>
                            <tr><td><strong>Zip Code:</strong></td><td>${data.zipCode}</td></tr>
                            <tr><td><strong>Country:</strong></td><td>${getSelectText('country', data.country)}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Golf Information -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0"><i class="fas fa-golf-ball me-2"></i>Golf Information</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless table-sm">
                            <tr><td><strong>Age:</strong></td><td>${data.age}</td></tr>
                            <tr><td><strong>Gender:</strong></td><td>${getSelectText('gender', data.gender)}</td></tr>
                            <tr><td><strong>18 Hole Average:</strong></td><td>${data.hole18Average}</td></tr>
                            <tr><td><strong>Organization:</strong></td><td>${getSelectText('org_id', data.org_id)}</td></tr>
                            <tr><td><strong>SEDGA Officer:</strong></td><td>${data.sedgaOfficer ? 'Yes' : 'No'}</td></tr>
                            <tr><td><strong>Hall of Fame:</strong></td><td>${data.sedgaHallOfFame ? 'Yes' : 'No'}</td></tr>
                            ${data.ghinNumber ? `<tr><td><strong>GHIN Number:</strong></td><td>${data.ghinNumber}</td></tr>` : ''}
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Emergency Contact -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-danger text-white">
                        <h6 class="mb-0"><i class="fas fa-phone-square-alt me-2"></i>Emergency Contact</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless table-sm">
                            <tr><td><strong>Name:</strong></td><td>${data.emergencyName}</td></tr>
                            <tr><td><strong>Relationship:</strong></td><td>${getSelectText('emergencyRelationship', data.emergencyRelationship)}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>${data.emergencyEmail}</td></tr>
                            <tr><td><strong>Phone:</strong></td><td>${getPhoneTypeText(data.emergencyPhoneType)} - ${data.emergencyPhone}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Payment Information -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0"><i class="fas fa-credit-card me-2"></i>Payment Information</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless table-sm">
                            <tr><td><strong>Send Payment:</strong></td><td>${getPaymentTypeText(data.sendPayment)}</td></tr>
                            <tr><td><strong>Send Username:</strong></td><td>${data.sendUsername}</td></tr>
                            <tr><td><strong>Receive Payment:</strong></td><td>${getPaymentTypeText(data.receivePayment)}</td></tr>
                            <tr><td><strong>Receive Username:</strong></td><td>${data.receiveUsername}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            
            ${cart.length > 0 ? `
            <!-- Cart Items -->
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h6 class="mb-0"><i class="fas fa-shopping-cart me-2"></i>Selected Services</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-borderless">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${cart.map(item => {
                                        // Skip discount items here (will be shown in discounts section)
                                        if (item.isWinnerDiscount || item.isMatchedNameDiscount) {
                                            return '';
                                        }
                                        if (item.service === 'banquet' && item.peopleCount) {
                                            return `
                                                <tr>
                                                    <td>${item.title}</td>
                                                    <td>${item.peopleCount} people</td>
                                                    <td>$${item.price.toFixed(2)}</td>
                                                    <td>$${(item.price * item.peopleCount).toFixed(2)}</td>
                                                </tr>
                                            `;
                                        }
                                        return `
                                            <tr>
                                                <td>${item.title}</td>
                                                <td>${item.quantity}</td>
                                                <td>$${item.price.toFixed(2)}</td>
                                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                    
                                    <!-- Discounts -->
                                    ${(() => {
                                        let discountsHTML = '';
                                        const isHallOfFame = document.getElementById('sedgaHallOfFame')?.checked;
                                        const isSedgaOfficer = document.getElementById('sedgaOfficer')?.checked;
                                        
                                        if (isHallOfFame) {
                                            discountsHTML += `
                                                <tr style="border-top: 1px solid #28a745;">
                                                    <td><strong style="color: #28a745;">Hall of Fame Discount</strong></td>
                                                    <td>1</td>
                                                    <td>-$45.00</td>
                                                    <td style="color: #28a745;"><strong>-$45.00</strong></td>
                                                </tr>
                                                <tr><td><small class="text-muted">Free Lunch, Free Membership</small></td></tr>
                                            `;
                                        } else if (isSedgaOfficer) {
                                            discountsHTML += `
                                                <tr style="border-top: 1px solid #007bff;">
                                                    <td><strong style="color: #007bff;">SEDGA Officer Discount</strong></td>
                                                    <td>1</td>
                                                    <td>-$25.00</td>
                                                    <td style="color: #007bff;"><strong>-$25.00</strong></td>
                                                </tr>
                                                <tr><td><small class="text-muted">Free Lunch</small></td></tr>
                                            `;
                                        }
                                        
                                        // Get winner discount from cart items
                                        const winnerDiscountItem = cart.find(item => item.isWinnerDiscount);
                                        if (winnerDiscountItem) {
                                            const discountAmount = Math.abs(winnerDiscountItem.price).toFixed(2);
                                            discountsHTML += `
                                                <tr style="border-top: 1px solid #20c997;">
                                                    <td><strong style="color: #20c997;">${winnerDiscountItem.winnerInfo.division} Champion</strong></td>
                                                    <td>1</td>
                                                    <td>-$${discountAmount}</td>
                                                    <td style="color: #20c997;"><strong>-$${discountAmount}</strong></td>
                                                </tr>
                                                <tr><td><small class="text-muted">${winnerDiscountItem.winnerInfo.rounds} Free Round${winnerDiscountItem.winnerInfo.rounds > 1 ? 's' : ''}</small></td></tr>
                                            `;
                                        }
                                        
                                        // Get matched name discount from cart items
                                        const matchedNameDiscountItem = cart.find(item => item.isMatchedNameDiscount);
                                        if (matchedNameDiscountItem) {
                                            const discountAmount = Math.abs(matchedNameDiscountItem.price).toFixed(2);
                                            discountsHTML += `
                                                <tr style="border-top: 1px solid #ffc107;">
                                                    <td><strong style="color: #ffc107;">Matched Name Discount</strong></td>
                                                    <td>1</td>
                                                    <td>-$${discountAmount}</td>
                                                    <td style="color: #ffc107;"><strong>-$${discountAmount}</strong></td>
                                                </tr>
                                                <tr><td><small class="text-muted">First and Last Name Match</small></td></tr>
                                            `;
                                        }
                                        
                                        return discountsHTML;
                                    })()}
                                </tbody>
                                <tfoot>
                                    <tr class="fw-bold">
                                        <td colspan="3">Total:</td>
                                        <td class="text-success">${document.getElementById('total').textContent}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// Add success modal event handler
document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
    // Always reset everything when success modal is closed
    resetAllModalsAndForm();
});

// Email verification functionality
document.getElementById('email').addEventListener('input', function() {
    const email = this.value;
    const emailStatus = document.getElementById('emailStatus');
    
    if (email && isValidEmail(email)) {
        emailVerified = true;
        emailStatus.innerHTML = '<i class="fas fa-check-circle text-success"></i> Valid email address';
    } else if (email) {
        emailVerified = false;
        emailStatus.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i> Please enter a valid email address';
    } else {
        emailVerified = false;
        emailStatus.innerHTML = '';
    }
});



// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Check if domain is suspicious
    const domain = email.split('@')[1].toLowerCase();
    const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwaway.email', 'mailinator.com'];
    
    if (suspiciousDomains.includes(domain)) {
        const emailStatus = document.getElementById('emailStatus');
        if (emailStatus) {
            emailStatus.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i> Temporary email addresses are not allowed';
        }
        return false;
    }
    
    return true;
}

// Emergency contact field formatting
document.addEventListener('DOMContentLoaded', function() {
    // Format first name as pascal case (capitalize first letter of each word)
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput) {
        firstNameInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
        
        firstNameInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
    }

    // Format last name as pascal case (capitalize first letter of each word)
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) {
        lastNameInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
        
        lastNameInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
    }

    // Format email as lowercase
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase();
        });
        
        emailInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase();
        });
    }

    // Format city as pascal case (capitalize first letter of each word)
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
        
        cityInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
    }

    const emergencyNameInput = document.getElementById('emergencyName');
    const emergencyEmailInput = document.getElementById('emergencyEmail');
    
    // Format emergency name as pascal case (capitalize first letter of each word)
    if (emergencyNameInput) {
        emergencyNameInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
        
        emergencyNameInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
    }
    
    // Format emergency email as lowercase
    if (emergencyEmailInput) {
        emergencyEmailInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase();
        });
        
        emergencyEmailInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase();
        });
    }

    // Format address as pascal case (capitalize first letter of each word)
    const addressInput = document.getElementById('address');
    if (addressInput) {
        addressInput.addEventListener('input', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
        
        addressInput.addEventListener('blur', function() {
            this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        });
    }
});

// Payment section functionality
function initializePaymentSection() {
    const sendPaymentRadio = document.getElementById('sendPayment');
    const receivePaymentRadio = document.getElementById('receivePayment');
    const sendUsernameSection = document.getElementById('sendUsernameSection');
    const receiveUsernameSection = document.getElementById('receiveUsernameSection');
    const sendUsernameInput = document.getElementById('sendUsername');
    const receiveUsernameInput = document.getElementById('receiveUsername');

    // Handle payment type change
    function handlePaymentTypeChange() {
        if (sendPaymentRadio.checked) {
            sendUsernameInput.required = true;
            receiveUsernameInput.required = false;
            receiveUsernameInput.value = '';
        } else if (receivePaymentRadio.checked) {
            sendUsernameInput.required = false;
            receiveUsernameInput.required = true;
            sendUsernameInput.value = '';
        } else {
            sendUsernameInput.required = false;
            receiveUsernameInput.required = false;
        }
    }

    // Add event listeners
    sendPaymentRadio.addEventListener('change', handlePaymentTypeChange);
    receivePaymentRadio.addEventListener('change', handlePaymentTypeChange);

    // Initialize the display
    handlePaymentTypeChange();
}

// Enhanced form validation
function validateRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const fieldErrors = [];
    
    // Hide any existing error displays
    hideErrorMessage();
    hideFieldErrorsAccordion();
    
    // Check basic form validity and collect all invalid fields
    const invalidFields = form.querySelectorAll(':invalid');
    
    if (invalidFields.length > 0) {
        invalidFields.forEach(field => {
            let fieldName = getFieldDisplayName(field);
            let message = `Please fill in the required field: ${fieldName}`;
            let sectionName = getFieldSectionName(field);
            
            // Get more specific validation message if available
            if (field.validationMessage) {
                if (field.type === 'email') {
                    message = 'Please enter a valid email address format.';
                } else if (field.hasAttribute('required') && !field.value.trim()) {
                    message = `Please fill in this required field.`;
                } else {
                    message = field.validationMessage;
                }
            }
            
            fieldErrors.push({
                fieldId: field.id,
                fieldName: fieldName,
                message: message,
                sectionName: sectionName
            });
        });
    }
    
    // Check email format
    const email = document.getElementById('email').value;
    if (email && !isValidEmail(email)) {
        const emailField = document.getElementById('email');
        fieldErrors.push({
            fieldId: 'email',
            fieldName: getFieldDisplayName(emailField),
            message: 'Please enter a valid email address format.',
            sectionName: getFieldSectionName(emailField)
        });
    }
    
    // Check tournament category selection
    const hasTournamentCategory = cart.some(item => tournamentCategories.includes(item.service));
    if (!hasTournamentCategory) {
        fieldErrors.push({
            fieldId: 'cart',
            fieldName: 'Tournament Category',
            message: 'Please select a tournament category to continue with registration.',
            sectionName: 'Cart Selection'
        });
    }
    
    // Check payment information
    const sendPayment = document.getElementById('sendPayment').value;
    const receivePayment = document.getElementById('receivePayment').value;
    const sendUsername = document.getElementById('sendUsername').value.trim();
    const receiveUsername = document.getElementById('receiveUsername').value.trim();
    
    if (!sendPayment) {
        fieldErrors.push({
            fieldId: 'sendPayment',
            fieldName: 'Send Payment Type',
            message: 'Please select a send payment type.',
            sectionName: 'Payment Information'
        });
    }
    
    if (!receivePayment) {
        fieldErrors.push({
            fieldId: 'receivePayment',
            fieldName: 'Receive Payment Type',
            message: 'Please select a receive payment type.',
            sectionName: 'Payment Information'
        });
    }
    
    if (!sendUsername) {
        fieldErrors.push({
            fieldId: 'sendUsername',
            fieldName: 'Send Username',
            message: 'Please enter the send username.',
            sectionName: 'Payment Information'
        });
    }
    
    if (!receiveUsername) {
        fieldErrors.push({
            fieldId: 'receiveUsername',
            fieldName: 'Receive Username',
            message: 'Please enter the receive username.',
            sectionName: 'Payment Information'
        });
    }
    
    // If there are field errors, show them in the accordion
    if (fieldErrors.length > 0) {
        // Show main error message
        const errorCount = fieldErrors.length;
        const errorMessage = errorCount === 1 
            ? 'Please correct the following field error:' 
            : `Please correct the following ${errorCount} field errors:`;
        showErrorMessage(errorMessage);
        
        // Show detailed field errors in accordion
        showFieldErrorsAccordion(fieldErrors);
        
        return false;
    }
    
    return true;
}

// Helper function to get user-friendly field name
function getFieldDisplayName(field) {
    // Try to get from label first
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
        return label.textContent.replace('*', '').trim();
    }
    
    // Try to get from placeholder
    if (field.placeholder) {
        return field.placeholder;
    }
    
    // Try to get from data attribute
    if (field.dataset.fieldName) {
        return field.dataset.fieldName;
    }
    
    // Fallback to field name or id with formatting
    const name = field.name || field.id || 'this field';
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim();
}

// Helper function to get the section name where the field is located
function getFieldSectionName(field) {
    // Find the accordion item that contains this field
    const accordionItem = field.closest('.accordion-item');
    if (accordionItem) {
        const accordionButton = accordionItem.querySelector('.accordion-button');
        if (accordionButton) {
            // Extract text from the button, removing icons and extra text
            const buttonText = accordionButton.textContent.trim();
            // Remove common patterns like "(Required Fields *)" or "(Optional)"
            return buttonText.replace(/\(.*?\)/g, '').trim();
        }
    }
    
    // Fallback based on field ID patterns
    const fieldId = field.id.toLowerCase();
    
    if (fieldId.includes('emergency')) {
        return 'Emergency Contact Information';
    } else if (fieldId.includes('payment') || fieldId.includes('send') || fieldId.includes('receive')) {
        return 'Payment Information';
    } else if (fieldId.includes('ghin')) {
        return 'GHIN Information';
    } else if (fieldId.includes('age') || fieldId.includes('gender') || fieldId.includes('hole') || fieldId.includes('org') || fieldId.includes('sedga')) {
        return 'Golf Information';
    } else if (fieldId.includes('first') || fieldId.includes('last') || fieldId.includes('email') || fieldId.includes('phone') || fieldId.includes('address') || fieldId.includes('city') || fieldId.includes('state') || fieldId.includes('zip') || fieldId.includes('country')) {
        return 'Personal Information';
    } else if (fieldId.includes('terms')) {
        return 'Security Verification';
    }
    
    return 'Form Fields';
}

// Initialize cart display
updateCartDisplay();

// Auto-advance accordion functionality
function initializeAccordionAutoAdvance() {
    console.log('Initializing accordion auto-advance...');
    
    // Simple and direct approach - add listeners to specific fields
    const accordionConfig = {
        'country': function() {
            console.log('Country field completed, checking personal info section...');
            console.log('Country field value:', document.getElementById('country').value);
            
            if (isPersonalInfoCompleted()) {
                console.log('Personal info is completed, opening golf info section...');
                openNextAccordionSection('golfInfoCollapse', 'golfInfoHeading');
            } else {
                console.log('Personal info is not yet completed');
            }
        },
        'org_id': function() {
            console.log('Organization field completed, checking golf info section...');
            if (isGolfInfoCompleted()) {
                // Check if handicap tournament is selected
                const hasHandicapTournament = cart.some(item => item.service === 'handicap');
                if (hasHandicapTournament) {
                    openNextAccordionSection('ghinInfoCollapse', 'ghinInfoHeading');
                } else {
                    openNextAccordionSection('emergencyContactCollapse', 'emergencyContactHeading');
                }
            }
        },
        'ghinNumber': function() {
            console.log('GHIN number completed...');
            if (document.getElementById('ghinNumber').value.trim()) {
                openNextAccordionSection('emergencyContactCollapse', 'emergencyContactHeading');
            }
        },
        'emergencyPhone': function() {
            console.log('Emergency phone completed, checking emergency contact section...');
            if (isEmergencyContactCompleted()) {
                openNextAccordionSection('paymentInfoCollapse', 'paymentInfoHeading');
            }
        },
        'receiveUsername': function() {
            console.log('Receive username completed, checking payment section...');
            if (isPaymentInfoCompleted()) {
                openNextAccordionSection('securityVerificationCollapse', 'securityVerificationHeading');
            }
        }
    };
    
    // Add event listeners to the trigger fields
    Object.keys(accordionConfig).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            console.log(`Adding listener to field: ${fieldId}`);
            console.log(`Field element:`, field);
            
            // Add both change and tab key listeners
            field.addEventListener('change', function(e) {
                console.log(`Change event triggered for ${fieldId} with value:`, e.target.value);
                accordionConfig[fieldId]();
            });
            
            field.addEventListener('keydown', function(e) {
                if (e.key === 'Tab' && !e.shiftKey) {
                    console.log(`Tab key pressed on ${fieldId}`);
                    setTimeout(() => {
                        console.log(`Delayed execution for ${fieldId} after Tab`);
                        accordionConfig[fieldId]();
                    }, 100);
                }
            });
            
            // Also add blur event for better coverage
            field.addEventListener('blur', function(e) {
                if (e.target.value.trim()) {
                    console.log(`Blur event triggered for ${fieldId} with value:`, e.target.value);
                    setTimeout(() => {
                        accordionConfig[fieldId]();
                    }, 50);
                }
            });
        } else {
            console.warn(`Field '${fieldId}' not found`);
        }
    });

    // Specific validation functions for each section
    function isPersonalInfoCompleted() {
        const requiredFields = ['firstName', 'lastName', 'email', 'phoneType', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
        
        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                console.log(`Personal info incomplete: ${fieldId} is empty`);
                return false;
            }
            
            // Special validation for email
            if (fieldId === 'email' && !isValidEmail(field.value)) {
                console.log('Personal info incomplete: invalid email');
                return false;
            }
        }
        
        console.log('Personal info section completed!');
        return true;
    }
    
    function isGolfInfoCompleted() {
        const requiredFields = ['age', 'gender', 'hole18Average', 'org_id'];
        
        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                console.log(`Golf info incomplete: ${fieldId} is empty`);
                return false;
            }
        }
        
        console.log('Golf info section completed!');
        return true;
    }
    
    function isEmergencyContactCompleted() {
        const requiredFields = ['emergencyName', 'emergencyRelationship', 'emergencyEmail', 'emergencyPhoneType', 'emergencyPhone'];
        
        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                console.log(`Emergency contact incomplete: ${fieldId} is empty`);
                return false;
            }
        }
        
        console.log('Emergency contact section completed!');
        return true;
    }
    
    function isPaymentInfoCompleted() {
        const requiredFields = ['sendPayment', 'sendUsername', 'receivePayment', 'receiveUsername'];
        
        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                console.log(`Payment info incomplete: ${fieldId} is empty`);
                return false;
            }
        }
        
        console.log('Payment info section completed!');
        return true;
    }

    // Function to open the next accordion section
    function openNextAccordionSection(nextSectionId, nextButtonId) {
        console.log(`Attempting to open section: ${nextSectionId}`);
        
        const nextCollapse = document.getElementById(nextSectionId);
        if (!nextCollapse) {
            console.warn(`Collapse element ${nextSectionId} not found`);
            return;
        }
        
        // Check if section is already open
        if (nextCollapse.classList.contains('show')) {
            console.log(`Section ${nextSectionId} is already open`);
            return;
        }
        
        // For GHIN section, check if it's visible first
        if (nextSectionId === 'ghinInfoCollapse') {
            const ghinAccordionItem = document.getElementById('ghinAccordionItem');
            if (ghinAccordionItem && ghinAccordionItem.style.display === 'none') {
                console.log('GHIN section is hidden, opening Emergency Contact instead');
                openNextAccordionSection('emergencyContactCollapse', 'emergencyContactHeading');
                return;
            }
        }
        
        console.log(`Opening section: ${nextSectionId}`);
        
        // Find the accordion button and trigger it
        const nextButton = document.querySelector(`#${nextButtonId} button`);
        if (nextButton) {
            // Use Bootstrap's collapse API to show the section
            const bsCollapse = new bootstrap.Collapse(nextCollapse, { show: true });
            
            // Focus on the first input in the newly opened section
            setTimeout(() => {
                const firstInput = nextCollapse.querySelector('input:not([type="hidden"]):not([type="checkbox"]), select, textarea');
                if (firstInput) {
                    console.log(`Focusing on first input: ${firstInput.id || firstInput.name}`);
                    firstInput.focus();
                }
            }, 500); // Delay to allow accordion animation
        } else {
            console.warn(`Button for ${nextButtonId} not found`);
        }
    }

}

// Disable browser default validation tooltips
function disableBrowserValidationTooltips() {
    const form = document.getElementById('registrationForm');
    if (form) {
        // Prevent the default validation UI from showing
        form.addEventListener('invalid', function(e) {
            e.preventDefault();
        }, true);
        
        // Add novalidate attribute to prevent browser validation UI
        form.setAttribute('novalidate', 'novalidate');
    }
    
    // Also prevent validation tooltips on individual form elements
    const formInputs = document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
        });
    });
}

// Make test function available globally for debugging
window.testOpenGolfSection = testOpenGolfSection;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load prices data from JSON file
    loadPricesData();
    
    // Load winners data from JSON file
    loadWinnersData();
    
    // Disable browser validation tooltips
    disableBrowserValidationTooltips();
    
    // Initialize payment section functionality
    initializePaymentSection();
    
    // Add error clearing functionality to form inputs
    const formInputs = document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', clearErrorOnInteraction);
        input.addEventListener('input', clearErrorOnInteraction);
        input.addEventListener('change', clearErrorOnInteraction);
        // Add listeners to track form input
        input.addEventListener('input', checkFormHasInput);
        input.addEventListener('change', checkFormHasInput);
    });
    
    // Add Hall of Fame checkbox listener to update cart when checked/unchecked
    const hallOfFameCheckbox = document.getElementById('sedgaHallOfFame');
    if (hallOfFameCheckbox) {
        hallOfFameCheckbox.addEventListener('change', function() {
            updateCartDisplay();
        });
    }
    
    // Add listeners to first name and last name fields to update cart when winner status changes
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    if (firstNameField) {
        firstNameField.addEventListener('input', function() {
            // Apply ucfirst(strtolower()) transformation
            const value = this.value;
            if (value) {
                this.value = value.toLowerCase().replace(/^./, c => c.toUpperCase());
            }
            // Check for matched name discount
            applyMatchedNameDiscount();
            // Validate cart items against selected division
            validateCartItemsByDivision();
            updateCartDisplay();
        });
    }
    if (lastNameField) {
        lastNameField.addEventListener('input', function() {
            // Apply ucfirst(strtolower()) transformation
            const value = this.value;
            if (value) {
                this.value = value.toLowerCase().replace(/^./, c => c.toUpperCase());
            }
            // Check for matched name discount
            applyMatchedNameDiscount();
            // Validate cart items against selected division
            validateCartItemsByDivision();
            updateCartDisplay();
        });
    }
    
    // Add SEDGA Officer checkbox listener to add Awards & Luncheon and apply discount
    const sedgaOfficerCheckbox = document.getElementById('sedgaOfficer');
    if (sedgaOfficerCheckbox) {
        sedgaOfficerCheckbox.addEventListener('change', function() {
            const banquetItem = cart.find(item => item.service === 'banquet');
            const isHallOfFame = document.getElementById('sedgaHallOfFame')?.checked;
            
            if (this.checked) {
                // If SEDGA Officer is checked and banquet not in cart, add it
                // But skip if Hall of Fame is selected (Hall of Fame includes Free Lunch)
                if (!banquetItem && !isHallOfFame) {
                    cart.push({
                        service: 'banquet',
                        title: 'Awards & Luncheon',
                        price: 25.00,
                        quantity: 1,
                        peopleCount: 1,
                        isSedgaOfficerItem: true  // Flag to identify this was auto-added
                    });
                }
            } else {
                // If SEDGA Officer is unchecked, remove banquet if it was added by SEDGA Officer
                cart = cart.filter(item => !item.isSedgaOfficerItem);
            }
            
            updateCartDisplay();
        });
    }
    
    // Clear errors when interacting with cart buttons
    const cartButtons = document.querySelectorAll('.add-to-cart, .remove-from-cart');
    cartButtons.forEach(button => {
        button.addEventListener('click', clearErrorOnInteraction);
    });
    
    // Handle Edit Details button click from success modal
    const editDetailsBtn = document.getElementById('editDetailsBtn');
    if (editDetailsBtn) {
        editDetailsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleEditDetails();
        });
    }
    
    // Handle Edit Details button click from preview step
    const editDetailsPreviewBtn = document.getElementById('editDetailsPreviewBtn');
    if (editDetailsPreviewBtn) {
        editDetailsPreviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            goBackToForm();
        });
    }
    
    // Initialize accordion auto-advance functionality
    setTimeout(() => {
        initializeAccordionAutoAdvance();
        console.log('Accordion auto-advance initialized');
    }, 500); // Delay to ensure all elements are loaded
    
    // Initialize Confirm Registration button as disabled
    updateConfirmButtonState();
    
    // Ensure first accordion stays open on page load/refresh
    const firstAccordionButton = document.querySelector('#personalInfoHeading button');
    const firstAccordionCollapse = document.getElementById('personalInfoCollapse');
    
    if (firstAccordionButton && firstAccordionCollapse) {
        // Set button attributes
        firstAccordionButton.setAttribute('aria-expanded', 'true');
        firstAccordionButton.classList.remove('collapsed');
        
        // Set collapse div classes
        firstAccordionCollapse.classList.add('show');
        firstAccordionCollapse.classList.remove('collapse');
        firstAccordionCollapse.classList.add('collapse');
    }
});

// Test function to manually open Golf Info section (for debugging)
function testOpenGolfSection() {
    console.log('Testing golf section opening...');
    const golfCollapse = document.getElementById('golfInfoCollapse');
    const golfHeading = document.getElementById('golfInfoHeading');
    
    if (golfCollapse && golfHeading) {
        console.log('Golf elements found, attempting to open...');
        const bsCollapse = new bootstrap.Collapse(golfCollapse, { show: true });
        
        setTimeout(() => {
            const firstInput = golfCollapse.querySelector('input, select');
            if (firstInput) {
                console.log('Focusing on first input:', firstInput.id);
                firstInput.focus();
            }
        }, 500);
    } else {
        console.error('Golf elements not found');
    }
}

// Function to copy Send UserName to Receive UserName
function copyUsername() {
    const sendUsernameField = document.getElementById('sendUsername');
    const receiveUsernameField = document.getElementById('receiveUsername');
    const copyBtn = document.getElementById('copyUsernameBtn');
    
    if (sendUsernameField && receiveUsernameField) {
        const sendUsername = sendUsernameField.value.trim();
        
        if (sendUsername === '') {
            // Show a brief warning if Send UserName is empty
            copyBtn.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 1000);
            return;
        }
        
        // Copy the value
        receiveUsernameField.value = sendUsername;
        
        // Show a brief success indication
        copyBtn.innerHTML = '<i class="fas fa-check text-success"></i>';
        copyBtn.classList.add('btn-outline-success');
        copyBtn.classList.remove('btn-outline-secondary');
        
        // Reset button appearance after 1.5 seconds
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.classList.remove('btn-outline-success');
            copyBtn.classList.add('btn-outline-secondary');
        }, 1500);
        
        // Trigger any validation or change events if needed
        receiveUsernameField.dispatchEvent(new Event('input', { bubbles: true }));
        receiveUsernameField.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// Function to reset all modals and form data after completion
function resetAllModalsAndForm() {
    // Reset form data
    const form = document.getElementById('registrationForm');
    if (form) {
        form.reset();
    }
    
    // Clear cart
    cart = [];
    cartTotal = 0;
    
    // Reset email verification status
    emailVerified = false;
    
    // Reset form input tracking
    hasFormInput = false;
    
    // Reset submission tracking
    submissionAttempts = 0;
    isCompletingRegistration = false;
    isEditingDetails = false;
    storedFormData = null;
    
    // Hide the "Edit Details" button in the preview step
    const editDetailsPreviewBtn = document.getElementById('editDetailsPreviewBtn');
    if (editDetailsPreviewBtn) {
        editDetailsPreviewBtn.style.display = 'none';
    }
    
    // Keep the "Edit Details" button visible in the success modal
    // (removed: editDetailsBtn.style.display = 'none';)
    
    // Reset all service buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.innerHTML = '<i class="fas fa-plus"></i>';
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-success');
    });
    
    // Clear email status
    const emailStatus = document.getElementById('emailStatus');
    if (emailStatus) {
        emailStatus.innerHTML = '';
    }
    
    // Hide error messages
    hideErrorMessage();
    hideFieldErrorsAccordion();
    
    // Update cart display
    updateCartDisplay();
    
    // Close all accordion sections and reset to first section
    setTimeout(() => {
        // Close all accordion sections first
        const accordionSections = ['golfInfoCollapse', 'ghinInfoCollapse', 'emergencyContactCollapse', 'paymentInfoCollapse', 'securityVerificationCollapse'];
        accordionSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && section.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(section);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });
        
        // Ensure first section is open
        const firstSection = document.getElementById('personalInfoCollapse');
        const firstButton = document.querySelector('#personalInfoHeading button');
        if (firstSection && firstButton) {
            firstButton.setAttribute('aria-expanded', 'true');
            firstButton.classList.remove('collapsed');
            firstSection.classList.add('show');
        }
    }, 100);
}

// Fill form with dummy data for testing
function fillDummyData() {
    // Personal Information
    document.getElementById('firstName').value = 'John';
    document.getElementById('lastName').value = 'Smith';
    document.getElementById('email').value = 'john.smith@example.com';
    document.getElementById('phone').value = '555-123-4567';
    document.getElementById('phoneType').value = '1'; // Mobile
    document.getElementById('address').value = '123 Main Street';
    document.getElementById('city').value = 'New York';
    document.getElementById('state').value = 'NY';
    document.getElementById('zipCode').value = '10001';
    document.getElementById('country').value = 'USA';
    
    // Golf Information
    document.getElementById('age').value = '45';
    document.getElementById('gender').value = '1';
    document.getElementById('hole18Average').value = '85';
    document.getElementById('org_id').value = '3'; // Georgia (GDGA)
    
    // SEDGA Membership
    document.getElementById('sedgaOfficer').checked = false;
    document.getElementById('sedgaHallOfFame').checked = false;
    
    // GHIN Information (if visible)
    const ghinNumber = document.getElementById('ghinNumber');
    if (ghinNumber) {
        ghinNumber.value = '123456789';
    }
    
    // Emergency Contact Information
    document.getElementById('emergencyName').value = 'Jane Smith';
    document.getElementById('emergencyRelationship').value = '2';
    document.getElementById('emergencyEmail').value = 'jane.smith@example.com';
    document.getElementById('emergencyPhoneType').value = '1'; // Mobile
    document.getElementById('emergencyPhone').value = '555-987-6543';
    
    // Payment Information
    document.getElementById('sendPayment').value = '2'; // Venmo
    document.getElementById('sendUsername').value = 'johnsmith123';
    document.getElementById('receivePayment').value = '2'; // Venmo
    document.getElementById('receiveUsername').value = 'johnsmith123';
    
    // Security Verification
    document.getElementById('terms').checked = true;
    
    // Clear any error messages
    hideErrorMessage();
    hideFieldErrorsAccordion();
    
    // Enable the Confirm Registration button
    hasFormInput = true;
    updateConfirmButtonState();
    
    console.log('Dummy data filled successfully');
}

// Wizard navigation functions
let currentWizardStep = 1;

function goToWizardStep(stepNumber) {
    // Hide current step content
    document.getElementById(`wizardStep${currentWizardStep}`).style.display = 'none';
    document.getElementById(`step${currentWizardStep}Footer`).style.display = 'none';
    
    // Show new step content
    document.getElementById(`wizardStep${stepNumber}`).style.display = 'block';
    document.getElementById(`step${stepNumber}Footer`).style.display = 'flex';
    
    // Update step indicators
    updateWizardStepIndicators(stepNumber);
    
    // If we're moving to step 2, disable the "Back to Edit" button initially
    if (stepNumber === 2) {
        const backBtn = document.querySelector('#step2Footer button:first-child');
        if (backBtn) {
            backBtn.style.display = 'none';
        }
        // Enable the confirm button on preview page
        updateConfirmButtonState();
        // Enable the "Edit Details" button on preview page
        const editDetailsPreviewBtn = document.getElementById('editDetailsPreviewBtn');
        if (editDetailsPreviewBtn) {
            editDetailsPreviewBtn.disabled = false;
        }
    } else if (stepNumber === 1) {
        // Disable the confirm button when on the form page
        updateConfirmButtonState();
        // Disable the "Edit Details" button on registration page
        const editDetailsPreviewBtn = document.getElementById('editDetailsPreviewBtn');
        if (editDetailsPreviewBtn) {
            editDetailsPreviewBtn.disabled = true;
        }
    }
    
    currentWizardStep = stepNumber;
}

function updateWizardStepIndicators(activeStep) {
    // Update step styling
    for (let i = 1; i <= 2; i++) {
        const stepElement = document.getElementById(`step${i}`);
        const stepLine = stepElement.nextElementSibling;
        
        if (i < activeStep) {
            // Completed steps
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
            if (stepLine && stepLine.classList.contains('step-line')) {
                stepLine.classList.add('active');
            }
        } else if (i === activeStep) {
            // Active step
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
            if (stepLine && stepLine.classList.contains('step-line')) {
                stepLine.classList.remove('active');
            }
        } else {
            // Future steps
            stepElement.classList.remove('active', 'completed');
            if (stepLine && stepLine.classList.contains('step-line')) {
                stepLine.classList.remove('active');
            }
        }
    }
    
    // Scroll to top of modal
    const modalBody = document.querySelector('#registrationModal .modal-body');
    if (modalBody) {
        modalBody.scrollTop = 0;
    }
}

function goBackToForm() {
    goToWizardStep(1);
    
    // When "Edit Details" button is selected:
    // Enable: "Cancel" and "Next Preview" buttons
    // Disable: "Confirm Registration", "Back to Edit", and "Fill Dummy Data" buttons
    const fillDummyDataBtn = document.querySelector('button[onclick="fillDummyData()"]');
    const cancelBtn = document.querySelector('button[onclick="closeRegistrationWizard()"]');
    const nextPreviewBtn = document.getElementById('proceedToPreview');
    const confirmRegistrationBtn = document.getElementById('confirmRegistrationBtn');
    const backToEditBtn = document.querySelector('button[onclick="goBackToForm()"]');
    
    // Enable "Cancel" and "Next Preview" buttons
    if (cancelBtn) cancelBtn.disabled = false;
    if (nextPreviewBtn) nextPreviewBtn.disabled = false;
    
    // Disable "Confirm Registration", "Back to Edit", and "Fill Dummy Data" buttons
    if (confirmRegistrationBtn) confirmRegistrationBtn.disabled = true;
    if (backToEditBtn) backToEditBtn.disabled = true;
    if (fillDummyDataBtn) fillDummyDataBtn.disabled = true;
}

function proceedToPreview(event) {
    // This will be called after form validation passes
    // Collect all form data
    const formData = collectFormData();
    
    // Store form data and cart state
    storedFormData = {
        formData: formData,
        cartData: [...cart],
        cartTotal: cartTotal
    };
    
    // Generate preview HTML
    const previewHTML = generateConfirmationHTML(formData);
    
    // Populate the preview section
    document.getElementById('previewDetails').innerHTML = previewHTML;
    
    // Go to step 2
    goToWizardStep(2);
    
    // Enable the Confirm Registration button
    hasFormInput = true;
    updateConfirmButtonState();
    
    // Show the "Edit Details" button in the preview step
    const editDetailsPreviewBtn = document.getElementById('editDetailsPreviewBtn');
    if (editDetailsPreviewBtn) {
        editDetailsPreviewBtn.style.display = 'inline-block';
    }
    
    // Manage button states when "Next: Preview" button is selected
    // Enable: "Edit Details", "Confirm Registration", and "Cancel" buttons
    // Disable: "Next Preview" and "Fill Dummy Data" buttons
    const fillDummyDataBtn = document.querySelector('button[onclick="fillDummyData()"]');
    const cancelBtn = document.querySelector('button[onclick="closeRegistrationWizard()"]');
    const nextPreviewBtn = document.getElementById('proceedToPreview');
    const confirmRegistrationBtn = document.getElementById('confirmRegistrationBtn');
    const editDetailsBtn = document.getElementById('editDetailsPreviewBtn');
    
    // Disable "Next Preview" and "Fill Dummy Data" buttons
    if (nextPreviewBtn) nextPreviewBtn.disabled = true;
    if (fillDummyDataBtn) fillDummyDataBtn.disabled = true;
    
    // Enable "Edit Details", "Confirm Registration", and "Cancel" buttons
    if (editDetailsBtn) editDetailsBtn.disabled = false;
    if (confirmRegistrationBtn) confirmRegistrationBtn.disabled = false;
    if (cancelBtn) cancelBtn.disabled = false;
}

function closeRegistrationWizard() {
    const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
    if (registrationModal) {
        registrationModal.hide();
    }
    resetAllModalsAndForm();
}

// Update form submission to use wizard flow
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Disable the "Next: Preview" button immediately to prevent multiple submissions
    const nextPreviewBtn = document.getElementById('proceedToPreview');
    if (nextPreviewBtn) {
        nextPreviewBtn.disabled = true;
    }
    
    // Check for suspicious activity first
    const suspiciousCheck = detectSuspiciousActivity();
    if (suspiciousCheck.suspicious) {
        showErrorMessage(suspiciousCheck.reason);
        // Re-enable button if validation fails
        if (nextPreviewBtn) {
            nextPreviewBtn.disabled = false;
        }
        return;
    }
    
    // Use the comprehensive validation function
    if (!validateRegistrationForm()) {
        // Re-enable button if validation fails
        if (nextPreviewBtn) {
            nextPreviewBtn.disabled = false;
        }
        return;
    }
    
    // Update submission tracking
    submissionAttempts++;
    lastSubmissionTime = Date.now();
    
    // Proceed to preview step in wizard
    proceedToPreview(e);
});

// Handle confirm registration from step 2
document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirmRegistrationBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const button = this;
            const originalHTML = button.innerHTML;
            
            // Show loading state
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Processing...';
            
            // Set completion flag
            isCompletingRegistration = true;
            
            // Complete the registration
            setTimeout(() => {
                completeRegistration();
                
                // Reset button state
                button.disabled = false;
                button.innerHTML = originalHTML;
                
                // Reset completion flag after a longer delay
                setTimeout(() => {
                    isCompletingRegistration = false;
                }, 2000);
            }, 800);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const registrationModalElement = document.getElementById('registrationModal');
    if (registrationModalElement) {
        registrationModalElement.addEventListener('hide.bs.modal', function() {
            moveFocusOutOfModal(registrationModalElement);
        });
    }

    const confirmationModalElement = document.getElementById('confirmationModal');
    if (confirmationModalElement) {
        confirmationModalElement.addEventListener('hide.bs.modal', function() {
            moveFocusOutOfModal(confirmationModalElement);
        });
    }

    const successModalElement = document.getElementById('successModal');
    if (successModalElement) {
        successModalElement.addEventListener('hide.bs.modal', function() {
            moveFocusOutOfModal(successModalElement);
        });
    }
});

// Modal initialization for wizard
document.getElementById('registrationModal').addEventListener('shown.bs.modal', function() {
    // Reset to step 1
    currentWizardStep = 2;
    goToWizardStep(1);
    
    // Focus on first input
    const firstInput = this.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Re-initialize accordion auto-advance
    setTimeout(() => {
        console.log('Re-initializing accordion auto-advance after modal opened...');
        initializeAccordionAutoAdvance();
    }, 200);
});

// Reset form when modal is closed
document.getElementById('registrationModal').addEventListener('hidden.bs.modal', function() {
    if (!isCompletingRegistration && !isEditingDetails) {
        resetAllModalsAndForm();
    }
});
