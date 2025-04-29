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
    
    // Special handling for auth page transitions (login/signup)
    const isAuthPageTransition = (
        (destination.includes('/login.html') && window.location.href.includes('/signup.html')) ||
        (destination.includes('/signup.html') && window.location.href.includes('/login.html'))
    );
    
    if (isAuthPageTransition) {
        // More dramatic transition for auth pages
        handleAuthPageTransition(type, destination);
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

// Special handling for auth page transitions (login/signup)
function handleAuthPageTransition(type, destination) {
    // Prevent loader from showing for auth page transitions
    if (window.PortMySim && window.PortMySim.loader) {
        // Store the original show method
        if (!window.PortMySim.loader._originalShow) {
            window.PortMySim.loader._originalShow = window.PortMySim.loader.show;
        }
        // Override the show method temporarily to prevent loader from appearing
        window.PortMySim.loader.show = function() {
            console.log('Loader display suppressed for auth transition');
        };
        
        // Restore original method after transition
        setTimeout(() => {
            if (window.PortMySim && window.PortMySim.loader && window.PortMySim.loader._originalShow) {
                window.PortMySim.loader.show = window.PortMySim.loader._originalShow;
            }
        }, 2500);
    }
    
    // Create transition container if it doesn't exist
    let transitionContainer = document.querySelector('.page-transition-container');
    if (!transitionContainer) {
        transitionContainer = document.createElement('div');
        transitionContainer.className = 'page-transition-container';
        document.body.appendChild(transitionContainer);
        
        // Create transition layers for multi-layer effect
        for (let i = 0; i < 3; i++) {
            const layer = document.createElement('div');
            layer.className = 'transition-layer';
            transitionContainer.appendChild(layer);
        }
        
        // Create main overlay
        const overlay = document.createElement('div');
        overlay.className = 'transition-overlay';
        transitionContainer.appendChild(overlay);
    }
    
    // First animate out the current content
    const formContainer = document.querySelector('.auth-form-container');
    const imageContainer = document.querySelector('.auth-image');
    
    if (formContainer) {
        formContainer.classList.add('animate-out');
    }
    
    if (imageContainer) {
        imageContainer.classList.add('animate-out');
    }
    
    // After content fades out, start the page transition
    setTimeout(() => {
        // Activate transition layers
        const layers = document.querySelectorAll('.transition-layer');
        const overlay = document.querySelector('.transition-overlay');
        
        layers.forEach(layer => {
            layer.classList.add('animate');
        });
        
        if (overlay) {
            overlay.classList.add('animate');
        }
        
        // Remove the body overflow hidden that might be set by loader
        document.body.style.overflow = '';
        
        // Navigate to destination after transition is underway
        setTimeout(() => {
            try {
                window.location.href = destination;
            } catch (e) {
                console.error('Auth navigation error:', e);
                document.location.href = destination;
            }
        }, 500);
    }, 300);
    
    // Set a fallback timeout in case the navigation fails
    setTimeout(() => {
        if (window.location.href !== destination) {
            document.location.href = destination;
        }
    }, 2000);
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
                // Add in-view class to element
                entry.target.classList.add('in-view');
                
                // Enhanced animation for timeline cards and requirement cards
                if (entry.target.classList.contains('timeline-item') || 
                    entry.target.classList.contains('requirement-card')) {
                    // Add more dynamic animation based on position
                    const delay = parseFloat(window.getComputedStyle(entry.target).transitionDelay || '0s');
                    
                    // Staggered entrance for child elements
                    const animatableChildren = entry.target.querySelectorAll('h3, p, .timeline-features, .requirement-icon');
                    animatableChildren.forEach((child, index) => {
                        child.style.transitionDelay = `${delay + (index * 0.1)}s`;
                        child.style.opacity = '0';
                        child.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            child.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, 50);
                    });
                    
                    // Special animation for timeline-date
                    const timelineDate = entry.target.querySelector('.timeline-date');
                    if (timelineDate) {
                        // Set initial state
                        timelineDate.style.opacity = '0';
                        timelineDate.style.transform = 'translateY(-20px) scale(0.8)';
                        
                        // Animate with a slight delay
                        setTimeout(() => {
                            timelineDate.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            timelineDate.style.opacity = '1';
                            timelineDate.style.transform = 'translateY(0) scale(1)';
                        }, delay * 1000 + 300);
                    }
                }
                
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15, // Increased threshold for better timing
        rootMargin: '0px 0px -100px 0px' // Adjusted to trigger earlier
    });
    
    scrollElements.forEach(element => {
        scrollObserver.observe(element);
    });
    
    // Handle hover effects for cards more dynamically
    const cards = document.querySelectorAll('.timeline-item, .requirement-card');
    cards.forEach(card => {
        // Add ripple effect to cards on hover
        card.addEventListener('mouseenter', function(e) {
            // Create ripple element if it doesn't exist
            if (!this.querySelector('.ripple-hover')) {
                const ripple = document.createElement('div');
                ripple.classList.add('ripple-hover');
                this.appendChild(ripple);
            }
            
            const ripple = this.querySelector('.ripple-hover');
            const rect = this.getBoundingClientRect();
            
            // Calculate position relative to card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set ripple position and animate
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.opacity = '1';
            ripple.style.transform = 'scale(1.5)';
            
            // Reset after animation
            setTimeout(() => {
                ripple.style.opacity = '0';
                ripple.style.transform = 'scale(0)';
            }, 600);
            
            // Enhance timeline-date animation on hover
            const timelineDate = this.querySelector('.timeline-date');
            if (timelineDate) {
                // Add subtle bounce effect
                timelineDate.style.animation = 'none';
                setTimeout(() => {
                    timelineDate.style.animation = 'timelineDatePulse 2s infinite';
                }, 10);
            }
        });
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