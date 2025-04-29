// Page Transitions
document.addEventListener('DOMContentLoaded', () => {
    // Create page transition elements
    createPageTransitions();
    
    // Add page-loaded class to body after loading
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.add('page-loaded');
            // Initialize content transitions
            initContentTransitions();
            // Initialize scroll animations
            initScrollAnimations();
        }, 1000); // Match with loader timing
    });
    
    // Add transitions for page navigation
    document.addEventListener('click', (e) => {
        // Check if clicked element is a link that navigates to another page
        const link = e.target.closest('a');
        if (link && link.href && 
            !link.href.startsWith('#') && 
            !link.href.startsWith('javascript') && 
            !link.target && 
            !link.hasAttribute('data-no-transition') &&
            link.hostname === window.location.hostname) { // Only for same-domain links
            
            // Skip primary buttons since they're handled in loader.js
            const isPrimaryButton = link.classList.contains('btn-primary') || 
                                  (link.classList.contains('hero-btn') && link.classList.contains('primary'));
            
            if (isPrimaryButton) {
                return; // Let loader.js handle these buttons
            }
            
            // Prevent default navigation
            e.preventDefault();
            
            // Get the transition type from data attribute or use default
            const transitionType = link.getAttribute('data-transition') || 'fade';
            
            // Start page transition
            startPageTransition(transitionType, link.href);
        }
    });
});

// Create page transition elements
function createPageTransitions() {
    // Create fade transition element
    const fadeTransition = document.createElement('div');
    fadeTransition.className = 'page-transition page-transition-fade';
    document.body.appendChild(fadeTransition);
    
    // Create slide transition element
    const slideTransition = document.createElement('div');
    slideTransition.className = 'page-transition page-transition-slide';
    document.body.appendChild(slideTransition);
    
    // Create zoom transition element
    const zoomTransition = document.createElement('div');
    zoomTransition.className = 'page-transition page-transition-zoom';
    document.body.appendChild(zoomTransition);
}

// Start page transition
function startPageTransition(type = 'fade', destination) {
    // Get the transition element
    const transitionElement = document.querySelector(`.page-transition-${type}`);
    if (!transitionElement) {
        // If transition element doesn't exist, just navigate directly
        window.location.href = destination;
        return;
    }
    
    // Show loader if available
    if (window.PortMySim && window.PortMySim.loader) {
        window.PortMySim.loader.show();
    }
    
    // Activate transition
    transitionElement.classList.add('active');
    
    // Handle navigation with a timeout
    setTimeout(() => {
        try {
            window.location.href = destination;
        } catch (e) {
            console.error('Navigation error:', e);
            // Fallback direct navigation
            document.location.href = destination;
        }
    }, 600); // Match this with the transition duration
    
    // Set a fallback timeout in case the navigation fails
    setTimeout(() => {
        if (window.location.href !== destination) {
            document.location.href = destination;
        }
    }, 1500);
}

// Initialize content transitions
function initContentTransitions() {
    // Find all elements with content-transition class
    const transitionElements = document.querySelectorAll('.content-transition');
    
    // Set up Intersection Observer to trigger animations when elements come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class based on data attribute
                const element = entry.target;
                const animationType = element.getAttribute('data-animation') || 'fade-in';
                const delay = element.getAttribute('data-delay') || '0s';
                
                // Set delay as CSS variable
                element.style.setProperty('--delay', delay);
                
                // Add animation class
                element.classList.add(animationType);
                
                // Force immediate visibility for networks-grid and its children
                if (element.classList.contains('networks-grid')) {
                    element.style.opacity = '1';
                    element.style.visibility = 'visible';
                    element.style.transform = 'translateY(0)';
                    
                    // Make sure all network cards are visible
                    const networkCards = element.querySelectorAll('.network-card');
                    networkCards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.visibility = 'visible';
                        card.style.transform = 'translateY(0)';
                    });
                }
                
                // Unobserve after animating
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Adjust based on when you want the animation to trigger
    });
    
    // Observe each element
    transitionElements.forEach(element => {
        observer.observe(element);
    });
    
    // Ensure networks-grid is visible after a short timeout
    setTimeout(() => {
        const networksGrid = document.querySelector('.networks-grid');
        if (networksGrid) {
            networksGrid.style.opacity = '1';
            networksGrid.style.visibility = 'visible';
            networksGrid.style.transform = 'translateY(0)';
            
            const networkCards = networksGrid.querySelectorAll('.network-card');
            networkCards.forEach(card => {
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                card.style.transform = 'translateY(0)';
            });
        }
    }, 1500);
}

// Initialize scroll-based animations for elements with animate-on-scroll class
function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    scrollElements.forEach(element => {
        scrollObserver.observe(element);
    });
    
    // Fallback: make sure all scroll elements are visible after 5 seconds
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll:not(.in-view)').forEach(element => {
            element.classList.add('in-view');
        });
    }, 5000);
}

// Expose transition functions globally
window.PortMySim = window.PortMySim || {};
window.PortMySim.transition = {
    start: startPageTransition
}; 