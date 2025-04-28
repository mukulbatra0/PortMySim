// This file ensures that animations are disabled for the plans page

// Run as soon as possible
(function() {
    // Add a style element to disable animations
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        /* Disable all animations on the feature-value.best elements */
        .feature-value.best,
        .feature-value.best::before,
        .feature-value.best::after {
            animation: none !important;
            box-shadow: none !important;
            transition: background-color 0.3s ease !important;
            border-left: 3px solid var(--primary-color);
            border-right: 3px solid var(--primary-color);
            background-color: rgba(var(--primary-rgb), 0.1);
        }
        
        /* Reset all potentially problematic keyframes */
        @keyframes pulseFade { 0%, 50%, 100% { box-shadow: none !important; } }
        @keyframes pulse-glow { 0%, 50%, 100% { box-shadow: none !important; } }
        @keyframes glow { 0%, 50%, 100% { box-shadow: none !important; } }
        @keyframes pulse { 0%, 50%, 100% { transform: scale(1) !important; } }
    `;
    
    // Insert at the beginning of head to ensure it loads first
    const head = document.head || document.getElementsByTagName('head')[0];
    head.insertBefore(styleEl, head.firstChild);
    
    // Also handle when DOM loads
    document.addEventListener('DOMContentLoaded', function() {
        disableAllBestValueAnimations();
    });
    
    // Re-run regularly to catch any dynamically added elements 
    setInterval(disableAllBestValueAnimations, 1000);
    
    function disableAllBestValueAnimations() {
        // Find all .feature-value.best elements and disable animations
        const elements = document.querySelectorAll('.feature-value.best');
        elements.forEach(function(el) {
            el.style.animation = 'none !important';
            el.style.boxShadow = 'none !important';
            el.style.webkitAnimation = 'none !important';
            el.style.mozAnimation = 'none !important';
            el.style.oAnimation = 'none !important';
            
            // Check for inline style
            const currentStyle = el.getAttribute('style') || '';
            if (!currentStyle.includes('animation: none')) {
                el.setAttribute('style', currentStyle + '; animation: none !important; box-shadow: none !important;');
            }
        });
    }
})(); 