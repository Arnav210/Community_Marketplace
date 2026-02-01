/**
 * Login Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (window.app.auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    initLoginForm();
    initPasswordToggle();
    initDemoCredentials();
});

/**
 * Initialize login form
 */
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        window.app.ui.clearFormErrors(form);

        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate
        let isValid = true;

        if (!window.app.validate.required(email)) {
            window.app.ui.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!window.app.validate.email(email)) {
            window.app.ui.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }

        if (!window.app.validate.required(password)) {
            window.app.ui.showFieldError('password', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Submit
        const submitBtn = document.getElementById('submitBtn');
        window.app.ui.setButtonLoading(submitBtn, true);

        try {
            // In Phase 1, use mock login
            // In Phase 4, this will call the actual API
            const response = await mockLogin(email, password);

            if (response.success) {
                window.app.auth.login(response.token, response.user);
                
                // Redirect to dashboard or previous page
                const redirectUrl = window.app.urlParams.get('redirect') || 'dashboard.html';
                window.location.href = redirectUrl;
            }
        } catch (error) {
            window.app.ui.showAlert(error.message || 'Login failed. Please try again.', 'error');
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
 * Initialize password visibility toggle
 */
function initPasswordToggle() {
    const toggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    if (toggle && passwordInput) {
        toggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            toggle.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

/**
 * Initialize demo credentials button
 */
function initDemoCredentials() {
    const fillDemoBtn = document.getElementById('fillDemoBtn');
    
    if (fillDemoBtn) {
        fillDemoBtn.addEventListener('click', () => {
            document.getElementById('email').value = 'demo@example.com';
            document.getElementById('password').value = 'demo1234';
        });
    }
}

/**
 * Mock login function for Phase 1
 * Will be replaced with actual API call in Phase 4
 */
async function mockLogin(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo credentials
    if (email === 'demo@example.com' && password === 'demo1234') {
        return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: 1,
                email: 'demo@example.com',
                firstName: 'Demo',
                lastName: 'User',
                location: 'Seattle, WA',
                createdAt: '2024-01-15',
            },
        };
    }

    // For demo purposes, accept any valid email format with password >= 8 chars
    if (window.app.validate.email(email) && password.length >= 8) {
        return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: Date.now(),
                email: email,
                firstName: email.split('@')[0],
                lastName: 'User',
                location: 'Unknown',
                createdAt: new Date().toISOString(),
            },
        };
    }

    throw new Error('Invalid email or password');
}
