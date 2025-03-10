// Mobile Menu Fix
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;
    const authButtons = document.querySelector('.auth-buttons');

    if (menuToggle && navLinks) {
        // Remove any existing event listeners
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        
        // Add new event listener
        newMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
            newMenuToggle.classList.toggle('active');
            
            // For mobile view, move auth buttons into the nav menu
            if (window.innerWidth <= 768) {
                if (navLinks.classList.contains('active')) {
                    // If nav is open, move auth buttons into nav
                    if (!navLinks.contains(authButtons) && authButtons) {
                        navLinks.appendChild(authButtons.cloneNode(true));
                        authButtons.style.display = 'none';
                    }
                } else {
                    // If nav is closed, restore auth buttons
                    const navAuthButtons = navLinks.querySelector('.auth-buttons');
                    if (navAuthButtons) {
                        navLinks.removeChild(navAuthButtons);
                    }
                    if (authButtons) {
                        authButtons.style.display = '';
                    }
                }
            }
            
            // Set aria-expanded attribute
            const isExpanded = navLinks.classList.contains('active');
            newMenuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navLinks.contains(event.target) || newMenuToggle.contains(event.target);
            
            if (!isClickInside && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
                newMenuToggle.classList.remove('active');
                newMenuToggle.setAttribute('aria-expanded', 'false');
                
                // Restore auth buttons if in mobile view
                if (window.innerWidth <= 768) {
                    const navAuthButtons = navLinks.querySelector('.auth-buttons');
                    if (navAuthButtons) {
                        navLinks.removeChild(navAuthButtons);
                    }
                    if (authButtons) {
                        authButtons.style.display = '';
                    }
                }
            }
        });

        // Close menu when clicking on a nav link - MODIFIED to prevent text from disappearing
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Only close the menu on mobile view
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    body.classList.remove('menu-open');
                    newMenuToggle.classList.remove('active');
                    newMenuToggle.setAttribute('aria-expanded', 'false');
                    
                    // Restore auth buttons if in mobile view
                    const navAuthButtons = navLinks.querySelector('.auth-buttons');
                    if (navAuthButtons) {
                        navLinks.removeChild(navAuthButtons);
                    }
                    if (authButtons) {
                        authButtons.style.display = '';
                    }
                }
                
                // Don't prevent default behavior or stop propagation
                // This allows the link to work normally
            });
        });
        
        // Close menu when window is resized above mobile breakpoint
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
                newMenuToggle.classList.remove('active');
                newMenuToggle.setAttribute('aria-expanded', 'false');
                
                // Restore auth buttons
                const navAuthButtons = navLinks.querySelector('.auth-buttons');
                if (navAuthButtons) {
                    navLinks.removeChild(navAuthButtons);
                }
                if (authButtons) {
                    authButtons.style.display = '';
                }
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
                newMenuToggle.classList.remove('active');
                newMenuToggle.setAttribute('aria-expanded', 'false');
                
                // Restore auth buttons if in mobile view
                if (window.innerWidth <= 768) {
                    const navAuthButtons = navLinks.querySelector('.auth-buttons');
                    if (navAuthButtons) {
                        navLinks.removeChild(navAuthButtons);
                    }
                    if (authButtons) {
                        authButtons.style.display = '';
                    }
                }
            }
        });
    }
    
    // Update current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}); 