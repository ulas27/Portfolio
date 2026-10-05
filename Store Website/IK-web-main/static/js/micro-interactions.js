// Micro-interactions JavaScript
class MicroInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.initButtonInteractions();
        this.initFormInteractions();
        this.initPopupInteractions();
        this.initLoadingStates();
    }

    // Button interactions
    initButtonInteractions() {
        // Add ripple effect to buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });

        // Add loading state to form buttons
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    this.setButtonLoading(submitBtn, true);
                }
            });
        });
    }

    // Form interactions
    initFormInteractions() {
        // Floating labels
        document.querySelectorAll('.form-group').forEach(group => {
            const input = group.querySelector('.form-control');
            const label = group.querySelector('.form-label');
            
            if (input && label) {
                input.addEventListener('focus', () => {
                    label.classList.add('active');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        label.classList.remove('active');
                    }
                });
                
                // Check if input has value on load
                if (input.value) {
                    label.classList.add('active');
                }
            }
        });

        // Form validation feedback
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }

    // Popup interactions
    initPopupInteractions() {
        // Enhanced popup animations
        this.enhancePopupAnimations();
    }

    // Loading states
    initLoadingStates() {
        // Add loading states to async operations
        this.observeAsyncOperations();
    }

    // Create ripple effect
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Set button loading state
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    // Validate input
    validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        let isValid = true;
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }
        
        // Required field validation
        if (input.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Update input classes
        input.classList.remove('is-valid', 'is-invalid');
        input.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        // Add shake animation for invalid inputs
        if (!isValid) {
            input.classList.add('form-error');
            setTimeout(() => {
                input.classList.remove('form-error');
            }, 500);
        }
    }

    // Enhance popup animations
    enhancePopupAnimations() {
        // Add entrance animation to popups
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('cart-success-popup')) {
                        this.animatePopupEntrance(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Animate popup entrance
    animatePopupEntrance(popup) {
        // Add entrance animation
        popup.style.transform = 'translateX(400px) scale(0.8)';
        popup.style.opacity = '0';
        
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });
    }

    // Observe async operations
    observeAsyncOperations() {
        // Add loading states to fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            this.showPageLoading();
            
            try {
                const response = await originalFetch(...args);
                this.hidePageLoading();
                return response;
            } catch (error) {
                this.hidePageLoading();
                throw error;
            }
        };
    }

    // Show page loading
    showPageLoading() {
        let loadingOverlay = document.querySelector('.page-loading');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'page-loading';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>Yükleniyor...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }
        
        loadingOverlay.classList.add('show');
    }

    // Hide page loading
    hidePageLoading() {
        const loadingOverlay = document.querySelector('.page-loading');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
        }
    }

    // Add success feedback
    showSuccess(message, element) {
        const success = document.createElement('div');
        success.className = 'success-feedback';
        success.innerHTML = `
            <div class="success-checkmark"></div>
            <span>${message}</span>
        `;
        
        element.appendChild(success);
        
        setTimeout(() => {
            success.remove();
        }, 3000);
    }

    // Add error feedback
    showError(message, element) {
        const error = document.createElement('div');
        error.className = 'error-feedback';
        error.innerHTML = `
            <div class="error-x"></div>
            <span>${message}</span>
        `;
        
        element.appendChild(error);
        
        setTimeout(() => {
            error.remove();
        }, 3000);
    }
}

// Initialize micro-interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MicroInteractions();
});

// Add ripple effect CSS
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.success-feedback,
.error-feedback {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
    animation: feedbackFadeIn 0.3s ease-in-out;
}

@keyframes feedbackFadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);
