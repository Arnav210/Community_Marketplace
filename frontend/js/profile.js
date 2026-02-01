/**
 * Profile Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Require authentication
    if (!window.app.auth.requireAuth()) {
        return;
    }

    initProfile();
    initTabs();
    initBioEdit();
    initAvatarUpload();
    initSettings();
});

/**
 * Initialize profile page
 */
async function initProfile() {
    const user = window.app.auth.getUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Populate profile data
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profileLocation').textContent = user.location || 'Location not set';
    document.getElementById('profileJoined').textContent = window.app.ui.formatDate(user.createdAt);
    document.getElementById('profileEmail').textContent = user.email;

    // Load additional data
    await Promise.all([
        loadProfileStats(),
        loadProfileListings(),
        loadProfileReviews(),
    ]);

    // Populate settings form
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('settingsLocation').value = user.location || '';
}

/**
 * Initialize tabs
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panels
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
                if (panel.id === `${tabId}Panel`) {
                    panel.classList.remove('hidden');
                }
            });
        });
    });
}

/**
 * Initialize bio editing
 */
function initBioEdit() {
    const editBtn = document.getElementById('editBioBtn');
    const bioDisplay = document.getElementById('bioDisplay');
    const bioForm = document.getElementById('bioForm');
    const cancelBtn = document.getElementById('cancelBioBtn');
    const bioInput = document.getElementById('bioInput');
    const bioCount = document.getElementById('bioCount');

    if (editBtn && bioDisplay && bioForm) {
        editBtn.addEventListener('click', () => {
            bioDisplay.classList.add('hidden');
            bioForm.classList.remove('hidden');
            bioInput.value = document.getElementById('profileBio').textContent;
            bioInput.focus();
        });

        cancelBtn?.addEventListener('click', () => {
            bioForm.classList.add('hidden');
            bioDisplay.classList.remove('hidden');
        });

        bioInput?.addEventListener('input', () => {
            if (bioCount) {
                bioCount.textContent = bioInput.value.length;
            }
        });

        bioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newBio = bioInput.value.trim();

            try {
                // In Phase 4, this will update via API
                document.getElementById('profileBio').textContent = newBio || 'No bio added yet.';
                bioForm.classList.add('hidden');
                bioDisplay.classList.remove('hidden');
                window.app.ui.showAlert('Bio updated successfully!', 'success');
            } catch (error) {
                window.app.ui.showAlert('Failed to update bio', 'error');
            }
        });
    }
}

/**
 * Initialize avatar upload
 */
function initAvatarUpload() {
    const changeBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.getElementById('avatarImage');
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');

    if (changeBtn && avatarInput) {
        changeBtn.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                window.app.ui.showAlert('Please upload an image file', 'error');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                window.app.ui.showAlert('Image must be less than 2MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (avatarImage && avatarPlaceholder) {
                    avatarImage.src = e.target.result;
                    avatarImage.classList.remove('hidden');
                    avatarPlaceholder.classList.add('hidden');
                }
            };

            reader.readAsDataURL(file);
        });
    }
}

/**
 * Load profile statistics
 */
async function loadProfileStats() {
    try {
        // In Phase 1, use mock data
        const stats = {
            listings: 5,
            sold: 3,
            rating: 4.8,
        };

        document.getElementById('profileListings').textContent = stats.listings;
        document.getElementById('profileSold').textContent = stats.sold;
        document.getElementById('profileRating').textContent = stats.rating ? `${stats.rating} ★` : 'New';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Load profile listings
 */
async function loadProfileListings(filter = 'all') {
    const container = document.getElementById('profileListingsGrid');
    const emptyState = document.getElementById('emptyListings');
    
    if (!container) return;

    try {
        // In Phase 1, use mock data
        let listings = getMockListings();

        // Apply filter
        if (filter !== 'all') {
            listings = listings.filter(l => l.status === filter);
        }

        if (listings.length === 0) {
            container.classList.add('hidden');
            emptyState?.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState?.classList.add('hidden');

        container.innerHTML = listings.map(listing => `
            <article class="listing-card">
                <a href="listing-detail.html?id=${listing.id}">
                    <div class="listing-image">
                        <img src="${listing.image}" alt="${escapeHtml(listing.title)}">
                        <span class="listing-status-badge status-${listing.status}">${capitalizeFirst(listing.status)}</span>
                    </div>
                    <div class="listing-info">
                        <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
                        <p class="listing-price">${window.app.ui.formatPrice(listing.price)}</p>
                        <p class="listing-date">${window.app.ui.formatRelativeTime(listing.createdAt)}</p>
                    </div>
                </a>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading listings:', error);
    }

    // Initialize filter buttons
    document.querySelectorAll('.listings-filter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.listings-filter .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProfileListings(btn.dataset.filter);
        });
    });
}

/**
 * Load profile reviews
 */
async function loadProfileReviews() {
    const container = document.getElementById('reviewsList');
    const emptyState = document.getElementById('emptyReviews');
    
    if (!container) return;

    try {
        // In Phase 1, use mock data
        const reviews = getMockReviews();

        if (reviews.length === 0) {
            container?.classList.add('hidden');
            emptyState?.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState?.classList.add('hidden');

        // Update summary
        const ratings = reviews.map(r => r.rating);
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        
        document.getElementById('overallRating').textContent = avgRating.toFixed(1);
        document.getElementById('reviewCount').textContent = reviews.length;

        // Render reviews
        container.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar"></div>
                        <div>
                            <p class="reviewer-name">${escapeHtml(review.reviewerName)}</p>
                            <p class="review-date">${window.app.ui.formatDate(review.date)}</p>
                        </div>
                    </div>
                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                </div>
                <p class="review-content">${escapeHtml(review.content)}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

/**
 * Initialize settings form
 */
function initSettings() {
    const form = document.getElementById('settingsForm');
    const deactivateBtn = document.getElementById('deactivateBtn');
    const deleteBtn = document.getElementById('deleteAccountBtn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                location: document.getElementById('settingsLocation').value.trim(),
                currentPassword: document.getElementById('currentPassword').value,
                newPassword: document.getElementById('newPassword').value,
                confirmNewPassword: document.getElementById('confirmNewPassword').value,
            };

            // Validate password change
            if (formData.newPassword || formData.confirmNewPassword) {
                if (!formData.currentPassword) {
                    window.app.ui.showAlert('Please enter your current password', 'error');
                    return;
                }
                if (formData.newPassword !== formData.confirmNewPassword) {
                    window.app.ui.showAlert('New passwords do not match', 'error');
                    return;
                }
                if (formData.newPassword.length < 8) {
                    window.app.ui.showAlert('New password must be at least 8 characters', 'error');
                    return;
                }
            }

            try {
                // In Phase 4, this will update via API
                const user = window.app.auth.getUser();
                const updatedUser = {
                    ...user,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    location: formData.location,
                };

                window.app.storage.set(window.app.CONFIG.USER_KEY, updatedUser);
                window.app.ui.showAlert('Settings saved successfully!', 'success');

                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
            } catch (error) {
                window.app.ui.showAlert('Failed to save settings', 'error');
            }
        });
    }

    // Deactivate account
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to deactivate your account? Your listings will be hidden.')) {
                window.app.ui.showAlert('Account deactivated. You can reactivate anytime by logging in.', 'info');
                window.app.auth.logout();
            }
        });
    }

    // Delete account
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                if (confirm('This will delete all your listings, messages, and data. Continue?')) {
                    window.app.ui.showAlert('Account deleted successfully.', 'info');
                    window.app.auth.logout();
                }
            }
        });
    }
}

/**
 * Helper functions
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Mock data functions
 */
function getMockListings() {
    return [
        {
            id: 1,
            title: 'iPhone 14 Pro Max',
            price: 899,
            status: 'active',
            image: 'https://picsum.photos/seed/phone1/400/300',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            title: 'Vintage Leather Sofa',
            price: 450,
            status: 'active',
            image: 'https://picsum.photos/seed/sofa1/400/300',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: 3,
            title: 'Nike Air Max 90',
            price: 120,
            status: 'sold',
            image: 'https://picsum.photos/seed/shoes1/400/300',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    ];
}

function getMockReviews() {
    return [
        {
            id: 1,
            reviewerName: 'Jane Smith',
            rating: 5,
            content: 'Great seller! Item was exactly as described and shipping was fast. Would definitely buy from again.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            reviewerName: 'Mike Johnson',
            rating: 4,
            content: 'Good communication and fair price. Item was in good condition.',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
    ];
}
