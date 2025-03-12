/**
 * PortMySim - Consolidated JavaScript
 * This file combines essential functionality from multiple JS files
 * for better performance and maintainability.
 */

// Global flags to prevent duplicate initialization
if (typeof window._mainJsInitialized === 'undefined') {
    window._mainJsInitialized = {
        aos: false,
        hamburger: false,
        animations: false,
        scrollHandlers: false,
        ripple: false,
        darkTheme: false
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Common elements
    const header = document.querySelector('.header') || document.querySelector('header');
    const nav = document.querySelector('.nav') || document.querySelector('nav');
    const hamburger = document.querySelector('.hamburger') || document.querySelector('.menu-toggle');
    const navElements = document.querySelector('.nav-elements') || document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link') || document.querySelectorAll('.nav-links a');
    const body = document.body;
    
    // Set active navigation link based on current page
    setActiveLink();
    
    // Initialize AOS (Animate on Scroll) if available
    if (typeof AOS !== 'undefined' && !window._mainJsInitialized.aos) {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 50,
            delay: 100
        });
        window._mainJsInitialized.aos = true;
    }
    
    // Mobile Menu Toggle
    if (hamburger && navElements && !window._mainJsInitialized.hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navElements.classList.toggle('active');
            body.classList.toggle('menu-open'); // Prevent scrolling when menu is open
            
            // Accessibility
            const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
            hamburger.setAttribute('aria-expanded', !expanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navElements.contains(event.target) || hamburger.contains(event.target);
            
            if (!isClickInside && navElements.classList.contains('active')) {
                hamburger.classList.remove('active');
                navElements.classList.remove('active');
                body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when clicking on mobile nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) {
                    hamburger.classList.remove('active');
                    navElements.classList.remove('active');
                    body.classList.remove('menu-open');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        window._mainJsInitialized.hamburger = true;
    }
    
    // Mobile auth buttons handling
    const authButtons = document.querySelector('.auth-buttons');
    if (hamburger && authButtons && window.innerWidth <= 992) {
        // Move auth buttons to mobile menu
        const mobileAuthButtons = authButtons.cloneNode(true);
        mobileAuthButtons.classList.add('mobile-auth-buttons');
        navElements?.appendChild(mobileAuthButtons);
    }
    
    // Feature cards animation (if exists)
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0 && !window._mainJsInitialized.animations) {
        featureCards.forEach(card => {
            // Hover effect
            card.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
            
            // Click ripple effect
            card.addEventListener('click', function(e) {
                // Create ripple element
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                this.appendChild(ripple);
                
                // Position the ripple
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size/2}px`;
                ripple.style.top = `${e.clientY - rect.top - size/2}px`;
                
                // Remove ripple after animation completes
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        window._mainJsInitialized.animations = true;
    }
    
    // Header scroll effect
    if (header && !window._mainJsInitialized.scrollHandlers) {
        let lastScrollTop = 0;
        let scrollTimer;
        
        const scrollHandler = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add 'scrolled' class when scrolled down
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Show/hide navbar based on scroll direction
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.classList.add('nav-hidden');
            } else {
                // Scrolling up
                header.classList.remove('nav-hidden');
            }
            
            lastScrollTop = scrollTop;
        };
        
        // Throttle scroll event for better performance
        window.addEventListener('scroll', function() {
            if (!scrollTimer) {
                scrollTimer = setTimeout(function() {
                    scrollHandler();
                    scrollTimer = null;
                }, 10);
            }
        });
        
        window._mainJsInitialized.scrollHandlers = true;
    }
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = document.querySelector('header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Ripple effect for buttons
    function addRippleEffect() {
        const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .btn-outline, .feature-card, .social-icon');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                this.appendChild(ripple);
                
                // Position the ripple
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size/2}px`;
                ripple.style.top = `${e.clientY - rect.top - size/2}px`;
                
                // Remove ripple after animation completes
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        window._mainJsInitialized.ripple = true;
    }
    
    if (!window._mainJsInitialized.ripple) {
        addRippleEffect();
    }
    
    // Update current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.innerText = new Date().getFullYear();
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        // Throttle resize event
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (hamburger && authButtons) {
                // Re-handle auth buttons on resize
                const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
                
                if (window.innerWidth <= 992) {
                    if (!mobileAuthButtons) {
                        const newMobileAuthButtons = authButtons.cloneNode(true);
                        newMobileAuthButtons.classList.add('mobile-auth-buttons');
                        navElements?.appendChild(newMobileAuthButtons);
                    }
                } else {
                    if (mobileAuthButtons) {
                        mobileAuthButtons.remove();
                    }
                }
            }
        }, 250);
    });
    
    // Create ResizeObserver for dynamic content
    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                // Handle resize of specific elements if needed
            }
        });
        
        // Observe main content
        const mainContent = document.querySelector('main') || document.querySelector('.main-content');
        if (mainContent) {
            resizeObserver.observe(mainContent);
        }
    }
    
    // Toggle password visibility for password fields
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let valid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                const errorElement = input.parentElement.nextElementSibling;
                if (!input.value.trim()) {
                    e.preventDefault();
                    valid = false;
                    input.classList.add('error');
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.textContent = 'This field is required';
                    }
                } else {
                    input.classList.remove('error');
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.textContent = '';
                    }
                    
                    // Email validation
                    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                        e.preventDefault();
                        valid = false;
                        input.classList.add('error');
                        if (errorElement && errorElement.classList.contains('error-message')) {
                            errorElement.textContent = 'Please enter a valid email address';
                        }
                    }
                    
                    // Phone validation
                    if (input.type === 'tel' && !/^[0-9+\s-]{10,15}$/.test(input.value)) {
                        e.preventDefault();
                        valid = false;
                        input.classList.add('error');
                        if (errorElement && errorElement.classList.contains('error-message')) {
                            errorElement.textContent = 'Please enter a valid phone number';
                        }
                    }
                }
            });
            
            // Password match validation for signup form
            if (form.id === 'signupForm') {
                const password = document.getElementById('password');
                const confirmPassword = document.getElementById('confirm-password');
                const errorElement = confirmPassword.parentElement.nextElementSibling;
                
                if (password && confirmPassword && password.value !== confirmPassword.value) {
                    e.preventDefault();
                    valid = false;
                    confirmPassword.classList.add('error');
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.textContent = 'Passwords do not match';
                    }
                }
            }
            
            return valid;
        });
    });
    
    // FAQ toggle functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            answer.classList.toggle('show');
        });
    });
    
    // Pricing toggle (if exists)
    const pricingToggle = document.querySelector('.pricing-toggle');
    if (pricingToggle) {
        const monthlyLabel = document.querySelector('.monthly-label');
        const yearlyLabel = document.querySelector('.yearly-label');
        const monthlyPrices = document.querySelectorAll('.monthly-price');
        const yearlyPrices = document.querySelectorAll('.yearly-price');
        
        pricingToggle.addEventListener('change', function() {
            if (this.checked) {
                // Yearly pricing
                monthlyLabel?.classList.remove('active');
                yearlyLabel?.classList.add('active');
                monthlyPrices.forEach(price => price.style.display = 'none');
                yearlyPrices.forEach(price => price.style.display = 'block');
            } else {
                // Monthly pricing
                monthlyLabel?.classList.add('active');
                yearlyLabel?.classList.remove('active');
                monthlyPrices.forEach(price => price.style.display = 'block');
                yearlyPrices.forEach(price => price.style.display = 'none');
            }
        });
    }
    
    // Enhanced Card Animations
    function enhanceAllCards() {
        // Debug information for troubleshooting
        console.log('Running enhanceAllCards function');
        
        // Select all types of cards in the project
        const allCards = document.querySelectorAll(
            '.feature-card, .testimonial-card, .achievement-card, .requirement-card, ' + 
            '.operator-plan-card, .recommendation-card, .team-member, .faq-item, ' +
            '.timeline-item, .mission-item, .plan-card, .pricing-card, .auth-form-container, ' +
            '.card, .info-card, .service-card, .blog-card, .faq-question, .stat-item, ' +
            '.plan, .product-card, .contact-info'
        );
        
        console.log('Found', allCards.length, 'cards to enhance');
        
        // Check if cards are visible
        allCards.forEach((card, index) => {
            const computedStyle = window.getComputedStyle(card);
            const isVisible = computedStyle.display !== 'none' && 
                            computedStyle.visibility !== 'hidden' && 
                            computedStyle.opacity !== '0';
                            
            console.log(`Card ${index}: ${card.className} is ${isVisible ? 'visible' : 'not visible'}`, 
                      'Display:', computedStyle.display, 
                      'Visibility:', computedStyle.visibility, 
                      'Opacity:', computedStyle.opacity);
                      
            // Make sure card is visible
            if (computedStyle.display === 'none') {
                card.style.display = 'block';
            }
            
            // Skip if card already has animation
            if (card.dataset.animated === 'true') return;
            card.dataset.animated = 'true';
            
            // Add class for animation readiness
            card.classList.add('ripple');
            
            // Make sure card has position relative for proper effect positioning
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            
            // Make sure card has overflow hidden for ripple effects
            if (getComputedStyle(card).overflow === 'visible') {
                card.style.overflow = 'hidden';
            }
            
            // Add subtle floating animation on hover
            let floating = false;
            let floatingInterval;
            
            card.addEventListener('mouseenter', function() {
                if (!floating && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    floating = true;
                    let position = 0;
                    let direction = 1;
                    
                    // Store original transition
                    const originalTransition = this.style.transition;
                    this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                    
                    floatingInterval = setInterval(() => {
                        position += 0.3 * direction;
                        
                        if (position >= 3) {
                            direction = -1;
                        } else if (position <= 0) {
                            direction = 1;
                        }
                        
                        this.style.transform = `translateY(${position}px)`;
                    }, 50);
                    
                    // Enhanced shadow effect
                    const originalBoxShadow = getComputedStyle(this).boxShadow;
                    if (originalBoxShadow === 'none' || !originalBoxShadow) {
                        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                    } else {
                        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                    }
                }
            });
            
            card.addEventListener('mouseleave', function() {
                floating = false;
                clearInterval(floatingInterval);
                this.style.transform = '';
                
                // Reset box-shadow to original
                const computedStyle = getComputedStyle(this);
                const originalBoxShadow = computedStyle.getPropertyValue('--original-box-shadow') || 
                                         computedStyle.boxShadow;
                this.style.boxShadow = originalBoxShadow;
            });
            
            // Add ripple effect on click
            card.addEventListener('click', function(e) {
                // Don't add ripple for buttons inside cards or interactive elements
                if (e.target.closest('a, button, input, select, .btn, .form-control, .auth-form-container, form')) {
                    return;
                }
                
                const x = e.clientX - this.getBoundingClientRect().left;
                const y = e.clientY - this.getBoundingClientRect().top;
                
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                
                // Size based on card's largest dimension
                const size = Math.max(this.offsetWidth, this.offsetHeight) * 2;
                ripple.style.width = ripple.style.height = `${size}px`;
                
                // Position the ripple
                ripple.style.left = `${x - size/2}px`;
                ripple.style.top = `${y - size/2}px`;
                
                this.appendChild(ripple);
                
                // Remove ripple after animation completes
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    // Call the function to enhance all cards when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceAllCards);
    } else {
        enhanceAllCards();
    }
    
    // Also call it when new content might be loaded
    window.addEventListener('load', enhanceAllCards);
});

/**
 * Set active link based on current page
 */
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link') || document.querySelectorAll('.nav-links a');
    
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