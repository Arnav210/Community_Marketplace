/**
 * Listing Detail Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initListingDetail();
    initGallery();
    initContactModal();
    initShareModal();
});

// State
let currentListing = null;
let currentImageIndex = 0;

/**
 * Initialize listing detail page
 */
async function initListingDetail() {
    const listingId = window.app.urlParams.get('id');
    
    if (!listingId) {
        window.location.href = 'listings.html';
        return;
    }

    try {
        // In Phase 1, use mock data
        // In Phase 4, this will call the actual API
        currentListing = getMockListing(listingId);

        if (!currentListing) {
            showNotFound();
            return;
        }

        renderListing(currentListing);
        loadSimilarListings(currentListing.category);
        checkSavedStatus();
    } catch (error) {
        console.error('Error loading listing:', error);
        showNotFound();
    }
}

/**
 * Render listing details
 */
function renderListing(listing) {
    // Update page title
    document.title = `${listing.title} - Community Marketplace`;

    // Breadcrumb
    const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
    const titleBreadcrumb = document.getElementById('titleBreadcrumb');
    
    if (categoryBreadcrumb) {
        categoryBreadcrumb.textContent = capitalizeFirst(listing.category);
        categoryBreadcrumb.href = `listings.html?category=${listing.category}`;
    }
    
    if (titleBreadcrumb) {
        titleBreadcrumb.textContent = window.app.ui.truncateText(listing.title, 40);
    }

    // Main image
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = listing.images[0];
        mainImage.alt = listing.title;
    }

    // Thumbnails
    renderThumbnails(listing.images);

    // Image counter
    updateImageCounter();

    // Listing info
    document.getElementById('categoryBadge').textContent = capitalizeFirst(listing.category);
    document.getElementById('listingTitle').textContent = listing.title;
    document.getElementById('listingPrice').textContent = window.app.ui.formatPrice(listing.price);
    document.getElementById('listingLocation').textContent = listing.location;
    document.getElementById('listingDate').textContent = `Posted ${window.app.ui.formatRelativeTime(listing.createdAt)}`;
    document.getElementById('listingViews').textContent = `${listing.views} views`;
    document.getElementById('listingCondition').textContent = capitalizeFirst(listing.condition.replace('-', ' '));

    // Seller info
    document.getElementById('sellerName').textContent = listing.seller.name;
    document.getElementById('sellerJoined').textContent = window.app.ui.formatDate(listing.seller.joinedAt);
    document.getElementById('sellerListings').textContent = listing.seller.listingsCount;
    document.getElementById('sellerRating').textContent = listing.seller.rating ? `${listing.seller.rating} ★` : 'New';
    document.getElementById('sellerResponse').textContent = listing.seller.responseTime;
    document.getElementById('viewProfileLink').href = `profile.html?id=${listing.seller.id}`;

    // Description
    document.getElementById('listingDescription').innerHTML = `<p>${escapeHtml(listing.description).replace(/\n/g, '</p><p>')}</p>`;

    // Details
    document.getElementById('detailCategory').textContent = capitalizeFirst(listing.category);
    document.getElementById('detailCondition').textContent = capitalizeFirst(listing.condition.replace('-', ' '));
    document.getElementById('detailBrand').textContent = listing.brand || 'Not specified';
    document.getElementById('detailModel').textContent = listing.model || 'Not specified';

    // Location
    document.getElementById('locationText').textContent = `Approximate location: ${listing.location}`;

    // Share URL
    document.getElementById('shareUrl').value = window.location.href;
}

/**
 * Render thumbnails
 */
function renderThumbnails(images) {
    const container = document.getElementById('galleryThumbnails');
    if (!container) return;

    container.innerHTML = images.map((image, index) => `
        <button type="button" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${image}" alt="Thumbnail ${index + 1}">
        </button>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            currentImageIndex = Number(thumb.dataset.index);
            updateGallery();
        });
    });
}

/**
 * Initialize gallery navigation
 */
function initGallery() {
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentListing && currentListing.images.length > 0) {
                currentImageIndex = (currentImageIndex - 1 + currentListing.images.length) % currentListing.images.length;
                updateGallery();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentListing && currentListing.images.length > 0) {
                currentImageIndex = (currentImageIndex + 1) % currentListing.images.length;
                updateGallery();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevBtn?.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn?.click();
        }
    });
}

/**
 * Update gallery display
 */
function updateGallery() {
    if (!currentListing) return;

    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = currentListing.images[currentImageIndex];
    }

    // Update thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });

    updateImageCounter();
}

/**
 * Update image counter
 */
function updateImageCounter() {
    const counter = document.getElementById('imageCounter');
    if (counter && currentListing) {
        counter.textContent = `${currentImageIndex + 1} / ${currentListing.images.length}`;
    }
}

/**
 * Initialize contact modal
 */
function initContactModal() {
    const modal = document.getElementById('contactModal');
    const openBtn = document.getElementById('contactSellerBtn');
    const closeBtn = document.getElementById('modalClose');
    const backdrop = document.getElementById('modalBackdrop');
    const cancelBtn = document.getElementById('cancelContactBtn');
    const form = document.getElementById('contactForm');
    const authRequired = document.getElementById('authRequired');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            if (window.app.auth.isLoggedIn()) {
                form?.classList.remove('hidden');
                authRequired?.classList.add('hidden');
            } else {
                form?.classList.add('hidden');
                authRequired?.classList.remove('hidden');
            }
            modal.classList.add('active');
        });
    }

    const closeModal = () => {
        modal?.classList.remove('active');
    };

    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const subject = document.getElementById('messageSubject').value;
            const message = document.getElementById('messageContent').value;

            try {
                // In Phase 4, this will send the actual message
                console.log('Sending message:', { subject, message });
                window.app.ui.showAlert('Message sent successfully!', 'success');
                closeModal();
                form.reset();
            } catch (error) {
                window.app.ui.showAlert('Failed to send message. Please try again.', 'error');
            }
        });
    }
}

/**
 * Initialize share modal
 */
function initShareModal() {
    const modal = document.getElementById('shareModal');
    const openBtn = document.getElementById('shareBtn');
    const closeBtn = document.getElementById('shareModalClose');
    const backdrop = document.getElementById('shareModalBackdrop');
    const copyBtn = document.getElementById('copyLinkBtn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            updateShareLinks();
        });
    }

    const closeModal = () => {
        modal?.classList.remove('active');
    };

    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                window.app.ui.showAlert('Link copied to clipboard!', 'success');
            } catch (error) {
                // Fallback
                const input = document.getElementById('shareUrl');
                input?.select();
                document.execCommand('copy');
                window.app.ui.showAlert('Link copied!', 'success');
            }
        });
    }
}

/**
 * Update share links
 */
function updateShareLinks() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentListing?.title || 'Check out this listing');

    const twitterLink = document.getElementById('shareTwitter');
    const facebookLink = document.getElementById('shareFacebook');
    const emailLink = document.getElementById('shareEmail');

    if (twitterLink) {
        twitterLink.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    }

    if (facebookLink) {
        facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (emailLink) {
        emailLink.href = `mailto:?subject=${title}&body=Check out this listing: ${url}`;
    }
}

/**
 * Check if listing is saved
 */
function checkSavedStatus() {
    const savedItems = window.app.storage.get('savedItems', []);
    const isSaved = savedItems.includes(currentListing?.id);
    
    updateSaveButton(isSaved);

    // Add save button handler
    const saveBtn = document.getElementById('saveListingBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', toggleSave);
    }
}

/**
 * Toggle save status
 */
function toggleSave() {
    if (!currentListing) return;

    let savedItems = window.app.storage.get('savedItems', []);
    const isSaved = savedItems.includes(currentListing.id);

    if (isSaved) {
        savedItems = savedItems.filter(id => id !== currentListing.id);
    } else {
        savedItems.push(currentListing.id);
    }

    window.app.storage.set('savedItems', savedItems);
    updateSaveButton(!isSaved);
}

/**
 * Update save button state
 */
function updateSaveButton(isSaved) {
    const icon = document.getElementById('saveIcon');
    const text = document.getElementById('saveText');

    if (icon) icon.textContent = isSaved ? '♥' : '♡';
    if (text) text.textContent = isSaved ? 'Saved' : 'Save';
}

/**
 * Load similar listings
 */
async function loadSimilarListings(category) {
    const container = document.getElementById('similarListings');
    if (!container) return;

    try {
        // In Phase 1, use mock data
        const listings = getMockSimilarListings(category);

        container.innerHTML = listings.map(listing => `
            <article class="listing-card">
                <a href="listing-detail.html?id=${listing.id}">
                    <div class="listing-image">
                        <img src="${listing.image}" alt="${escapeHtml(listing.title)}">
                    </div>
                    <div class="listing-info">
                        <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
                        <p class="listing-price">${window.app.ui.formatPrice(listing.price)}</p>
                        <p class="listing-location">📍 ${escapeHtml(listing.location)}</p>
                    </div>
                </a>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading similar listings:', error);
    }
}

/**
 * Show not found state
 */
function showNotFound() {
    const main = document.querySelector('.listing-detail-main .container');
    if (main) {
        main.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">Listing Not Found</h3>
                <p class="empty-description">This listing may have been removed or doesn't exist.</p>
                <a href="listings.html" class="btn btn-primary">Browse Listings</a>
            </div>
        `;
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
function getMockListing(id) {
    const listings = {
        1: {
            id: 1,
            title: 'iPhone 14 Pro Max - Excellent Condition',
            price: 899,
            category: 'electronics',
            condition: 'like-new',
            location: 'Downtown Seattle',
            description: `Selling my iPhone 14 Pro Max 256GB in Deep Purple color. Phone is in excellent condition with no scratches or dents.

Includes:
- Original box
- Lightning cable
- Screen protector (already applied)

Battery health is at 97%. Always kept in a case.

Selling because I'm upgrading to the newer model. Price is firm - no lowballers please.`,
            brand: 'Apple',
            model: 'iPhone 14 Pro Max',
            images: [
                'https://picsum.photos/seed/phone1/800/600',
                'https://picsum.photos/seed/phone2/800/600',
                'https://picsum.photos/seed/phone3/800/600',
                'https://picsum.photos/seed/phone4/800/600',
            ],
            views: 234,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            seller: {
                id: 101,
                name: 'John D.',
                joinedAt: '2023-03-15',
                listingsCount: 12,
                rating: 4.8,
                responseTime: '< 1 hour',
            },
        },
    };

    return listings[id] || null;
}

function getMockSimilarListings(category) {
    return [
        {
            id: 4,
            title: 'MacBook Pro 16" M2',
            price: 1899,
            location: 'Ballard',
            image: 'https://picsum.photos/seed/laptop1/400/300',
        },
        {
            id: 7,
            title: 'PlayStation 5 + 3 Games',
            price: 450,
            location: 'Redmond',
            image: 'https://picsum.photos/seed/ps51/400/300',
        },
        {
            id: 11,
            title: 'Samsung Galaxy S23',
            price: 699,
            location: 'Capitol Hill',
            image: 'https://picsum.photos/seed/samsung1/400/300',
        },
        {
            id: 12,
            title: 'iPad Pro 12.9"',
            price: 899,
            location: 'Bellevue',
            image: 'https://picsum.photos/seed/ipad1/400/300',
        },
    ];
}
