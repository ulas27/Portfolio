document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initAlerts();
    initCart();
    initQuantityInputs();
    initImageGallery();
    initLazyLoading();
    initProductCards();

    // Auto-hide flash messages that come from the server
    setTimeout(() => {
        document.querySelectorAll('.flash-messages .alert').forEach(alert => {
            hideAlert(alert);
        });
    }, 5000);
    
    // Initialize accessibility features
    initAccessibility();
});

// ============================================================================
// ACCESSIBILITY FEATURES
// ============================================================================

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    // Focus management for modals and dropdowns
    initFocusManagement();
    
    // Keyboard navigation improvements
    initKeyboardNavigation();
    
    // Screen reader announcements
    initScreenReaderAnnouncements();
}

/**
 * Initialize focus management
 */
function initFocusManagement() {
    // Focus trap for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal:not([style*="display: none"])');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        }
    });
}

/**
 * Initialize keyboard navigation
 */
function initKeyboardNavigation() {
    // Improve dropdown navigation
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-content');
        
        if (trigger && menu) {
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    menu.setAttribute('aria-expanded', menu.style.display === 'block');
                }
            });
        }
    });
}

/**
 * Initialize screen reader announcements
 */
function initScreenReaderAnnouncements() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    `;
    document.body.appendChild(liveRegion);
    
    // Global function for announcements
    window.announceToScreenReader = (message) => {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    };
}

// ============================================================================
// CORE UTILITIES
// ============================================================================

/**
 * A helper function to make fetch requests, handling CSRF, loading states, and errors.
 * @param {string} url - The URL to fetch.
 * @param {FormData} formData - The data to send.
 * @returns {Promise<object>} - The JSON response from the server.
 */
async function fetchJson(url, formData) {
    showLoading();
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch Error:', error);
        showAlert('error', 'Bir ağ hatası oluştu. Lütfen tekrar deneyin.');
        // Return a consistent error structure
        return { success: false, message: 'Ağ hatası.' };
    } finally {
        hideLoading();
    }
}

function showLoading() {
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

function showAlert(type, message) {
    const alertsContainer = document.querySelector('.alerts-container') || createAlertsContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<span>${message}</span><button class="alert-close">&times;</button>`;
    
    alertsContainer.prepend(alert);
    
    alert.querySelector('.alert-close').addEventListener('click', () => hideAlert(alert));

    setTimeout(() => hideAlert(alert), 5000);
}

function hideAlert(alert) {
    if (alert && alert.parentElement) {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 300);
    }
}

function createAlertsContainer() {
    const container = document.createElement('div');
    container.className = 'alerts-container';
    document.body.appendChild(container);
    return container;
}


// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

function initAlerts() {
    document.querySelectorAll('.alert .alert-close').forEach(button => {
        button.addEventListener('click', () => hideAlert(button.parentElement));
    });
}

function initCart() {
    updateCartCount(); // Initial count on page load

    // Add to cart (delegated event listener for dynamically added products)
    document.body.addEventListener('click', function(e) {
        if (e.target.matches('.add-to-cart-btn')) {
            const productId = e.target.dataset.productId;
            const quantityInput = document.querySelector(`#quantity-${productId}, .product-quantity-input`);
            const quantity = quantityInput ? quantityInput.value : 1;
            addToCart(productId, quantity);
        }
    });

    // For cart page interactions
    const cartContainer = document.querySelector('.cart-page-container');
    if (cartContainer) {
        cartContainer.addEventListener('click', e => {
            if (e.target.matches('.cart-remove-btn')) {
                const itemId = e.target.dataset.itemId;
                removeFromCart(itemId);
            }
        });

        cartContainer.addEventListener('change', e => {
            if (e.target.matches('.cart-quantity-input')) {
                const itemId = e.target.dataset.itemId;
                const quantity = e.target.value;
                updateCartItem(itemId, quantity);
            }
        });
    }
}

function initQuantityInputs() {
    document.body.addEventListener('click', e => {
        const button = e.target.closest('.quantity-btn');
        if (!button) return;

        const inputWrapper = button.closest('.quantity-input');
        const input = inputWrapper.querySelector('input[type="number"]');
        const step = parseInt(input.step) || 1;
        let currentValue = parseInt(input.value) || 1;

        if (button.classList.contains('plus')) {
            const max = parseInt(input.max) || 99;
            if (currentValue < max) {
                input.value = currentValue + step;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } else if (button.classList.contains('minus')) {
            const min = parseInt(input.min) || 1;
            if (currentValue > min) {
                input.value = currentValue - step;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });
}

function initImageGallery() {
    const mainImage = document.querySelector('.product-gallery-main img');
    const thumbnails = document.querySelector('.product-gallery-thumbnails');
    if (!mainImage || !thumbnails) return;

    thumbnails.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            mainImage.src = e.target.dataset.fullsize || e.target.src;
            
            // Update active state
            thumbnails.querySelectorAll('img').forEach(img => img.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
}

function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    obs.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => observer.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ============================================================================
// DROPDOWN MENU FUNCTIONS
// ============================================================================

// Improve dropdown menu behavior - Click to toggle with auto-close
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    let autoCloseTimeout;
    
    // Function to close all dropdowns
    function closeAllDropdowns() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        clearTimeout(autoCloseTimeout);
    }
    
    // Function to close dropdown with transition
    function closeDropdownWithTransition(dropdown) {
        dropdown.classList.remove('active');
        // Don't set display: none, let CSS handle it
    }
    
    dropdowns.forEach(dropdown => {
        const navLink = dropdown.querySelector('.nav-link');
        
        navLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear any existing timeout
            clearTimeout(autoCloseTimeout);
            
            // Close other dropdowns
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
            
            // Set auto-close timeout (3 seconds)
            if (dropdown.classList.contains('active')) {
                autoCloseTimeout = setTimeout(() => {
                    closeDropdownWithTransition(dropdown);
                }, 3000);
            }
        });
        
        // Close dropdown when clicking on a dropdown item
        const dropdownItems = dropdown.querySelectorAll('.dropdown-content a');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                closeDropdownWithTransition(dropdown);
                clearTimeout(autoCloseTimeout);
            });
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                if (dropdown.classList.contains('active')) {
                    closeDropdownWithTransition(dropdown);
                }
            });
        }
    });
    
    // Close dropdown when scrolling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            dropdowns.forEach(dropdown => {
                if (dropdown.classList.contains('active')) {
                    closeDropdownWithTransition(dropdown);
                }
            });
        }, 100); // Small delay to avoid closing too frequently
    });
});

// ============================================================================
// CART API FUNCTIONS
// ============================================================================

async function updateCartCount() {
    try {
        const response = await fetch('/cart/api/count');
        const data = await response.json();
        const count = data.count || 0;
        
        // Update cart count elements
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.setAttribute('data-count', count);
            el.style.display = count > 0 ? 'flex' : 'none';
        });
        
        // Update cart count badges
        document.querySelectorAll('.cart-count-badge').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    } catch (error) {
        console.error('Error fetching cart count:', error);
    }
}

async function addToCart(productId, quantity) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', quantity);

    const data = await fetchJson('/cart/add', formData);

    if (data.success) {
        showCartSuccessPopup();
        updateCartCount();
    }
}

// Sepete ekleme başarı popup'ı
function showCartSuccessPopup() {
    // Mevcut popup'ları temizle
    const existingPopup = document.querySelector('.cart-success-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Popup oluştur
    const popup = document.createElement('div');
    popup.className = 'cart-success-popup';
    popup.innerHTML = `
        <div class="cart-success-content">
            <div class="cart-success-icon">
                ✓
            </div>
            <div class="cart-success-text">
                <h4>Ürün Sepete Eklendi!</h4>
                <p>Ürün başarıyla sepetinize eklendi.</p>
            </div>
            <button class="cart-success-close" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;

    // Body'ye ekle
    document.body.appendChild(popup);

    // Animasyon için timeout
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    // 3 saniye sonra otomatik kapat
    setTimeout(() => {
        if (popup.parentElement) {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentElement) {
                    popup.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Ürün kartları için tıklama olayları
function initProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Sepete ekle butonuna tıklanmışsa, normal işlemi yap
            if (e.target.closest('.add-to-cart-btn') || e.target.closest('button')) {
                return;
            }
            
            // Ürün detay sayfasına git
            const productLink = this.querySelector('.product-name a');
            if (productLink) {
                window.location.href = productLink.href;
            }
        });
    });
}

async function updateCartItem(itemId, quantity) {
    const formData = new FormData();
    formData.append('item_id', itemId);
    formData.append('quantity', quantity);

    const data = await fetchJson('/cart/update', formData);

    if (data.success) {
        // Announce to screen readers
        if (window.announceToScreenReader) {
            window.announceToScreenReader(`Sepet güncellendi. Yeni miktar: ${quantity}`);
        }
        // Reload the page to ensure the cart is fully updated.
        // This is simpler and more reliable than manual DOM manipulation.
        window.location.reload();
    }
}

async function removeFromCart(itemId) {
    if (!confirm('Bu ürünü sepetten kaldırmak istediğinizden emin misiniz?')) {
        return;
    }

    const formData = new FormData();
    formData.append('item_id', itemId);

    const data = await fetchJson('/cart/remove', formData);

    if (data.success) {
        // Announce to screen readers
        if (window.announceToScreenReader) {
            window.announceToScreenReader('Ürün sepetten kaldırıldı');
        }
        // Reload for simplicity and reliability
        window.location.reload();
    }
}

// View Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productsGrid = document.querySelector('.products-grid');
    
    if (viewButtons.length > 0 && productsGrid) {
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                viewButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get view type
                const viewType = this.getAttribute('data-view');
                
                // Toggle grid/list view
                if (viewType === 'list') {
                    productsGrid.classList.add('list-view');
                } else {
                    productsGrid.classList.remove('list-view');
                }
            });
        });
    }

    // Sorting Functionality
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const currentUrl = new URL(window.location);
            currentUrl.searchParams.set('sort', sortValue);
            window.location.href = currentUrl.toString();
        });
    }

    // Filter Functionality
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    
    // Filter Group Toggle
    const filterGroups = document.querySelectorAll('.filter-group');
    filterGroups.forEach(group => {
        const header = group.querySelector('h4');
        if (header) {
            header.addEventListener('click', function() {
                group.classList.toggle('expanded');
            });
        }
    });

    // Category filters
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            applyFilters();
        });
    });

    // Price range filters
    if (priceMin && priceMax) {
        priceMin.addEventListener('input', function() {
            const value = parseInt(this.value);
            const maxValue = parseInt(priceMax.value);
            if (value > maxValue) {
                this.value = maxValue;
            }
            document.getElementById('min-price').textContent = '₺' + this.value;
        });
        
        priceMax.addEventListener('input', function() {
            const value = parseInt(this.value);
            const minValue = parseInt(priceMin.value);
            if (value < minValue) {
                this.value = minValue;
            }
            document.getElementById('max-price').textContent = '₺' + this.value;
        });
        
        // Apply filters when both values are set
        [priceMin, priceMax].forEach(input => {
            input.addEventListener('change', function() {
                applyFilters();
            });
        });
    }

    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Uncheck all checkboxes
            filterCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Reset price range
            if (priceMin) priceMin.value = 0;
            if (priceMax) priceMax.value = 50000;
            document.getElementById('min-price').textContent = '₺0';
            document.getElementById('max-price').textContent = '₺50,000';
            
            // Reload page to clear filters
            window.location.href = window.location.pathname;
        });
    }

    function applyFilters() {
        const currentUrl = new URL(window.location);
        
        // Get selected categories
        const selectedCategories = Array.from(filterCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        // Update URL parameters
        if (selectedCategories.length > 0) {
            currentUrl.searchParams.set('category', selectedCategories.join(','));
        } else {
            currentUrl.searchParams.delete('category');
        }
        
        if (priceMin && priceMax) {
            currentUrl.searchParams.set('min_price', priceMin.value);
            currentUrl.searchParams.set('max_price', priceMax.value);
        }
        
        // Reload page with new filters
        window.location.href = currentUrl.toString();
    }
});