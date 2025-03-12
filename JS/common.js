/**
 * PortMySim - Core JavaScript Functionality
 * Consolidated and optimized common functionality
 */

// Global initialization flag
if (typeof window._portMySimInitialized === 'undefined') {
    window._portMySimInitialized = {
        navigation: false,
        animations: false,
        eventHandlers: false
    };
}

// Core functionality class
class PortMySimCore {
    constructor() {
        this.header = document.querySelector('.header') || document.querySelector('header');
        this.navbar = document.querySelector('.navbar');
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.getElementById('navLinks');
        this.body = document.body;
        this.authButtons = document.querySelector('.auth-buttons');
        this.lastScroll = 0;
        this.scrollThreshold = 100;
        this.scrollTimer = null;
        
        this.init();
    }
    
    init() {
        if (!window._portMySimInitialized.navigation) {
            this.initializeNavigation();
        }
        
        if (!window._portMySimInitialized.animations) {
            this.initializeAnimations();
        }
        
        if (!window._portMySimInitialized.eventHandlers) {
            this.initializeEventHandlers();
        }
        
        this.updateFooterYear();
    }
    
    initializeNavigation() {
        if (this.menuToggle && this.navLinks) {
            // Menu toggle click handler
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (event) => {
                const isClickInside = this.navLinks.contains(event.target) || 
                                    this.menuToggle.contains(event.target);
                
                if (!isClickInside && this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                }
            });
            
            // Mobile nav link click handling
            this.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMenu();
                    }
                });
            });
            
            // Escape key handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }
        
        window._portMySimInitialized.navigation = true;
    }
    
    initializeAnimations() {
        // Initialize AOS if available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out',
                once: true,
                offset: 50,
                delay: 100
            });
        }
        
        // Add ripple effect to buttons
        this.addRippleEffect();
        
        window._portMySimInitialized.animations = true;
    }
    
    initializeEventHandlers() {
        // Scroll handler
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Resize handler
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && this.navLinks?.classList.contains('active')) {
                    this.closeMenu();
                }
                this.handleAuthButtonsVisibility();
            }, 250);
        });
        
        window._portMySimInitialized.eventHandlers = true;
    }
    
    toggleMenu() {
        this.navLinks.classList.toggle('active');
        this.body.classList.toggle('menu-open');
        this.menuToggle.classList.toggle('active');
        
        const isExpanded = this.navLinks.classList.contains('active');
        this.menuToggle.setAttribute('aria-expanded', isExpanded);
        
        this.handleAuthButtonsVisibility();
    }
    
    closeMenu() {
        this.navLinks.classList.remove('active');
        this.body.classList.remove('menu-open');
        this.menuToggle.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        
        this.handleAuthButtonsVisibility();
    }
    
    handleAuthButtonsVisibility() {
        if (!this.authButtons) return;
        
        if (window.innerWidth <= 768) {
            const navAuthButtons = this.navLinks.querySelector('.auth-buttons');
            if (this.navLinks.classList.contains('active')) {
                if (!navAuthButtons) {
                    this.navLinks.appendChild(this.authButtons.cloneNode(true));
                }
                this.authButtons.style.display = 'none';
            } else {
                if (navAuthButtons) {
                    navAuthButtons.remove();
                }
                this.authButtons.style.display = '';
            }
        } else {
            const navAuthButtons = this.navLinks.querySelector('.auth-buttons');
            if (navAuthButtons) {
                navAuthButtons.remove();
            }
            this.authButtons.style.display = '';
        }
    }
    
    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        if (this.scrollTimer !== null) {
            clearTimeout(this.scrollTimer);
        }
        
        if (currentScroll <= 0) {
            this.navbar?.classList.remove('scroll-up', 'scroll-down');
            return;
        }
        
        if (Math.abs(currentScroll - this.lastScroll) < 10) return;
        
        if (currentScroll > this.lastScroll && currentScroll > this.scrollThreshold) {
            if (!this.navbar?.classList.contains('scroll-down')) {
                this.navbar?.classList.remove('scroll-up');
                this.navbar?.classList.add('scroll-down');
            }
        } else {
            if (this.navbar?.classList.contains('scroll-down')) {
                this.navbar?.classList.remove('scroll-down');
                this.navbar?.classList.add('scroll-up');
            }
        }
        
        this.scrollTimer = setTimeout(() => {
            this.navbar?.classList.remove('scroll-down');
            this.navbar?.classList.add('scroll-up');
        }, 150);
        
        this.lastScroll = currentScroll;
    }
    
    addRippleEffect() {
        const elements = document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .btn-outline, .feature-card, .social-icon');
        
        elements.forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                element.appendChild(ripple);
                
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size/2}px`;
                ripple.style.top = `${e.clientY - rect.top - size/2}px`;
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
    
    updateFooterYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PortMySimCore();
}); 