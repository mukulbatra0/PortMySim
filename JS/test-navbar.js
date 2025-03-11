// Test Navbar JavaScript

// Global flag to track initializations for coordination with other scripts
if (typeof window._testNavbarInitialized === 'undefined') {
    window._testNavbarInitialized = {
        aos: false,
        hamburger: false,
        animations: false,
        scrollHandlers: false,
        ripple: false
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.hamburger');
    const navElements = document.querySelector('.nav-elements');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;
    
    // Initialize AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 50,
            delay: 100
        });
        window._testNavbarInitialized.aos = true;
    }
    
    // Mobile Menu Toggle
    if (hamburger && navElements) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navElements.classList.toggle('active');
            body.classList.toggle('menu-open'); // Prevent scrolling when menu is open
            
            // Accessibility
            const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
            hamburger.setAttribute('aria-expanded', !expanded);
            window._testNavbarInitialized.hamburger = true;
        });
        
        // Add accessibility attributes
        hamburger.setAttribute('aria-label', 'Toggle menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-elements');
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (
            hamburger && 
            hamburger.classList.contains('active') && 
            !e.target.closest('.nav-container') && 
            !e.target.closest('.hamburger')
        ) {
            hamburger.classList.remove('active');
            navElements.classList.remove('active');
            body.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && window.innerWidth <= 768) {
                hamburger.classList.remove('active');
                navElements.classList.remove('active');
                body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Feature cards animation on hover
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        // Add subtle floating animation
        let floating = false;
        let floatingInterval;
        
        card.addEventListener('mouseenter', function() {
            if (!floating) {
                floating = true;
                let position = 0;
                let direction = 1;
                
                floatingInterval = setInterval(() => {
                    position += 0.3 * direction;
                    
                    if (position >= 3) {
                        direction = -1;
                    } else if (position <= 0) {
                        direction = 1;
                    }
                    
                    card.style.transform = `translateY(${position}px)`;
                }, 50);
            }
        });
        
        card.addEventListener('mouseleave', function() {
            floating = false;
            clearInterval(floatingInterval);
            card.style.transform = '';
        });
        
        // Add ripple effect on click
        card.addEventListener('click', function(e) {
            const x = e.clientX - card.getBoundingClientRect().left;
            const y = e.clientY - card.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            window._testNavbarInitialized.ripple = true;
        });
    });
    
    // Header scroll effect
    if (header) {
        const scrollHandler = () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        
        window.addEventListener('scroll', scrollHandler);
        
        // Run once on page load to set correct initial state
        scrollHandler();
        window._testNavbarInitialized.scrollHandlers = true;
    }
    
    // Add smooth scroll behavior to anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate offset (accounting for fixed header)
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Set active nav link based on current page
    setActiveLink();
    
    // Handle resize events for responsive behavior
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Reset mobile menu on screen resize
            if (window.innerWidth > 768 && hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navElements.classList.remove('active');
                body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }, 250);
    });
    
    // Add resize observer for dynamic content
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            // Update layout if needed
            if (entry.target.classList.contains('main-content')) {
                // Recalculate any dynamic heights or positions
            }
        }
    });
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        resizeObserver.observe(mainContent);
    }
});

/**
 * Set active link based on current page
 */
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Check if this is the current page
        if (
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === linkHref) ||
            (linkHref !== 'index.html' && currentPage.includes(linkHref.split('.html')[0]))
        ) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
} 
