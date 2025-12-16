// Cart functionality
let cart = [];
let cartTotal = 0;

// Modal state tracking
let isCompletingRegistration = false;
let isEditingDetails = false;

// Form data storage for edit functionality
let storedFormData = null;

// reCAPTCHA verification functionality
function verifyRecaptchaAndOpenModal() {
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

// Email verification functionality (simplified)
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
const ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com']; // Add more as needed

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
            // Remove any existing tournament category from cart
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
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart text-center text-muted py-4">
                <i class="fas fa-shopping-cart fa-2x mb-2 opacity-50"></i>
                <div>Your cart is empty</div>
                <small>Add services to get started</small>
            </div>
        `;
        document.getElementById('headerTotal').textContent = '$0.00';
        cartSummary.style.display = 'none';
    } else {
        cartContainer.innerHTML = cart.map(item => {
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
        
        // Add remove functionality
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const serviceName = this.dataset.service;
                cart = cart.filter(item => item.service !== serviceName);
                
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
        
        // Calculate totals - account for people count in banquet items
        const total = cart.reduce((sum, item) => {
            if (item.service === 'banquet' && item.peopleCount) {
                return sum + (item.price * item.peopleCount);
            }
            return sum + (item.price * item.quantity);
        }, 0);
        
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        document.getElementById('headerTotal').textContent = `$${total.toFixed(2)}`;
        
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

// Form submit handler
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Check for suspicious activity first
    const suspiciousCheck = detectSuspiciousActivity();
    if (suspiciousCheck.suspicious) {
        showErrorMessage(suspiciousCheck.reason);
        return;
    }
    
    // Use the comprehensive validation function
    if (!validateRegistrationForm()) {
        return;
    }
    
    // Update submission tracking
    submissionAttempts++;
    lastSubmissionTime = Date.now();
    
    // Show confirmation modal instead of completing registration directly
    showConfirmationModal();
});

// Complete registration function
function completeRegistration() {
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    // Add GHIN number if handicap tournament is selected
    const hasHandicapTournament = cart.some(item => item.service === 'handicap');
    if (hasHandicapTournament) {
        formData.ghinNumber = document.getElementById('ghinNumber').value;
    }
    
    // Create simple success message without detailed registration info and cart items
    const summary = `
        <div class="text-center">
            <p class="text-muted">Thank you, <strong>${formData.firstName} ${formData.lastName}</strong>!</p>
            <p class="text-muted">A confirmation email will be sent to <strong>${formData.email}</strong></p>
        </div>
    `;
    
    document.getElementById('registrationSummary').innerHTML = summary;
    
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
        }, 5000);
    }, 500);
}

// Show confirmation modal with all user data
function showConfirmationModal() {
    // Collect all form data
    const formData = collectFormData();
    
    // Store form data and cart state for potential editing
    storedFormData = {
        formData: formData,
        cartData: [...cart], // Create a copy of the cart array
        cartTotal: cartTotal
    };
    
    // Generate confirmation details HTML
    const confirmationHTML = generateConfirmationHTML(formData);
    
    // Populate the confirmation modal
    document.getElementById('confirmationDetails').innerHTML = confirmationHTML;
    
    // Hide registration modal first
    const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
    registrationModal.hide();
    
    // Show confirmation modal after a short delay
    setTimeout(() => {
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        confirmationModal.show();
    }, 300);
}

// Collect all form data
function collectFormData() {
    const formData = {
        // Personal Information
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
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
        emergencyEmail: document.getElementById('emergencyEmail').value,
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
    
    console.log('Populating form fields from stored data');
    
    const data = storedData.formData || storedData; // Handle both old and new data structure
    
    // Personal Information
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
    
    // Golf Information
    document.getElementById('age').value = data.age || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('hole18Average').value = data.hole18Average || '';
    document.getElementById('org_id').value = data.org_id || '';
    document.getElementById('sedgaOfficer').checked = data.sedgaOfficer || false;
    document.getElementById('sedgaHallOfFame').checked = data.sedgaHallOfFame || false;
    
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
    
    // GHIN Information (if handicap tournament is selected)
    if (data.ghinNumber && document.getElementById('ghinNumber')) {
        document.getElementById('ghinNumber').value = data.ghinNumber || '';
    }
    
    // Security/Terms
    if (document.getElementById('terms')) {
        document.getElementById('terms').checked = data.terms || false;
    }
    
    // Restore cart state if available in new format
    if (storedData.cartData) {
        restoreCartState(storedData.cartData, storedData.cartTotal);
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

// Modal initialization
document.getElementById('registrationModal').addEventListener('shown.bs.modal', function() {
    // Modal is now shown - focus on first input
    const firstInput = this.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Re-initialize accordion auto-advance when modal opens
    // This ensures all elements are available
    setTimeout(() => {
        console.log('Re-initializing accordion auto-advance after modal opened...');
        initializeAccordionAutoAdvance();
    }, 200);
});

// Reset form when modal is closed (but only if not completing registration)
document.getElementById('registrationModal').addEventListener('hidden.bs.modal', function() {
    // Only reset if we're not in the middle of completing registration
    if (!isCompletingRegistration) {
        resetAllModalsAndForm();
    }
});

// Add success modal event handler
document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
    // Always reset everything when success modal is closed
    resetAllModalsAndForm();
});

// Confirmation modal event handlers
document.getElementById('confirmRegistration').addEventListener('click', function() {
    const button = this;
    const originalHTML = button.innerHTML;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Processing...';
    
    // Set completion flag
    isCompletingRegistration = true;
    
    // Hide confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }
    
    // Complete the registration
    setTimeout(() => {
        completeRegistration();
        
        // Reset button state (in case modal is reused)
        button.disabled = false;
        button.innerHTML = originalHTML;
        
        // Reset completion flag after a longer delay to ensure all modals are handled
        setTimeout(() => {
            isCompletingRegistration = false;
        }, 2000);
    }, 800);
});



// Handle when confirmation modal is dismissed (user wants to edit)
document.getElementById('confirmationModal').addEventListener('hidden.bs.modal', function() {
    console.log('Confirmation modal hidden event fired. isEditingDetails:', isEditingDetails, 'isCompletingRegistration:', isCompletingRegistration);
    
    // Check if this was dismissed to edit (not because we're completing registration)
    if (isEditingDetails) {
        console.log('User is editing details, restoring form data');
        // Populate the form with stored data
        if (storedFormData) {
            console.log('Stored form data found, populating fields');
            populateFormFields(storedFormData);
        } else {
            console.warn('No stored form data available');
        }
        
        // Show the registration modal again
        setTimeout(() => {
            console.log('Showing registration modal for editing');
            const registrationModal = new bootstrap.Modal(document.getElementById('registrationModal'));
            registrationModal.show();
        }, 300);
        
        // Reset the editing flag
        isEditingDetails = false;
    } else if (!isCompletingRegistration && !document.getElementById('successModal').classList.contains('show')) {
        console.log('Confirmation modal dismissed without editing - user cancelled');
        // This handles the case where the modal was closed without either editing or confirming
    }
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
            sendUsernameSection.style.display = 'block';
            receiveUsernameSection.style.display = 'none';
            sendUsernameInput.required = true;
            receiveUsernameInput.required = false;
            receiveUsernameInput.value = '';
        } else if (receivePaymentRadio.checked) {
            sendUsernameSection.style.display = 'none';
            receiveUsernameSection.style.display = 'block';
            sendUsernameInput.required = false;
            receiveUsernameInput.required = true;
            sendUsernameInput.value = '';
        } else {
            // No payment type selected
            sendUsernameSection.style.display = 'none';
            receiveUsernameSection.style.display = 'none';
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
    });
    
    // Clear errors when interacting with cart buttons
    const cartButtons = document.querySelectorAll('.add-to-cart, .remove-from-cart');
    cartButtons.forEach(button => {
        button.addEventListener('click', clearErrorOnInteraction);
    });
    
    // Handle Edit Details button click - use delegation on the modal footer
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        const modalFooter = confirmationModal.querySelector('.modal-footer');
        if (modalFooter) {
            // Find the Edit Details button (it has fa-edit icon)
            const editDetailsButton = Array.from(modalFooter.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Edit') && btn.classList.contains('btn-secondary')
            );
            
            if (editDetailsButton) {
                editDetailsButton.addEventListener('click', function(e) {
                    console.log('Edit Details button clicked, setting isEditingDetails to true');
                    isEditingDetails = true;
                });
            }
        }
    }
    
    // Initialize accordion auto-advance functionality
    setTimeout(() => {
        initializeAccordionAutoAdvance();
        console.log('Accordion auto-advance initialized');
    }, 500); // Delay to ensure all elements are loaded
    
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
    
    // Reset submission tracking
    submissionAttempts = 0;
    isCompletingRegistration = false;
    isEditingDetails = false;
    storedFormData = null;
    
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
    
    console.log('All modals and form data have been reset');
}
