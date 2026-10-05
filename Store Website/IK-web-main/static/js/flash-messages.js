// Flash Messages - Popup System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Flash messages script loaded');
    console.log('Flash messages:', window.flashMessages);
    
    // Check for flash messages and show as popups
    if (window.flashMessages && window.flashMessages.length > 0) {
        console.log('Showing flash popups');
        window.flashMessages.forEach(function(flash) {
            console.log('Showing popup:', flash.category, flash.message);
            showFlashPopup(flash.category, flash.message);
        });
    } else {
        console.log('No flash messages to show');
    }
});

function showFlashPopup(category, message) {
    console.log('Creating popup for:', category, message);
    
    // Create popup container
    const popupContainer = document.getElementById('flash-popup-container');
    console.log('Popup container:', popupContainer);
    
    if (!popupContainer) {
        console.error('Popup container not found!');
        return;
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = `flash-popup flash-popup-${category}`;
    
    // Set popup content
    popup.innerHTML = `
        <div class="flash-popup-content">
            <div class="flash-popup-icon">
                ${getIconForCategory(category)}
            </div>
            <div class="flash-popup-message">
                <strong>${getTitleForCategory(category)}</strong>
                <p>${message}</p>
            </div>
            <button class="flash-popup-close" onclick="closeFlashPopup(this)" aria-label="Kapat">&times;</button>
        </div>
    `;
    
    // Add to container
    popupContainer.appendChild(popup);
    console.log('Popup added to container');
    
    // Show animation
    setTimeout(() => {
        popup.classList.add('show');
        console.log('Popup shown');
    }, 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeFlashPopup(popup.querySelector('.flash-popup-close'));
    }, 5000);
}

function closeFlashPopup(closeBtn) {
    const popup = closeBtn.closest('.flash-popup');
    popup.classList.add('hide');
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 300);
}

function getIconForCategory(category) {
    const icons = {
        'success': '<i class="fas fa-check-circle"></i>',
        'error': '<i class="fas fa-exclamation-circle"></i>',
        'warning': '<i class="fas fa-exclamation-triangle"></i>',
        'info': '<i class="fas fa-info-circle"></i>'
    };
    return icons[category] || icons['info'];
}

function getTitleForCategory(category) {
    const titles = {
        'success': 'Başarılı',
        'error': 'Hata',
        'warning': 'Uyarı',
        'info': 'Bilgi'
    };
    return titles[category] || 'Bilgi';
}
