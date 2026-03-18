(function () {
    'use strict';

    const editState = {
        registrationId: null,
        secureId: null
    };

    window.SEDGA_EDIT_MODE = true;

    const discountNameSet = new Set([
        'awards & lunch discount',
        'members due',
        'sedga officer discount',
        'matched name discount'
    ]);

    function getApiUrl(endpoint) {
        const base = (window.SEDGA_API_BASE || '').replace(/\/$/, '');
        if (base) {
            return `${base}/${endpoint.replace(/^\//, '')}`;
        }
        return new URL(endpoint, window.location.href).toString();
    }

    function setStatus(message, variant) {
        const status = document.getElementById('editLookupStatus');
        if (!status) {
            return;
        }
        status.className = '';
        if (!message) {
            status.textContent = '';
            return;
        }
        const classMap = {
            success: 'alert alert-success',
            error: 'alert alert-danger',
            info: 'alert alert-info'
        };
        status.className = classMap[variant] || 'alert alert-secondary';
        status.textContent = message;
    }

    function buildServiceLookup() {
        const map = new Map();
        document.querySelectorAll('.service-item').forEach(item => {
            const name = item.querySelector('.service-title')?.textContent?.trim();
            const service = item.dataset.service || '';
            const price = parseFloat(item.dataset.price || '0');
            if (name && service) {
                map.set(name.toLowerCase(), {
                    service,
                    title: name,
                    price
                });
            }
        });
        return map;
    }

    function isDiscountItem(itemName, price) {
        if (price < 0) {
            return true;
        }
        const normalized = (itemName || '').trim().toLowerCase();
        if (discountNameSet.has(normalized)) {
            return true;
        }
        if (normalized.includes('discount')) {
            return true;
        }
        if (normalized.includes('champion')) {
            return true;
        }
        return false;
    }

    function mapItemsToCart(items) {
        const serviceLookup = buildServiceLookup();
        const cartItems = [];

        items.forEach(item => {
            const name = (item.item_name || item.name || '').trim();
            const price = parseFloat(item.item_price || item.price || 0);
            const quantity = Math.max(1, parseInt(item.quantity || 1, 10));

            if (!name || isDiscountItem(name, price)) {
                return;
            }

            const lookup = serviceLookup.get(name.toLowerCase());
            if (!lookup) {
                console.warn('Unknown cart item skipped:', name);
                return;
            }

            const cartItem = {
                service: lookup.service,
                title: lookup.title,
                price: price || lookup.price,
                quantity: quantity
            };

            if (lookup.service === 'banquet') {
                cartItem.peopleCount = quantity;
            }

            cartItems.push(cartItem);
        });

        return cartItems;
    }

    function applyEditModeUi() {
        const confirmBtn = document.getElementById('confirmRegistrationBtn');
        if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fas fa-save me-1"></i>Save Changes';
        }

        const modalTitle = document.querySelector('#registrationModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Registration';
        }

        const successHeading = document.querySelector('#successModal h4');
        if (successHeading) {
            successHeading.textContent = 'Update Complete!';
        }

        const successText = document.querySelector('#successModal p.text-muted');
        if (successText) {
            successText.textContent = 'Registration details have been updated successfully.';
        }

        const terms = document.getElementById('terms');
        if (terms) {
            terms.checked = true;
            terms.required = false;
        }
    }

    function openRegistrationModal() {
        const modalElement = document.getElementById('registrationModal');
        if (!modalElement) {
            return;
        }
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) {
            modal = new bootstrap.Modal(modalElement);
        }
        modal.show();
    }

    async function fetchRegistrationById(registrationId) {
        const response = await fetch(getApiUrl('get-registration.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId })
        });

        const text = await response.text();
        const cleaned = text.replace(/^\uFEFF/, '').trim();
        if (!cleaned) {
            throw new Error(`Empty response from server (${response.status})`);
        }

        let data;
        try {
            data = JSON.parse(cleaned);
        } catch (error) {
            throw new Error('Invalid JSON response from server.');
        }

        if (!data.success) {
            throw new Error(data.message || 'Unable to load registration.');
        }

        return data;
    }

    function populateRegistration(data) {
        const registration = data.registration || {};
        const items = data.items || [];

        editState.registrationId = parseInt(registration.registration_id || 0, 10);
        editState.secureId = registration.secure_id || '';

        const formData = {
            firstName: registration.first_name || '',
            lastName: registration.last_name || '',
            email: registration.email || '',
            phoneType: registration.phone_type || '',
            phone: registration.phone || '',
            address: registration.address || '',
            city: registration.city || '',
            state: registration.state || '',
            zipCode: registration.zip_code || '',
            country: registration.country || '',
            age: registration.age || '',
            gender: registration.gender || '',
            hole18Average: registration.hole_18_average || '',
            org_id: registration.org_id || '',
            sedgaOfficer: Number(registration.sedga_officer) === 1,
            sedgaHallOfFame: Number(registration.sedga_hall_of_fame) === 1,
            ghinNumber: registration.ghin_number || '',
            emergencyName: registration.emergency_name || '',
            emergencyRelationship: registration.emergency_relationship || '',
            emergencyEmail: registration.emergency_email || '',
            emergencyPhoneType: registration.emergency_phone_type || '',
            emergencyPhone: registration.emergency_phone || '',
            sendPayment: registration.send_payment || '',
            sendUsername: registration.send_username || '',
            receivePayment: registration.receive_payment || '',
            receiveUsername: registration.receive_username || '',
            terms: true
        };

        const cartData = mapItemsToCart(items);
        const cartTotal = parseFloat(registration.total_amount || 0);

        if (typeof populateFormFields === 'function') {
            populateFormFields({ formData, cartData, cartTotal });
        }

        applyEditModeUi();
    }

    async function handleLookup(registrationIdOverride) {
        let registrationId = parseInt(registrationIdOverride || 0, 10);
        if (!registrationId) {
            const input = document.getElementById('editRegistrationId');
            registrationId = parseInt(input?.value || 0, 10);
        }

        if (!registrationId) {
            setStatus('Please select a valid registration.', 'error');
            return;
        }

        setStatus('Loading registration details...', 'info');

        try {
            const data = await fetchRegistrationById(registrationId);
            populateRegistration(data);
            setStatus(`Registration #${registrationId} loaded.`, 'success');
            openRegistrationModal();
        } catch (error) {
            setStatus(error.message || 'Unable to load registration.', 'error');
        }
    }

    async function updateRegistration() {
        if (!editState.registrationId) {
            setStatus('Load a registration before saving changes.', 'error');
            return { success: false, message: 'Missing registration ID.' };
        }

        const formData = {
            firstName: document.getElementById('firstName').value.toLowerCase().replace(/^./, c => c.toUpperCase()),
            lastName: document.getElementById('lastName').value.toLowerCase().replace(/^./, c => c.toUpperCase()),
            email: document.getElementById('email').value.toLowerCase(),
            phoneType: parseInt(document.getElementById('phoneType')?.value || 0, 10),
            phone: document.getElementById('phone').value,
            address: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            zipCode: document.getElementById('zipCode')?.value || '',
            country: document.getElementById('country')?.value || '',
            age: parseInt(document.getElementById('age')?.value || 0, 10),
            gender: parseInt(document.getElementById('gender')?.value || 0, 10),
            hole18Average: parseInt(document.getElementById('hole18Average')?.value || 0, 10),
            org_id: parseInt(document.getElementById('org_id')?.value || 0, 10),
            sedgaOfficer: document.getElementById('sedgaOfficer')?.checked ? 1 : 0,
            sedgaHallOfFame: document.getElementById('sedgaHallOfFame')?.checked ? 1 : 0,
            ghinNumber: document.getElementById('ghinNumber')?.value || '',
            emergencyName: document.getElementById('emergencyName')?.value || '',
            emergencyRelationship: parseInt(document.getElementById('emergencyRelationship')?.value || 0, 10),
            emergencyEmail: (document.getElementById('emergencyEmail')?.value || '').toLowerCase(),
            emergencyPhoneType: parseInt(document.getElementById('emergencyPhoneType')?.value || 0, 10),
            emergencyPhone: document.getElementById('emergencyPhone')?.value || '',
            sendPayment: parseInt(document.getElementById('sendPayment')?.value || 0, 10),
            sendUsername: document.getElementById('sendUsername')?.value || '',
            receivePayment: parseInt(document.getElementById('receivePayment')?.value || 0, 10),
            receiveUsername: document.getElementById('receiveUsername')?.value || '',
            cart: typeof buildCartForSubmission === 'function' ? buildCartForSubmission() : [],
            cartTotal: typeof cartTotal !== 'undefined' ? cartTotal : 0,
            registrationId: editState.registrationId,
            secureId: editState.secureId
        };

        try {
            const response = await fetch(getApiUrl('update-registration.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const text = await response.text();
            const cleaned = text.replace(/^\uFEFF/, '').trim();
            if (!cleaned) {
                return { success: false, message: `Empty response from server (${response.status})` };
            }

            let data;
            try {
                data = JSON.parse(cleaned);
            } catch (error) {
                return { success: false, message: 'Invalid JSON response from server.' };
            }

            if (!data.success) {
                setStatus(data.message || 'Update failed.', 'error');
                return data;
            }

            const summary = `
                <div class="text-center">
                    <p class="text-muted">Registration <strong>#${editState.registrationId}</strong> updated.</p>
                </div>
            `;
            const summaryContainer = document.getElementById('registrationSummary');
            if (summaryContainer) {
                summaryContainer.innerHTML = summary;
            }

            const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
            if (registrationModal) {
                registrationModal.hide();
            }

            setStatus(`Registration #${editState.registrationId} updated.`, 'success');

            setTimeout(() => {
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            }, 300);

            return data;
        } catch (error) {
            setStatus('Unable to reach the update service.', 'error');
            return { success: false, message: 'Unable to reach the update service.' };
        }
    }

    function overrideRegistrationSubmit() {
        if (typeof window.completeRegistration !== 'function') {
            return;
        }

        const originalCompleteRegistration = window.completeRegistration;
        window.completeRegistration = function () {
            if (!window.SEDGA_EDIT_MODE) {
                return originalCompleteRegistration();
            }
            return updateRegistration();
        };
    }

    function bindLookupHandlers() {
        const button = document.getElementById('loadRegistrationBtn');
        if (button) {
            button.addEventListener('click', () => handleLookup());
        }

        const input = document.getElementById('editRegistrationId');
        if (input) {
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleLookup();
                }
            });
        }

        document.querySelectorAll('.edit-registration-btn').forEach(buttonEl => {
            buttonEl.addEventListener('click', () => {
                const registrationId = parseInt(buttonEl.dataset.registrationId || 0, 10);
                handleLookup(registrationId);
            });
        });
    }

    function bindSuccessModalRefresh() {
        const successModalElement = document.getElementById('successModal');
        if (!successModalElement) {
            return;
        }

        successModalElement.addEventListener('hidden.bs.modal', () => {
            window.location.reload();
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            bindLookupHandlers();
            overrideRegistrationSubmit();
            applyEditModeUi();
            bindSuccessModalRefresh();
        });
    } else {
        bindLookupHandlers();
        overrideRegistrationSubmit();
        applyEditModeUi();
        bindSuccessModalRefresh();
    }
})();
