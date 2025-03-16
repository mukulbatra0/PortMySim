// Page Transition Handler
const PageTransitions = {
    // DOM elements
    container: null,
    overlay: null,
    layers: [],
    ghostFollower: null,
    initialized: false,
    targetURL: '',
    
    // Initialize the transition elements
    init: function() {
        if (this.initialized) return;
        
        // Create the container for transitions if it doesn't exist
        this.container = document.createElement('div');
        this.container.className = 'page-transition-container';
        document.body.appendChild(this.container);
        
        // Create the main overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'transition-overlay';
        this.container.appendChild(this.overlay);
        
        // Create three transition layers for dynamic effect
        for (let i = 0; i < 3; i++) {
            const layer = document.createElement('div');
            layer.className = 'transition-layer';
            this.container.appendChild(layer);
            this.layers.push(layer);
        }
        
        // Create ghost follower element
        this.ghostFollower = document.createElement('div');
        this.ghostFollower.className = 'ghost-follower';
        document.body.appendChild(this.ghostFollower);
        
        // Track mouse movement
        document.addEventListener('mousemove', this.updateGhostFollower.bind(this));
        
        // Attach click handlers to auth links
        this.attachLinkHandlers();
        
        // Mark as initialized
        this.initialized = true;
        
        // Add animation classes to current page content
        this.animatePageIn();
    },
    
    // Update ghost follower position
    updateGhostFollower: function(e) {
        if (!this.ghostFollower) return;
        
        this.ghostFollower.style.left = e.clientX + 'px';
        this.ghostFollower.style.top = e.clientY + 'px';
    },
    
    // Attach click handlers to authentication links
    attachLinkHandlers: function() {
        // Login and Signup links in the auth buttons section
        const authLinks = document.querySelectorAll('.auth-btns a');
        
        authLinks.forEach(link => {
            // Skip if link already has handler
            if (link.hasAttribute('data-transition-enabled')) return;
            
            link.setAttribute('data-transition-enabled', 'true');
            link.addEventListener('click', (e) => {
                // Only handle login/signup page transitions
                const href = link.getAttribute('href');
                if (href && (href.includes('login.html') || href.includes('signup.html'))) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            });
        });
        
        // "Don't have an account?" and "Already have an account?" links
        const authFooterLinks = document.querySelectorAll('.auth-footer a');
        
        authFooterLinks.forEach(link => {
            // Skip if link already has handler
            if (link.hasAttribute('data-transition-enabled')) return;
            
            link.setAttribute('data-transition-enabled', 'true');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigateTo(href);
            });
        });
    },
    
    // Navigate to new page with transition
    navigateTo: function(url) {
        if (!this.initialized) this.init();
        this.targetURL = url;
        
        // Animate existing content out
        this.animatePageOut();
        
        // Start the transition animation
        this.overlay.classList.add('animate');
        this.layers.forEach(layer => layer.classList.add('animate'));
        
        // Navigate to the new page after animation completes
        setTimeout(() => {
            window.location.href = this.targetURL;
        }, 600); // Half of the total animation time
    },
    
    // Animate page content out before transition
    animatePageOut: function() {
        const formContainer = document.querySelector('.auth-form-container');
        const imagePanel = document.querySelector('.auth-image');
        
        if (formContainer) formContainer.classList.add('animate-out');
        if (imagePanel) imagePanel.classList.add('animate-out');
    },
    
    // Animate page content in after page load
    animatePageIn: function() {
        // Add animate-in class to auth elements
        setTimeout(() => {
            const formContainer = document.querySelector('.auth-form-container');
            const imagePanel = document.querySelector('.auth-image');
            
            if (formContainer) formContainer.classList.add('animate-in');
            if (imagePanel) imagePanel.classList.add('animate-in');
        }, 100); // Small delay to ensure DOM is ready
    }
};

// Initialize transitions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PageTransitions.init();
    
    // Handle back button
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Page was loaded from cache (back button)
            PageTransitions.animatePageIn();
        }
    });
}); 