// Dark Mode Toggle
class DarkMode {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        this.createToggleButton();
        this.observeSystemTheme();
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button icon
        this.updateToggleIcon();
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Add transition effect
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    createToggleButton() {
        // Remove existing toggle if any
        const existingToggle = document.querySelector('.theme-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.innerHTML = this.getToggleIcon();
        
        // Add click event
        toggle.addEventListener('click', () => {
            this.toggleTheme();
            this.animateToggle(toggle);
        });

        // Add to page
        document.body.appendChild(toggle);
    }

    getToggleIcon() {
        return this.theme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }

    updateToggleIcon() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.getToggleIcon();
        }
    }

    animateToggle(toggle) {
        toggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            toggle.style.transform = 'scale(1)';
        }, 150);
    }

    observeSystemTheme() {
        // Check system preference
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // If no theme is set, use system preference
            if (!localStorage.getItem('theme')) {
                this.setTheme(mediaQuery.matches ? 'dark' : 'light');
            }

            // Listen for system theme changes
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.theme;
    }

    // Public method to set theme programmatically
    setThemeProgrammatically(theme) {
        this.setTheme(theme);
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.darkMode = new DarkMode();
});

// Add keyboard shortcut (Ctrl/Cmd + Shift + D)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (window.darkMode) {
            window.darkMode.toggleTheme();
        }
    }
});

// Add smooth transitions for theme changes
const style = document.createElement('style');
style.textContent = `
    * {
        transition: background-color 0.3s ease, 
                   color 0.3s ease, 
                   border-color 0.3s ease,
                   box-shadow 0.3s ease;
    }
    
    .theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow);
        color: var(--text-color);
    }
    
    .theme-toggle:hover {
        transform: scale(1.1);
        box-shadow: var(--shadow-lg);
    }
    
    .theme-toggle:active {
        transform: scale(0.95);
    }
    
    .theme-toggle i {
        font-size: 1.2rem;
        transition: transform 0.3s ease;
    }
    
    .theme-toggle:hover i {
        transform: rotate(180deg);
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
        .theme-toggle {
            top: 15px;
            right: 15px;
            width: 45px;
            height: 45px;
        }
        
        .theme-toggle i {
            font-size: 1rem;
        }
    }
`;
document.head.appendChild(style);
