/**
 * Dashboard Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Require authentication
    if (!window.app.auth.requireAuth()) {
        return;
    }

    initDashboard();
    initListingFilter();
});

/**
 * Initialize dashboard
 */
async function initDashboard() {
    const user = window.app.auth.getUser();
    
    // Set user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl && user) {
        userNameEl.textContent = user.firstName || user.email.split('@')[0];
    }

    // Load dashboard data
    await Promise.all([
        loadStats(),
        loadMyListings(),
        loadRecentMessages(),
        loadSavedItems(),
    ]);
}

/**
 * Load dashboard statistics
 */
async function loadStats() {
    try {
        // In Phase 1, use mock data
        // In Phase 4, this will call the actual API
        const stats = getMockStats();

        document.getElementById('activeListings').textContent = stats.activeListings;
        document.getElementById('totalViews').textContent = stats.totalViews;
        document.getElementById('totalMessages').textContent = stats.totalMessages;
        document.getElementById('soldItems').textContent = stats.soldItems;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Load user's listings
 */
async function loadMyListings(filter = 'all') {
    const container = document.getElementById('myListings');
    const emptyState = document.getElementById('emptyListings');
    
    if (!container) return;

    try {
        // In Phase 1, use mock data
        // In Phase 4, this will call the actual API
        let listings = getMockMyListings();

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
            <div class="listing-item">
                <div class="listing-item-image">
                    <img src="${listing.image || '../assets/placeholder.jpg'}" alt="${listing.title}">
                </div>
                <div class="listing-item-info">
                    <h3 class="listing-item-title">
                        <a href="listing-detail.html?id=${listing.id}">${escapeHtml(listing.title)}</a>
                    </h3>
                    <p class="listing-item-price">${window.app.ui.formatPrice(listing.price)}</p>
                    <p class="listing-item-meta">${listing.views} views • Posted ${window.app.ui.formatRelativeTime(listing.createdAt)}</p>
                </div>
                <div class="listing-item-actions">
                    <span class="listing-status status-${listing.status}">${capitalizeFirst(listing.status)}</span>
                    <div class="listing-actions-menu">
                        <button class="btn btn-sm btn-outline" onclick="editListing(${listing.id})">Edit</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading listings:', error);
        container.innerHTML = '<p class="error-message">Failed to load listings</p>';
    }
}

/**
 * Load recent messages
 */
async function loadRecentMessages() {
    const container = document.getElementById('recentMessages');
    const emptyState = document.getElementById('emptyMessages');
    
    if (!container) return;

    try {
        // In Phase 1, use mock data
        const messages = getMockMessages();

        if (messages.length === 0) {
            container.classList.add('hidden');
            emptyState?.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState?.classList.add('hidden');

        container.innerHTML = messages.map(msg => `
            <div class="message-item" onclick="openMessage(${msg.id})">
                <div class="message-avatar">
                    ${msg.avatar ? `<img src="${msg.avatar}" alt="${msg.senderName}">` : '👤'}
                </div>
                <div class="message-content">
                    <p class="message-sender">${escapeHtml(msg.senderName)}</p>
                    <p class="message-preview">${escapeHtml(window.app.ui.truncateText(msg.preview, 50))}</p>
                    <span class="message-time">${window.app.ui.formatRelativeTime(msg.timestamp)}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

/**
 * Load saved items
 */
async function loadSavedItems() {
    const container = document.getElementById('savedItems');
    const emptyState = document.getElementById('emptySaved');
    
    if (!container) return;

    try {
        // In Phase 1, use mock data
        const items = getMockSavedItems();

        if (items.length === 0) {
            container.classList.add('hidden');
            emptyState?.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState?.classList.add('hidden');

        container.innerHTML = items.map(item => `
            <a href="listing-detail.html?id=${item.id}" class="saved-item">
                <div class="saved-item-image">
                    <img src="${item.image || '../assets/placeholder.jpg'}" alt="${item.title}">
                </div>
                <div class="saved-item-info">
                    <p class="saved-item-title">${escapeHtml(window.app.ui.truncateText(item.title, 30))}</p>
                    <p class="saved-item-price">${window.app.ui.formatPrice(item.price)}</p>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading saved items:', error);
    }
}

/**
 * Initialize listing filter
 */
function initListingFilter() {
    const filterSelect = document.getElementById('listingFilter');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            loadMyListings(e.target.value);
        });
    }
}

/**
 * Edit listing (placeholder)
 */
function editListing(listingId) {
    window.location.href = `create-listing.html?edit=${listingId}`;
}

/**
 * Open message (placeholder)
 */
function openMessage(messageId) {
    console.log('Open message:', messageId);
    // Will be implemented when messaging feature is added
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
function getMockStats() {
    return {
        activeListings: 5,
        totalViews: 234,
        totalMessages: 12,
        soldItems: 3,
    };
}

function getMockMyListings() {
    return [
        {
            id: 1,
            title: 'iPhone 14 Pro Max - Excellent Condition',
            price: 899,
            views: 45,
            status: 'active',
            image: 'https://picsum.photos/seed/phone/400/300',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            title: 'Vintage Leather Sofa',
            price: 450,
            views: 32,
            status: 'active',
            image: 'https://picsum.photos/seed/sofa/400/300',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: 3,
            title: 'Nike Air Max 90',
            price: 120,
            views: 78,
            status: 'sold',
            image: 'https://picsum.photos/seed/shoes/400/300',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
    ];
}

function getMockMessages() {
    return [
        {
            id: 1,
            senderName: 'John Doe',
            preview: 'Hi, is the iPhone still available? I\'m very interested.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
            id: 2,
            senderName: 'Jane Smith',
            preview: 'Would you accept $400 for the sofa?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
    ];
}

function getMockSavedItems() {
    return [
        {
            id: 10,
            title: 'MacBook Pro 16"',
            price: 1899,
            image: 'https://picsum.photos/seed/laptop/400/300',
        },
        {
            id: 11,
            title: 'Electric Guitar',
            price: 350,
            image: 'https://picsum.photos/seed/guitar/400/300',
        },
    ];
}
