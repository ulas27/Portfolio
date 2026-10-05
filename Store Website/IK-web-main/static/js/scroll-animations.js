// Scroll Animations - Intersection Observer API
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // Create intersection observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all scroll animate elements
        this.observeElements();
        
        // Add stagger delays to grid items
        this.addStaggerDelays();
    }

    observeElements() {
        // Observe scroll animate elements
        document.querySelectorAll('.scroll-animate').forEach(el => {
            this.observer.observe(el);
        });
        

        // Observe product cards
        document.querySelectorAll('.products-grid .product-card').forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
            this.observer.observe(el);
        });

        // Observe category cards
        document.querySelectorAll('.categories-grid .category-card').forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
            this.observer.observe(el);
        });

        // Observe FAQ items
        document.querySelectorAll('.faq-grid .faq-item').forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
            this.observer.observe(el);
        });

        // Observe stats
        document.querySelectorAll('.stat-number').forEach(el => {
            this.observer.observe(el);
        });

        // Observe newsletter form
        const newsletterForm = document.querySelector('.newsletter-form-large');
        if (newsletterForm) {
            this.observer.observe(newsletterForm);
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate counters - Fixed values animation
                if (entry.target.classList.contains('stat-number')) {
                    this.animateCounter(entry.target);
                }
            }
        });
    }

    addStaggerDelays() {
        // Add stagger delays to grid items
        const grids = [
            '.products-grid .product-card',
            '.categories-grid .category-card',
            '.faq-grid .faq-item'
        ];

        grids.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                el.style.setProperty('--stagger-delay', index);
            });
        });
    }

    animateCounter(element) {
        // Store the original text (our fixed values)
        const originalText = element.textContent;
        
        // For about page, ensure we have the correct target values
        let target, suffix;
        if (originalText === '5+' || originalText === '2500+' || originalText === '%100') {
            // Correct values, use them as-is
            target = parseInt(originalText.replace(/[^\d]/g, ''));
            suffix = originalText.replace(/[\d]/g, '');
        } else {
            // Fallback to parsed values
            target = parseInt(originalText.replace(/[^\d]/g, '')) || 5;
            suffix = originalText.replace(/[\d]/g, '') || '+';
        }
        
        const duration = 2000;
        const start = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            // Update text with original formatting
            element.textContent = currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Force final value to be exactly our fixed values
                if (element.closest('.stats-grid')) {
                    const grid = element.closest('.stats-grid');
                    const statItems = grid.querySelectorAll('.stat-number');
                    const index = Array.from(statItems).indexOf(element);
                    
                    switch(index) {
                        case 0: element.textContent = '5+'; break;
                        case 1: element.textContent = '2500+'; break;
                        case 2: element.textContent = '%100'; break;
                        default: element.textContent = originalText;
                    }
                } else {
                    element.textContent = originalText;
                }
            }
        };

        requestAnimationFrame(animate);
    }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
});

// Re-initialize on page navigation (for SPA-like behavior)
window.addEventListener('load', () => {
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        if (window.scrollAnimations) {
            window.scrollAnimations.observer.disconnect();
        }
        window.scrollAnimations = new ScrollAnimations();
    }, 100);
});
