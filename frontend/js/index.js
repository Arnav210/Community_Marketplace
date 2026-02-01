/**
 * Index Page JavaScript - Home page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initFeaturedListings();
    initRecentListings();
});

/**
 * Initialize featured listings section
 */
async function initFeaturedListings() {
    const container = document.getElementById('featuredListings');
    if (!container) return;

    try {
        // In Phase 1, we'll use mock data
        // In Phase 4, this will call the actual API
        const listings = getMockFeaturedListings();
        renderListings(container, listings);
    } catch (error) {
        console.error('Error loading featured listings:', error);
        container.innerHTML = '<p class="error-message">Failed to load listings</p>';
    }
}

/**
 * Initialize recent listings section
 */
async function initRecentListings() {
    const container = document.getElementById('recentListings');
    if (!container) return;

    try {
        // In Phase 1, we'll use mock data
        // In Phase 4, this will call the actual API
        const listings = getMockRecentListings();
        renderListings(container, listings);
    } catch (error) {
        console.error('Error loading recent listings:', error);
        container.innerHTML = '<p class="error-message">Failed to load listings</p>';
    }
}

/**
 * Render listings to a container
 * @param {HTMLElement} container - Container element
 * @param {Array} listings - Array of listing objects
 */
function renderListings(container, listings) {
    if (listings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3 class="empty-title">No listings yet</h3>
                <p class="empty-description">Be the first to post a listing!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = listings.map(listing => `
        <article class="listing-card">
            <a href="listing-detail.html?id=${listing.id}" class="listing-link">
                <div class="listing-image">
                    <img src="${listing.image || '../assets/placeholder.jpg'}" alt="${listing.title}">
                    ${listing.featured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                <div class="listing-info">
                    <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
                    <p class="listing-price">${window.app.ui.formatPrice(listing.price)}</p>
                    <p class="listing-location">📍 ${escapeHtml(listing.location)}</p>
                    <p class="listing-date">${window.app.ui.formatRelativeTime(listing.createdAt)}</p>
                </div>
            </a>
        </article>
    `).join('');
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mock data for featured listings (Phase 1)
 * Will be replaced with API call in Phase 4
 */
function getMockFeaturedListings() {
    return [
        {
            id: 1,
            title: 'iPhone 14 Pro Max - Excellent Condition',
            price: 899,
            location: 'Downtown Seattle',
            image: 'https://picsum.photos/seed/phone/400/300',
            featured: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            title: 'Vintage Leather Sofa',
            price: 450,
            location: 'Capitol Hill',
            image: 'https://picsum.photos/seed/sofa/400/300',
            featured: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            id: 3,
            title: 'Mountain Bike - Trek 820',
            price: 350,
            location: 'Fremont',
            image: 'https://picsum.photos/seed/bike/400/300',
            featured: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: 4,
            title: 'MacBook Pro 16" M2',
            price: 1899,
            location: 'Ballard',
            image: 'https://picsum.photos/seed/laptop/400/300',
            featured: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    ];
}

/**
 * Mock data for recent listings (Phase 1)
 * Will be replaced with API call in Phase 4
 */
function getMockRecentListings() {
    return [
        {
            id: 5,
            title: 'Bookshelf - Solid Oak',
            price: 120,
            location: 'University District',
            image: 'https://picsum.photos/seed/shelf/400/300',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
            id: 6,
            title: 'Nike Air Jordan 1 - Size 10',
            price: 180,
            location: 'Bellevue',
            image: 'https://picsum.photos/seed/shoes/400/300',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
            id: 7,
            title: 'PlayStation 5 + 3 Games',
            price: 450,
            location: 'Redmond',
            image: 'https://picsum.photos/seed/ps5/400/300',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
            id: 8,
            title: 'Standing Desk - Electric',
            price: 275,
            location: 'Capitol Hill',
            image: 'https://picsum.photos/seed/desk/400/300',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
    ];
}
