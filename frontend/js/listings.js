/**
 * Listings Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSort();
    initViewToggle();
    initMobileFilters();
    loadListings();
});

// State
let currentFilters = {
    category: 'all',
    priceMin: null,
    priceMax: null,
    condition: [],
    location: '',
    distance: 25,
    search: '',
    sort: 'newest',
    page: 1,
};

let currentView = 'grid';

/**
 * Initialize filters
 */
function initFilters() {
    const form = document.getElementById('filtersForm');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');

    // Load filters from URL
    loadFiltersFromUrl();

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });

        // Category radio buttons
        form.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', () => {
                currentFilters.category = radio.value;
            });
        });

        // Condition checkboxes
        form.querySelectorAll('input[name="condition"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    currentFilters.condition.push(checkbox.value);
                } else {
                    currentFilters.condition = currentFilters.condition.filter(c => c !== checkbox.value);
                }
            });
        });

        // Price inputs
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');

        if (priceMin) {
            priceMin.addEventListener('change', () => {
                currentFilters.priceMin = priceMin.value ? Number(priceMin.value) : null;
            });
        }

        if (priceMax) {
            priceMax.addEventListener('change', () => {
                currentFilters.priceMax = priceMax.value ? Number(priceMax.value) : null;
            });
        }

        // Location filter
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) {
            locationFilter.addEventListener('change', () => {
                currentFilters.location = locationFilter.value;
            });
        }

        // Distance slider
        const distanceSlider = document.getElementById('distance');
        const distanceValue = document.getElementById('distanceValue');

        if (distanceSlider && distanceValue) {
            distanceSlider.addEventListener('input', () => {
                distanceValue.textContent = distanceSlider.value;
                currentFilters.distance = Number(distanceSlider.value);
            });
        }
    }

    // Clear filters
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', clearFilters);
    }
}

/**
 * Load filters from URL parameters
 */
function loadFiltersFromUrl() {
    const params = window.app.urlParams.getAll();

    if (params.category) {
        currentFilters.category = params.category;
        const radio = document.querySelector(`input[name="category"][value="${params.category}"]`);
        if (radio) radio.checked = true;
    }

    if (params.search) {
        currentFilters.search = params.search;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = params.search;
    }

    if (params.sort) {
        currentFilters.sort = params.sort;
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = params.sort;
    }

    if (params.priceMin) {
        currentFilters.priceMin = Number(params.priceMin);
        const priceMin = document.getElementById('priceMin');
        if (priceMin) priceMin.value = params.priceMin;
    }

    if (params.priceMax) {
        currentFilters.priceMax = Number(params.priceMax);
        const priceMax = document.getElementById('priceMax');
        if (priceMax) priceMax.value = params.priceMax;
    }
}

/**
 * Apply filters and reload listings
 */
function applyFilters() {
    currentFilters.page = 1;
    updateActiveFiltersDisplay();
    loadListings();
    closeMobileFilters();
}

/**
 * Clear all filters
 */
function clearFilters() {
    currentFilters = {
        category: 'all',
        priceMin: null,
        priceMax: null,
        condition: [],
        location: '',
        distance: 25,
        search: '',
        sort: 'newest',
        page: 1,
    };

    // Reset form
    const form = document.getElementById('filtersForm');
    if (form) form.reset();

    // Reset category to 'all'
    const allCategoryRadio = document.querySelector('input[name="category"][value="all"]');
    if (allCategoryRadio) allCategoryRadio.checked = true;

    // Reset distance display
    const distanceValue = document.getElementById('distanceValue');
    if (distanceValue) distanceValue.textContent = '25';

    updateActiveFiltersDisplay();
    loadListings();
}

/**
 * Update active filters display
 */
function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFilters');
    if (!container) return;

    const tags = [];

    if (currentFilters.category !== 'all') {
        tags.push({
            label: capitalizeFirst(currentFilters.category),
            type: 'category',
        });
    }

    if (currentFilters.priceMin || currentFilters.priceMax) {
        const min = currentFilters.priceMin ? `$${currentFilters.priceMin}` : '$0';
        const max = currentFilters.priceMax ? `$${currentFilters.priceMax}` : 'Any';
        tags.push({
            label: `${min} - ${max}`,
            type: 'price',
        });
    }

    currentFilters.condition.forEach(cond => {
        tags.push({
            label: capitalizeFirst(cond.replace('-', ' ')),
            type: 'condition',
            value: cond,
        });
    });

    if (currentFilters.search) {
        tags.push({
            label: `"${currentFilters.search}"`,
            type: 'search',
        });
    }

    container.innerHTML = tags.map(tag => `
        <span class="filter-tag">
            ${tag.label}
            <span class="filter-tag-remove" onclick="removeFilter('${tag.type}', '${tag.value || ''}')">&times;</span>
        </span>
    `).join('');
}

/**
 * Remove a specific filter
 */
function removeFilter(type, value) {
    switch (type) {
        case 'category':
            currentFilters.category = 'all';
            const allRadio = document.querySelector('input[name="category"][value="all"]');
            if (allRadio) allRadio.checked = true;
            break;
        case 'price':
            currentFilters.priceMin = null;
            currentFilters.priceMax = null;
            const priceMin = document.getElementById('priceMin');
            const priceMax = document.getElementById('priceMax');
            if (priceMin) priceMin.value = '';
            if (priceMax) priceMax.value = '';
            break;
        case 'condition':
            currentFilters.condition = currentFilters.condition.filter(c => c !== value);
            const checkbox = document.querySelector(`input[name="condition"][value="${value}"]`);
            if (checkbox) checkbox.checked = false;
            break;
        case 'search':
            currentFilters.search = '';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            break;
    }

    applyFilters();
}

/**
 * Initialize sort functionality
 */
function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentFilters.sort = sortSelect.value;
            loadListings();
        });
    }
}

/**
 * Initialize view toggle
 */
function initViewToggle() {
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const listingsGrid = document.getElementById('listingsGrid');

    if (gridBtn && listBtn && listingsGrid) {
        gridBtn.addEventListener('click', () => {
            currentView = 'grid';
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            listingsGrid.classList.remove('list-view');
        });

        listBtn.addEventListener('click', () => {
            currentView = 'list';
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            listingsGrid.classList.add('list-view');
        });
    }
}

/**
 * Initialize mobile filters
 */
function initMobileFilters() {
    const openBtn = document.getElementById('openFiltersBtn');
    const closeBtn = document.getElementById('closeFiltersBtn');
    const sidebar = document.getElementById('filtersSidebar');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', closeMobileFilters);
    }
}

function closeMobileFilters() {
    const sidebar = document.getElementById('filtersSidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Load listings with current filters
 */
async function loadListings() {
    const container = document.getElementById('listingsGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!container) return;

    // Show loading state
    container.innerHTML = Array(6).fill(0).map(() => `
        <article class="listing-card placeholder">
            <div class="listing-image">
                <div class="image-placeholder"></div>
            </div>
            <div class="listing-info">
                <h3 class="listing-title">Loading...</h3>
                <p class="listing-price">$--</p>
                <p class="listing-location">--</p>
            </div>
        </article>
    `).join('');

    try {
        // In Phase 1, use mock data
        // In Phase 4, this will call the actual API
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        
        let listings = getMockListings();

        // Apply filters
        listings = filterListings(listings);

        // Sort
        listings = sortListings(listings);

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = listings.length;
        }

        if (listings.length === 0) {
            container.innerHTML = '';
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
                        <img src="${listing.image || '../assets/placeholder.jpg'}" alt="${escapeHtml(listing.title)}">
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

        // Apply current view
        if (currentView === 'list') {
            container.classList.add('list-view');
        }

        updatePagination(listings.length);
    } catch (error) {
        console.error('Error loading listings:', error);
        container.innerHTML = '<p class="error-message">Failed to load listings</p>';
    }
}

/**
 * Filter listings based on current filters
 */
function filterListings(listings) {
    return listings.filter(listing => {
        // Category filter
        if (currentFilters.category !== 'all' && listing.category !== currentFilters.category) {
            return false;
        }

        // Price filters
        if (currentFilters.priceMin && listing.price < currentFilters.priceMin) {
            return false;
        }

        if (currentFilters.priceMax && listing.price > currentFilters.priceMax) {
            return false;
        }

        // Condition filter
        if (currentFilters.condition.length > 0 && !currentFilters.condition.includes(listing.condition)) {
            return false;
        }

        // Search filter
        if (currentFilters.search) {
            const search = currentFilters.search.toLowerCase();
            const matchesTitle = listing.title.toLowerCase().includes(search);
            const matchesDescription = listing.description?.toLowerCase().includes(search);
            if (!matchesTitle && !matchesDescription) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Sort listings based on current sort option
 */
function sortListings(listings) {
    const sorted = [...listings];

    switch (currentFilters.sort) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
    }

    return sorted;
}

/**
 * Update pagination (simplified for Phase 1)
 */
function updatePagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const itemsPerPage = 12;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }

    pagination.classList.remove('hidden');
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
 * Mock data for Phase 1
 */
function getMockListings() {
    return [
        {
            id: 1,
            title: 'iPhone 14 Pro Max - Excellent Condition',
            price: 899,
            category: 'electronics',
            condition: 'like-new',
            location: 'Downtown Seattle',
            image: 'https://picsum.photos/seed/phone1/400/300',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            title: 'Vintage Leather Sofa',
            price: 450,
            category: 'furniture',
            condition: 'good',
            location: 'Capitol Hill',
            image: 'https://picsum.photos/seed/sofa1/400/300',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            id: 3,
            title: 'Mountain Bike - Trek 820',
            price: 350,
            category: 'sports',
            condition: 'good',
            location: 'Fremont',
            image: 'https://picsum.photos/seed/bike1/400/300',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            id: 4,
            title: 'MacBook Pro 16" M2',
            price: 1899,
            category: 'electronics',
            condition: 'new',
            location: 'Ballard',
            image: 'https://picsum.photos/seed/laptop1/400/300',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: 5,
            title: 'Bookshelf - Solid Oak',
            price: 120,
            category: 'furniture',
            condition: 'good',
            location: 'University District',
            image: 'https://picsum.photos/seed/shelf1/400/300',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
            id: 6,
            title: 'Nike Air Jordan 1 - Size 10',
            price: 180,
            category: 'clothing',
            condition: 'new',
            location: 'Bellevue',
            image: 'https://picsum.photos/seed/jordan1/400/300',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
            id: 7,
            title: 'PlayStation 5 + 3 Games',
            price: 450,
            category: 'electronics',
            condition: 'like-new',
            location: 'Redmond',
            image: 'https://picsum.photos/seed/ps51/400/300',
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
        {
            id: 8,
            title: 'Standing Desk - Electric',
            price: 275,
            category: 'furniture',
            condition: 'like-new',
            location: 'Capitol Hill',
            image: 'https://picsum.photos/seed/desk1/400/300',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
            id: 9,
            title: 'Harry Potter Complete Set',
            price: 45,
            category: 'books',
            condition: 'good',
            location: 'Kirkland',
            image: 'https://picsum.photos/seed/books1/400/300',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
            id: 10,
            title: 'Garden Tools Set',
            price: 85,
            category: 'home',
            condition: 'good',
            location: 'Tacoma',
            image: 'https://picsum.photos/seed/garden1/400/300',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
    ];
}

// Make removeFilter available globally
window.removeFilter = removeFilter;
