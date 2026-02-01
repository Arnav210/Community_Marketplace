/**
 * Create Listing Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Require authentication
    if (!window.app.auth.requireAuth()) {
        return;
    }

    initForm();
    initPhotoUpload();
    initTags();
    initCharCount();
    initPriceType();
    checkEditMode();
});

// State
let currentStep = 1;
let formData = {
    photos: [],
    title: '',
    category: '',
    condition: '',
    brand: '',
    model: '',
    description: '',
    tags: [],
    price: null,
    priceType: 'fixed',
    location: '',
    delivery: ['pickup'],
};

/**
 * Initialize form navigation
 */
function initForm() {
    const form = document.getElementById('createListingForm');

    // Next buttons
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = Number(btn.dataset.next);
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });

    // Previous buttons
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = Number(btn.dataset.prev);
            goToStep(prevStep);
        });
    });

    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraft);
    }

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await publishListing();
        });
    }
}

/**
 * Go to a specific step
 */
function goToStep(step) {
    // Update step visibility
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(`step${step}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach(stepEl => {
        const stepNum = Number(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed');
        
        if (stepNum < step) {
            stepEl.classList.add('completed');
        } else if (stepNum === step) {
            stepEl.classList.add('active');
        }
    });

    currentStep = step;

    // If going to review step, update preview
    if (step === 4) {
        updateReviewPreview();
    }

    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Validate current step
 */
function validateStep(step) {
    let isValid = true;

    switch (step) {
        case 1:
            // At least one photo required
            if (formData.photos.length === 0) {
                window.app.ui.showAlert('Please add at least one photo', 'error');
                isValid = false;
            }
            break;

        case 2:
            // Title required
            const title = document.getElementById('title').value.trim();
            if (!title) {
                window.app.ui.showFieldError('title', 'Title is required');
                isValid = false;
            }
            formData.title = title;

            // Category required
            const category = document.getElementById('category').value;
            if (!category) {
                window.app.ui.showFieldError('category', 'Please select a category');
                isValid = false;
            }
            formData.category = category;

            // Condition required
            const condition = document.getElementById('condition').value;
            if (!condition) {
                window.app.ui.showFieldError('condition', 'Please select condition');
                isValid = false;
            }
            formData.condition = condition;

            // Description required
            const description = document.getElementById('description').value.trim();
            if (!description) {
                window.app.ui.showFieldError('description', 'Description is required');
                isValid = false;
            }
            formData.description = description;

            // Optional fields
            formData.brand = document.getElementById('brand').value.trim();
            formData.model = document.getElementById('model').value.trim();
            break;

        case 3:
            // Price required (unless free)
            const priceType = document.querySelector('input[name="priceType"]:checked')?.value || 'fixed';
            formData.priceType = priceType;

            if (priceType !== 'free') {
                const price = document.getElementById('price').value;
                if (!price || Number(price) <= 0) {
                    window.app.ui.showFieldError('price', 'Please enter a valid price');
                    isValid = false;
                }
                formData.price = Number(price);
            } else {
                formData.price = 0;
            }

            // Location required
            const location = document.getElementById('location').value.trim();
            if (!location) {
                window.app.ui.showFieldError('location', 'Location is required');
                isValid = false;
            }
            formData.location = location;

            // Delivery options
            formData.delivery = Array.from(document.querySelectorAll('input[name="delivery"]:checked'))
                .map(cb => cb.value);
            break;
    }

    return isValid;
}

/**
 * Initialize photo upload
 */
function initPhotoUpload() {
    for (let i = 0; i < 8; i++) {
        const input = document.getElementById(`photo${i}`);
        const slot = document.getElementById(`photoSlot${i}`);

        if (input && slot) {
            input.addEventListener('change', (e) => {
                handlePhotoUpload(e, i);
            });

            // Remove button
            const removeBtn = slot.querySelector('.remove-photo-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removePhoto(i);
                });
            }
        }
    }
}

/**
 * Handle photo upload
 */
function handlePhotoUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        window.app.ui.showAlert('Please upload an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        window.app.ui.showAlert('Image must be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const slot = document.getElementById(`photoSlot${index}`);
        const preview = slot.querySelector('.photo-preview');
        const img = preview.querySelector('.preview-image');

        img.src = e.target.result;
        preview.classList.remove('hidden');

        // Store photo data
        formData.photos[index] = {
            file: file,
            dataUrl: e.target.result,
        };
    };

    reader.readAsDataURL(file);
}

/**
 * Remove photo
 */
function removePhoto(index) {
    const slot = document.getElementById(`photoSlot${index}`);
    const preview = slot.querySelector('.photo-preview');
    const input = document.getElementById(`photo${index}`);

    preview.classList.add('hidden');
    input.value = '';
    delete formData.photos[index];

    // Re-index photos array
    formData.photos = formData.photos.filter(Boolean);
}

/**
 * Initialize tags input
 */
function initTags() {
    const input = document.getElementById('tagsInput');
    const container = document.getElementById('tagsContainer');

    if (!input || !container) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input.value.trim());
            input.value = '';
        }
    });

    input.addEventListener('blur', () => {
        if (input.value.trim()) {
            addTag(input.value.trim());
            input.value = '';
        }
    });
}

/**
 * Add a tag
 */
function addTag(tag) {
    if (!tag || formData.tags.includes(tag) || formData.tags.length >= 10) return;

    formData.tags.push(tag);
    renderTags();
}

/**
 * Remove a tag
 */
function removeTag(tag) {
    formData.tags = formData.tags.filter(t => t !== tag);
    renderTags();
}

/**
 * Render tags
 */
function renderTags() {
    const container = document.getElementById('tagsContainer');
    if (!container) return;

    container.innerHTML = formData.tags.map(tag => `
        <span class="tag">
            ${escapeHtml(tag)}
            <span class="tag-remove" onclick="window.removeTag('${escapeHtml(tag)}')">&times;</span>
        </span>
    `).join('');
}

// Make removeTag available globally
window.removeTag = removeTag;

/**
 * Initialize character count
 */
function initCharCount() {
    const fields = [
        { input: 'title', count: 'titleCount', max: 100 },
        { input: 'description', count: 'descriptionCount', max: 2000 },
    ];

    fields.forEach(({ input, count, max }) => {
        const inputEl = document.getElementById(input);
        const countEl = document.getElementById(count);

        if (inputEl && countEl) {
            const updateCount = () => {
                countEl.textContent = inputEl.value.length;
                if (inputEl.value.length > max) {
                    countEl.style.color = 'var(--color-danger)';
                } else {
                    countEl.style.color = '';
                }
            };

            inputEl.addEventListener('input', updateCount);
            updateCount();
        }
    });
}

/**
 * Initialize price type radio buttons
 */
function initPriceType() {
    const priceInput = document.getElementById('price');
    const priceTypeRadios = document.querySelectorAll('input[name="priceType"]');

    priceTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'free') {
                priceInput.value = '';
                priceInput.disabled = true;
            } else {
                priceInput.disabled = false;
            }
        });
    });
}

/**
 * Check if editing existing listing
 */
function checkEditMode() {
    const editId = window.app.urlParams.get('edit');
    if (editId) {
        // Load existing listing data
        // In Phase 4, this will fetch from API
        console.log('Edit mode for listing:', editId);
    }
}

/**
 * Update review preview
 */
function updateReviewPreview() {
    // Preview image
    const previewMainImage = document.getElementById('previewMainImage');
    if (previewMainImage && formData.photos[0]) {
        previewMainImage.src = formData.photos[0].dataUrl;
    }

    // Preview info
    document.getElementById('previewTitle').textContent = formData.title || '--';
    document.getElementById('previewPrice').textContent = formData.priceType === 'free' 
        ? 'Free' 
        : window.app.ui.formatPrice(formData.price || 0);
    document.getElementById('previewCategory').textContent = capitalizeFirst(formData.category || '--');
    document.getElementById('previewCondition').textContent = capitalizeFirst((formData.condition || '--').replace('-', ' '));
    document.getElementById('previewLocation').textContent = formData.location || '--';
    document.getElementById('previewDescription').textContent = window.app.ui.truncateText(formData.description || '--', 200);

    // Checklist
    updateChecklist('checkPhotos', formData.photos.length > 0);
    updateChecklist('checkTitle', formData.title.length >= 10);
    updateChecklist('checkDescription', formData.description.length >= 50);
    updateChecklist('checkPrice', formData.price !== null || formData.priceType === 'free');
    updateChecklist('checkLocation', formData.location.length > 0);
}

/**
 * Update checklist item
 */
function updateChecklist(id, isComplete) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = isComplete ? '✅' : '⬜';
        el.classList.toggle('checked', isComplete);
    }
}

/**
 * Save as draft
 */
function saveDraft() {
    // Collect all form data
    collectFormData();

    // Save to localStorage
    const drafts = window.app.storage.get('listingDrafts', []);
    const draft = {
        id: Date.now(),
        ...formData,
        savedAt: new Date().toISOString(),
    };
    drafts.push(draft);
    window.app.storage.set('listingDrafts', drafts);

    window.app.ui.showAlert('Draft saved successfully!', 'success');
}

/**
 * Collect all form data
 */
function collectFormData() {
    formData.title = document.getElementById('title')?.value.trim() || '';
    formData.category = document.getElementById('category')?.value || '';
    formData.condition = document.getElementById('condition')?.value || '';
    formData.brand = document.getElementById('brand')?.value.trim() || '';
    formData.model = document.getElementById('model')?.value.trim() || '';
    formData.description = document.getElementById('description')?.value.trim() || '';
    formData.price = Number(document.getElementById('price')?.value) || null;
    formData.priceType = document.querySelector('input[name="priceType"]:checked')?.value || 'fixed';
    formData.location = document.getElementById('location')?.value.trim() || '';
    formData.delivery = Array.from(document.querySelectorAll('input[name="delivery"]:checked'))
        .map(cb => cb.value);
}

/**
 * Publish listing
 */
async function publishListing() {
    // Validate final step
    if (!validateStep(4)) return;

    const submitBtn = document.getElementById('publishBtn');
    window.app.ui.setButtonLoading(submitBtn, true);

    try {
        // Collect all form data
        collectFormData();

        // In Phase 1, simulate API call
        // In Phase 4, this will actually post to the API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate success
        console.log('Publishing listing:', formData);

        window.app.ui.showAlert('Listing published successfully!', 'success');
        
        // Redirect to listing detail page
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        window.app.ui.showAlert('Failed to publish listing. Please try again.', 'error');
    } finally {
        window.app.ui.setButtonLoading(submitBtn, false);
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
