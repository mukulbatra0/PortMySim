/**
 * PortMySim - Consolidated JavaScript
 * This file combines essential functionality for better performance and maintainability.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize all interactive components
    initThemeToggle();
    enhanceAllCards();
    initNavbarScrollEffects();
    initMobileMenu();
    
    // Add body class for specific page styles if needed
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        document.body.classList.add('home-page');
    }
    
    // Set active navigation link based on current page
    setActiveLink();
    
    // Initialize AOS (Animate on Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 50,
            delay: 100
        });
    }
    
    // Update current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.innerText = new Date().getFullYear();
    }
    
    // Smooth scroll for anchor links
    initSmoothScroll();
    
    // Form validation
    initFormValidation();
    
    // FAQ toggle functionality
    initFaqToggle();
});

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply stored theme on initial load
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    }
    
    // Add event listener to theme toggle if it exists
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

/**
 * Enhance all cards with animations and interactive effects
 */
function enhanceAllCards() {
    console.log('Enhancing cards with animations and effects');
    
    // Define all card selector types
    const cardTypes = '.feature-card, .testimonial-card, .achievement-card, .card, .faq-item';
    const cards = document.querySelectorAll(cardTypes);
    
    console.log('Found', cards.length, 'cards to enhance');
    
    cards.forEach((card, index) => {
        // Skip if already processed
        if (card.dataset.enhanced === 'true') return;
        
        // Mark as processed
        card.dataset.enhanced = 'true';
        
        // Ensure cards are visible
        card.style.display = 'flex';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
        
        // Add ripple effect
        addRippleEffect(card);
        
        console.log(`Enhanced card ${index}: ${card.className}`);
    });
}

/**
 * Add ripple effect to an element
 * @param {HTMLElement} element - The element to add the ripple effect to
 */
function addRippleEffect(element) {
    // Skip adding ripple to elements with links, buttons, or inputs
    const hasInteractiveElements = 
        element.querySelector('a, button, input, textarea, select') !== null;
    
    if (!hasInteractiveElements) {
        element.classList.add('ripple');
        
        element.addEventListener('click', function(e) {
            // Skip if clicked on a button or link
            if (e.target.closest('a, button, input, .btn')) return;
            
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
            ripple.style.left = x - (ripple.offsetWidth / 2) + 'px';
            ripple.style.top = y - (ripple.offsetHeight / 2) + 'px';
            
            element.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
}

/**
 * Initialize navbar scroll effects
 */
function initNavbarScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let scrollTimer;
    
    if (header) {
        const scrollHandler = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add 'scrolled' class when scrolled down
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Show/hide navbar based on scroll direction
            if (scrollTop > lastScrollTop && scrollTop > 200) {
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
    }
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navElements = document.querySelector('.nav-elements');
    const body = document.body;
    
    if (hamburger && navElements) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navElements.classList.toggle('active');
            body.classList.toggle('menu-open');
            
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
        const navLinks = document.querySelectorAll('.nav-link, .nav-links a');
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
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    const header = document.querySelector('.header') || document.querySelector('header');
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = header?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
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
                }
            });
            
            return valid;
        });
    });
}

/**
 * Initialize FAQ toggle functionality
 */
function initFaqToggle() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            faqItem.classList.toggle('active');
        });
    });
}

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

// Initialize on window load as well to ensure all resources are loaded
window.addEventListener('load', function() {
    console.log('All resources loaded');
    enhanceAllCards();
}); 