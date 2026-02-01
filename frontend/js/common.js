/**
 * Common JavaScript - Shared functionality across all pages
 */

// ===========================
// Configuration
// ===========================
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
};

// ===========================
// API Helper Functions
// ===========================
const api = {
    /**
     * Make an API request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise<object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },
};

// ===========================
// Authentication Helpers
// ===========================
const auth = {
    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    /**
     * Get current user data
     * @returns {object|null}
     */
    getUser() {
        const userData = localStorage.getItem(CONFIG.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Save auth data to localStorage
     * @param {string} token - JWT token
     * @param {object} user - User data
     */
    login(token, user) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
        this.updateUI();
    },

    /**
     * Clear auth data from localStorage
     */
    logout() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        this.updateUI();
        window.location.href = 'index.html';
    },

    /**
     * Update UI based on auth state
     */
    updateUI() {
        const isLoggedIn = this.isLoggedIn();
        const loggedOutElements = document.querySelectorAll('.auth-logged-out');
        const loggedInElements = document.querySelectorAll('.auth-logged-in');

        loggedOutElements.forEach(el => {
            el.classList.toggle('hidden', isLoggedIn);
        });

        loggedInElements.forEach(el => {
            el.classList.toggle('hidden', !isLoggedIn);
        });
    },

    /**
     * Require authentication for a page
     * @param {string} redirectUrl - URL to redirect to if not authenticated
     */
    requireAuth(redirectUrl = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
};

// ===========================
// UI Helpers
// ===========================
const ui = {
    /**
     * Show an alert message
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, error, warning, info)
     * @param {string} containerId - Container element ID
     */
    showAlert(message, type = 'info', containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button type="button" class="alert-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.innerHTML = '';
        container.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    },

    /**
     * Show form error
     * @param {string} fieldId - Field ID
     * @param {string} message - Error message
     */
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}Error`);

        if (field) {
            field.classList.add('error');
        }

        if (errorEl) {
            errorEl.textContent = message;
        }
    },

    /**
     * Clear form error
     * @param {string} fieldId - Field ID
     */
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}Error`);

        if (field) {
            field.classList.remove('error');
        }

        if (errorEl) {
            errorEl.textContent = '';
        }
    },

    /**
     * Clear all form errors
     * @param {HTMLFormElement} form - Form element
     */
    clearFormErrors(form) {
        form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
            field.classList.remove('error');
        });

        form.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });
    },

    /**
     * Set loading state on a button
     * @param {HTMLButtonElement} button - Button element
     * @param {boolean} loading - Loading state
     */
    setButtonLoading(button, loading) {
        const textEl = button.querySelector('.btn-text');
        const loaderEl = button.querySelector('.btn-loader');

        button.disabled = loading;

        if (textEl) {
            textEl.classList.toggle('hidden', loading);
        }

        if (loaderEl) {
            loaderEl.classList.toggle('hidden', !loading);
        }
    },

    /**
     * Format price for display
     * @param {number} price - Price value
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    },

    /**
     * Format date for display
     * @param {string|Date} date - Date value
     * @returns {string} Formatted date
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(date));
    },

    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {string|Date} date - Date value
     * @returns {string} Relative time string
     */
    formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now - then) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    },
};

// ===========================
// Validation Helpers
// ===========================
const validate = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} Validation result
     */
    password(password) {
        const result = {
            isValid: true,
            hasLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
        };

        result.isValid = result.hasLength && result.hasUpper && result.hasLower && result.hasNumber;

        // Calculate strength (0-4)
        result.strength = [result.hasLength, result.hasUpper, result.hasLower, result.hasNumber]
            .filter(Boolean).length;

        return result;
    },

    /**
     * Validate required field
     * @param {string} value - Value to validate
     * @returns {boolean}
     */
    required(value) {
        return value !== null && value !== undefined && value.trim() !== '';
    },

    /**
     * Validate minimum length
     * @param {string} value - Value to validate
     * @param {number} min - Minimum length
     * @returns {boolean}
     */
    minLength(value, min) {
        return value.length >= min;
    },

    /**
     * Validate maximum length
     * @param {string} value - Value to validate
     * @param {number} max - Maximum length
     * @returns {boolean}
     */
    maxLength(value, max) {
        return value.length <= max;
    },
};

// ===========================
// Navigation
// ===========================
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
        });
    }
}

// ===========================
// Search Functionality
// ===========================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `listings.html?search=${encodeURIComponent(query)}`;
            }
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// ===========================
// URL Helpers
// ===========================
const urlParams = {
    /**
     * Get URL parameter value
     * @param {string} name - Parameter name
     * @returns {string|null}
     */
    get(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * Set URL parameter
     * @param {string} name - Parameter name
     * @param {string} value - Parameter value
     */
    set(name, value) {
        const params = new URLSearchParams(window.location.search);
        params.set(name, value);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    },

    /**
     * Remove URL parameter
     * @param {string} name - Parameter name
     */
    remove(name) {
        const params = new URLSearchParams(window.location.search);
        params.delete(name);
        const newUrl = params.toString() 
            ? `${window.location.pathname}?${params}` 
            : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    },

    /**
     * Get all URL parameters as object
     * @returns {object}
     */
    getAll() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
};

// ===========================
// Local Storage Helpers
// ===========================
const storage = {
    get(key, defaultValue = null) {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        try {
            return JSON.parse(item);
        } catch {
            return item;
        }
    },

    set(key, value) {
        const item = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, item);
    },

    remove(key) {
        localStorage.removeItem(key);
    },
};

// ===========================
// Initialize on DOM Ready
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    auth.updateUI();
});

// Export for use in other modules
window.app = {
    api,
    auth,
    ui,
    validate,
    urlParams,
    storage,
    CONFIG,
};
