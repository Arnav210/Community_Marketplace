/**
 * Register Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (window.app.auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    initRegisterForm();
    initPasswordToggle();
    initPasswordStrength();
});

/**
 * Initialize registration form
 */
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        window.app.ui.clearFormErrors(form);

        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const location = document.getElementById('location').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const newsletter = document.getElementById('newsletter').checked;

        // Validate
        let isValid = true;

        if (!window.app.validate.required(firstName)) {
            window.app.ui.showFieldError('firstName', 'First name is required');
            isValid = false;
        } else if (!window.app.validate.minLength(firstName, 2)) {
            window.app.ui.showFieldError('firstName', 'First name must be at least 2 characters');
            isValid = false;
        }

        if (!window.app.validate.required(lastName)) {
            window.app.ui.showFieldError('lastName', 'Last name is required');
            isValid = false;
        } else if (!window.app.validate.minLength(lastName, 2)) {
            window.app.ui.showFieldError('lastName', 'Last name must be at least 2 characters');
            isValid = false;
        }

        if (!window.app.validate.required(email)) {
            window.app.ui.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!window.app.validate.email(email)) {
            window.app.ui.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }

        const passwordValidation = window.app.validate.password(password);
        if (!window.app.validate.required(password)) {
            window.app.ui.showFieldError('password', 'Password is required');
            isValid = false;
        } else if (!passwordValidation.isValid) {
            window.app.ui.showFieldError('password', 'Password does not meet requirements');
            isValid = false;
        }

        if (password !== confirmPassword) {
            window.app.ui.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        if (!agreeTerms) {
            window.app.ui.showFieldError('agreeTerms', 'You must agree to the terms');
            isValid = false;
        }

        if (!isValid) return;

        // Submit
        const submitBtn = document.getElementById('submitBtn');
        window.app.ui.setButtonLoading(submitBtn, true);

        try {
            // In Phase 1, use mock registration
            // In Phase 4, this will call the actual API
            const response = await mockRegister({
                firstName,
                lastName,
                email,
                password,
                location,
                newsletter,
            });

            if (response.success) {
                window.app.auth.login(response.token, response.user);
                
                // Show success and redirect
                window.app.ui.showAlert('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } catch (error) {
            window.app.ui.showAlert(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            window.app.ui.setButtonLoading(submitBtn, false);
        }
    });

    // Clear errors on input
    form.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            window.app.ui.clearFieldError(input.id);
        });
    });
}

/**
 * Initialize password visibility toggles
 */
function initPasswordToggle() {
    const toggles = [
        { toggle: 'passwordToggle', input: 'password' },
        { toggle: 'confirmPasswordToggle', input: 'confirmPassword' },
    ];

    toggles.forEach(({ toggle, input }) => {
        const toggleEl = document.getElementById(toggle);
        const inputEl = document.getElementById(input);

        if (toggleEl && inputEl) {
            toggleEl.addEventListener('click', () => {
                const type = inputEl.type === 'password' ? 'text' : 'password';
                inputEl.type = type;
                toggleEl.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
    });
}

/**
 * Initialize password strength indicator
 */
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const requirements = {
        length: document.getElementById('reqLength'),
        upper: document.getElementById('reqUpper'),
        lower: document.getElementById('reqLower'),
        number: document.getElementById('reqNumber'),
    };

    if (!passwordInput || !strengthFill || !strengthText) return;

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const validation = window.app.validate.password(password);

        // Update strength bar
        strengthFill.className = 'strength-fill';
        if (validation.strength === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Password strength';
        } else if (validation.strength === 1) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (validation.strength === 2) {
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Fair';
        } else if (validation.strength === 3) {
            strengthFill.classList.add('good');
            strengthText.textContent = 'Good';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong';
        }

        // Update requirements
        if (requirements.length) {
            requirements.length.classList.toggle('met', validation.hasLength);
        }
        if (requirements.upper) {
            requirements.upper.classList.toggle('met', validation.hasUpper);
        }
        if (requirements.lower) {
            requirements.lower.classList.toggle('met', validation.hasLower);
        }
        if (requirements.number) {
            requirements.number.classList.toggle('met', validation.hasNumber);
        }
    });
}

/**
 * Mock registration function for Phase 1
 * Will be replaced with actual API call in Phase 4
 */
async function mockRegister(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if email already exists (mock check)
    if (userData.email === 'demo@example.com') {
        throw new Error('An account with this email already exists');
    }

    return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
            id: Date.now(),
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            location: userData.location || 'Unknown',
            createdAt: new Date().toISOString(),
        },
    };
}
