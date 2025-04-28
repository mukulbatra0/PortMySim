/**
 * Common Utilities for PortMySim
 * Contains utility functions used across multiple pages
 */

// Add classes to enable animation for elements
function enableAnimations() {
  const elements = document.querySelectorAll('.animate-on-load');
  elements.forEach(element => {
    element.classList.add('animate');
  });
}

// Helper to format dates consistently
function formatDate(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}

// Helper for responsive design elements
function setupResponsiveElements() {
  const isMobile = window.innerWidth < 768;
  const tabContainers = document.querySelectorAll('.tabs-container');
  
  tabContainers.forEach(container => {
    if (isMobile) {
      container.classList.add('tabs-mobile');
    } else {
      container.classList.remove('tabs-mobile');
    }
  });
}

// Add ripple effect to buttons
function addRippleEffect() {
  const buttons = document.querySelectorAll('.btn-ripple');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Initialize common elements
document.addEventListener('DOMContentLoaded', function() {
  enableAnimations();
  setupResponsiveElements();
  addRippleEffect();
  
  // Handle window resize for responsive elements
  window.addEventListener('resize', setupResponsiveElements);

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const body = document.body;
  const authButtons = document.querySelector('.auth-buttons');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInside = navLinks.contains(event.target) || menuToggle.contains(event.target);
      
      if (!isClickInside && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close menu when clicking on a nav link - MODIFIED to prevent text from disappearing
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        // Only close the menu on mobile view
        if (window.innerWidth <= 768) {
          closeMenu();
        }
        
        // Don't prevent default behavior or stop propagation
        // This allows the link to work normally
      });
    });

    // Close menu when window is resized above mobile breakpoint
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    function toggleMenu() {
      navLinks.classList.toggle('active');
      body.classList.toggle('menu-open');
      menuToggle.classList.toggle('active');
      
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
      menuToggle.setAttribute('aria-expanded', isExpanded);
    }

    function closeMenu() {
      navLinks.classList.remove('active');
      body.classList.remove('menu-open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      
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
  }

  // Sticky Navigation with Hide/Show on Scroll
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  const scrollThreshold = 100; // Minimum scroll before hiding/showing
  let isScrollingUp = false;
  let scrollTimer = null;

  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      // Clear the existing timer
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      
      if (currentScroll <= 0) {
        // At the top
        navbar.classList.remove('scroll-up', 'scroll-down');
        return;
      }

      if (Math.abs(currentScroll - lastScroll) < 10) {
        // Ignore tiny changes
        return;
      }

      if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
        // Scrolling down
        if (!navbar.classList.contains('scroll-down')) {
          navbar.classList.remove('scroll-up');
          navbar.classList.add('scroll-down');
        }
      } else {
        // Scrolling up
        if (navbar.classList.contains('scroll-down')) {
          navbar.classList.remove('scroll-down');
          navbar.classList.add('scroll-up');
        }
      }

      // Set a timer to check if scrolling has stopped
      scrollTimer = setTimeout(() => {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
      }, 150);

      lastScroll = currentScroll;
    });
  }

  // Update current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
}); 