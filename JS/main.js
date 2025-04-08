/**
 * PortMySim - Consolidated JavaScript
 * This file combines essential functionality from multiple JS files
 * for better performance and maintainability.
 */

// Global flags to prevent duplicate initialization
if (typeof window._mainJsInitialized === "undefined") {
    window._mainJsInitialized = {
        aos: false,
        hamburger: false,
        animations: false,
        scrollHandlers: false,
        ripple: false,
        darkTheme: false,
        operatorPlanAnimations: false, // New flag for operator plan animations
    };
}

document.addEventListener("DOMContentLoaded", function () {
  // Basic initialization
  document.body.classList.add("js-loaded");

  // Detect API server and initialize connection
  if (typeof detectApiPort === 'function') {
    detectApiPort().then(() => {
      // After checking for API connection, show error if needed
      if (typeof showConnectionError === 'function') {
        showConnectionError();
      }
    });
  }

  // Common elements
  const header =
    document.querySelector(".header") || document.querySelector("header");
  const hamburger =
    document.querySelector(".hamburger") ||
    document.querySelector(".menu-toggle");
  const navElements =
    document.querySelector(".nav-elements") ||
    document.querySelector(".nav-links");
  const navLinks =
    document.querySelectorAll(".nav-link") ||
    document.querySelectorAll(".nav-links a");
    const body = document.body;
    
  // Initialize custom dropdown menus (NEW)
  initCustomDropdowns();
    
  // Initialize operator plan animations (replaces dropdown menu functionality)
  initOperatorPlanAnimations();

  // Disable navigation animations - NEW FUNCTION
  disableNavbarAnimations();

  // Fix for animation visibility issues - ensure all elements are visible
  forceVisibilityForAllElements();

  // Explicitly reinitialize button animations
  reinitializeButtonAnimations();

  // Set active navigation link
    setActiveLink();
    
  // Fix testimonial card animations on home page
  fixTestimonialCardAnimations();

  // Handle mobile menu toggle
  if (hamburger && navElements) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navElements.classList.toggle("active");
      body.classList.toggle("menu-open");

      const expanded =
        hamburger.getAttribute("aria-expanded") === "true" || false;
      hamburger.setAttribute("aria-expanded", !expanded);
        });
        
        // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInside =
        navElements.contains(event.target) || hamburger.contains(event.target);

      if (!isClickInside && navElements.classList.contains("active")) {
        hamburger.classList.remove("active");
        navElements.classList.remove("active");
        body.classList.remove("menu-open");
        hamburger.setAttribute("aria-expanded", "false");
            }
        });
        
        // Close menu when clicking on mobile nav links
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
                if (window.innerWidth <= 992) {
          hamburger.classList.remove("active");
          navElements.classList.remove("active");
          body.classList.remove("menu-open");
          hamburger.setAttribute("aria-expanded", "false");
                }
            });
        });
  }

  // Fixed header on scroll - Updated to avoid animations
  let scrollPos = 0;
  window.addEventListener("scroll", function () {
    const currentScrollPos = window.scrollY;

    if (header) {
      if (currentScrollPos > 10) {
        // Add fixed class without animation
        header.style.transition = "none";
        header.classList.add("fixed");
      } else {
        // Remove fixed class without animation
        header.style.transition = "none";
        header.classList.remove("fixed");
      }
    }

    scrollPos = currentScrollPos;
  });

  // Footer year
  updateFooterYear();

  // Apply animations only if user doesn't prefer reduced motion
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Apply consistent animations across all pages
    initUnifiedAnimationSystem();

    // Add BSNL-style cursor tilt effect for cards
    initCardTiltEffect();

    // Re-run animations on dynamic content
    document.addEventListener("contentLoaded", function () {
      initUnifiedAnimationSystem();
      initCardTiltEffect();
    });
  } else {
    // For users who prefer reduced motion, make everything visible immediately
    document
      .querySelectorAll(".animate-on-scroll, .animate-pop-up")
      .forEach((el) => {
        el.style.opacity = "1";
        el.classList.add("visible");
      });
  }

  // Add ripple effect to buttons
  document
    .querySelectorAll(
      ".btn-primary, .btn-secondary, .btn-outline-white, .btn-login, .btn-signup"
    )
    .forEach((button) => {
      button.addEventListener("click", createRippleEffect);
    });

  // Initialize mobile navigation
  initMobileNavigation();

  // Initialize hero buttons specifically
  initializeHeroButtons();

  // Initialize recommendation card animations - disabled since section was removed
  initRecommendationCardAnimations();

  // Initialize about page animations
  initAboutPageAnimations();

  // Contact Form Validation and Interactivity
  initContactForm();
});

// NEW FUNCTION: Initialize custom dropdown menus
function initCustomDropdowns() {
  console.log("Initializing custom dropdowns with slower animations");
  
  // Find all filter-select elements, but skip schedule-form selects
  const selectElements = document.querySelectorAll('.filter-select');
  
  selectElements.forEach((select) => {
    // Skip if already converted or if the browser doesn't support customElements
    // Also skip if select is inside schedule-form (handled by dropdown-animation.js)
    if (select.dataset.customized === 'true' || !window.customElements || select.closest('.schedule-form')) return;
    
    // Create parent container div
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-dropdown';
    
    // Create the selected display element
    const selectedDisplay = document.createElement('div');
    selectedDisplay.className = 'custom-dropdown-selected';
    selectedDisplay.textContent = select.options[select.selectedIndex]?.text || 'Select an option';
    
    // Create dropdown list
    const dropdownList = document.createElement('div');
    dropdownList.className = 'custom-dropdown-list';
    
    // Hide the original select
    select.style.display = 'none';
    select.dataset.customized = 'true';
    
    // Insert new elements before the select
    select.parentNode.insertBefore(dropdown, select);
    dropdown.appendChild(selectedDisplay);
    dropdown.appendChild(dropdownList);
    dropdown.appendChild(select); // Move select into our container
    
    // Create dropdown items from options
    Array.from(select.options).forEach((option, index) => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item';
      if (index === select.selectedIndex) {
        item.classList.add('selected');
      }
      item.textContent = option.text;
      item.dataset.value = option.value;
      dropdownList.appendChild(item);
      
      // Handle item click
      item.addEventListener('click', function() {
        // Update selected value in original select
        select.value = this.dataset.value;
        select.dispatchEvent(new Event('change'));
        
        // Update displayed text
        selectedDisplay.textContent = this.textContent;
        
        // Update selected style
        dropdown.querySelectorAll('.custom-dropdown-item').forEach(i => {
          i.classList.remove('selected');
        });
        this.classList.add('selected');
        
        // Close dropdown with a slight delay for smoother animation
                setTimeout(() => {
          dropdown.classList.remove('open');
        }, 100);
        
        // Trigger any ripple/pulse effects
        if (select.classList.contains('filter-select')) {
          applyFilterSelectEffects(select);
        }
            });
        });
        
    // Add click listener to toggle dropdown
    selectedDisplay.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      
      // Close other open dropdowns
      document.querySelectorAll('.custom-dropdown.open').forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
          otherDropdown.classList.remove('open');
        }
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  });
  
  console.log("Custom dropdowns initialized with slower animations");
}

// Helper function to apply filter select effects
function applyFilterSelectEffects(select) {
  // Add animation effects similar to the original behavior
  select.classList.add('sparkle-effect');
  setTimeout(() => {
    select.classList.remove('sparkle-effect');
  }, 1500); // Longer animation duration
  
  // Propagate the effect to parent group
  const filterGroup = select.closest('.filter-group');
  if (filterGroup) {
    const label = filterGroup.querySelector('.filter-label');
    if (label) {
      label.style.animation = 'pulse 3s ease'; // Longer pulse animation
      setTimeout(() => {
        label.style.animation = '';
      }, 3000); // Longer reset time
    }
  }
}

// Helper Functions
function setActiveLink() {
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (
      (currentLocation.includes(linkPath) && linkPath !== "index.html") ||
      (currentLocation.endsWith("/") && linkPath === "index.html") ||
      (currentLocation.endsWith("HTML/") && linkPath === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}

function updateFooterYear() {
  const yearElement = document.querySelector(".current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function createRippleEffect(e) {
  // First remove any existing ripples
  this.querySelectorAll(".ripple-effect").forEach((ripple) => ripple.remove());

  const button = this;
  const ripple = document.createElement("span");
  ripple.classList.add("ripple-effect");

  // Determine button type to adjust ripple color
  if (
    button.classList.contains("primary") ||
    button.classList.contains("btn-primary")
  ) {
    ripple.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  } else if (button.classList.contains("secondary")) {
    ripple.style.backgroundColor =
      "rgba(var(--primary-rgb, 240, 182, 127), 0.3)";
            } else {
    ripple.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
  }

  button.appendChild(ripple);

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.5; // Larger size for better effect
                ripple.style.width = ripple.style.height = `${size}px`;

  // Get cursor position relative to the button
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Position ripple from click point
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;

  // Add a subtle glow effect to the button on click
  const originalBoxShadow = button.style.boxShadow;
  if (
    button.classList.contains("primary") ||
    button.classList.contains("btn-primary")
  ) {
    button.style.boxShadow = "var(--glow-primary)";
            } else {
    button.style.boxShadow = "var(--shadow-lg)";
  }

  // Reset the box shadow after the ripple animation completes
                setTimeout(() => {
    button.style.boxShadow = originalBoxShadow;
                    ripple.remove();
                }, 600);

  // Don't interrupt the button's natural effect
  return true;
}

// Reinitialize button animations
function reinitializeButtonAnimations() {
  console.log("Reinitializing button animations");

  // Clear any inline styles that might interfere
  document
    .querySelectorAll(
      ".hero-btn, .btn-primary, .cta-btn, .btn-login, .btn-signup"
    )
    .forEach((button) => {
      // Remove inline transform that might be blocking animations
      button.style.removeProperty("transform");

      // Make sure hover animations work properly
      button.addEventListener("mouseenter", function () {
        // Skip transform for hero buttons to prevent movement
        if (!this.classList.contains("hero-btn")) {
          this.style.transform = "translateY(-5px)";
        }

        this.style.boxShadow =
          "0 7px 15px rgba(var(--primary-rgb, 240, 182, 127), 0.4)";

        // Add icon animation if present
        const icon = this.querySelector("i");
        if (icon) {
          icon.style.transform = "translateX(5px)";
        }
      });

      button.addEventListener("mouseleave", function () {
        this.style.transform = "";
        this.style.boxShadow = "";

        // Reset icon animation
        const icon = this.querySelector("i");
        if (icon) {
          icon.style.transform = "";
        }
      });

      // Add ripple effect
      button.removeEventListener("click", createRippleEffect); // Remove old listener to prevent duplicates
      button.addEventListener("click", createRippleEffect);
    });

  // Special handling for How It Works page hero buttons
  const heroButtons = document.querySelectorAll(
    ".hero-buttons .hero-btn, .cta-buttons .cta-btn"
  );
  heroButtons.forEach((button) => {
    if (button.classList.contains("primary")) {
      // Restart pulse animation
      button.style.animation = "none";
      setTimeout(() => {
        button.style.animation = "pulse 2s infinite";
                }, 10);
            }

    // Add special hover effect for primary buttons in hero section
    if (
      button.classList.contains("primary") &&
      button.closest(".hero-section")
    ) {
      button.addEventListener("mouseenter", function () {
        this.style.boxShadow = "var(--glow-primary)";
      });
    }

    // Add special hover effect for CTA buttons
    if (button.closest(".cta-section")) {
      button.addEventListener("mouseenter", function () {
        this.style.boxShadow = "var(--glow-accent)";
                });
            }
        });

  // Ensure animations are smooth by adding will-change
  document
    .querySelectorAll(".hero-btn, .btn-primary, .cta-btn")
    .forEach((button) => {
      button.style.willChange = "transform, box-shadow";
    });
}

// Force all elements with animation classes to be visible
function forceVisibilityForAllElements() {
  // Make all animated elements visible immediately
  document
    .querySelectorAll(
      ".animate-pop-up, .animate-on-scroll, .section-header, .timeline-item, .requirement-card, .faq-item, .cta-content"
    )
    .forEach((el) => {
      // Skip resetting transform for buttons to preserve their animations
      const isButton =
        el.classList.contains("hero-btn") ||
        el.classList.contains("btn-primary") ||
        el.classList.contains("cta-btn") ||
        el.classList.contains("btn-login") ||
        el.classList.contains("btn-signup") ||
        el.classList.contains("btn-secondary");

      // Skip navbar elements with the no-animation flag
      if (el.getAttribute("data-no-animation") === "true") {
        el.style.opacity = "1";
        el.style.transform = "none";
        return;
      }

      el.style.opacity = "1";
      el.classList.add("visible");
      el.classList.add("in-view");
      el.classList.add("animated");

      // Only reset transform for non-button elements
      if (!isButton) {
        el.style.transform = "none";
      }
    });

  // Make sure FAQ answers are visible if they should be
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const answer = this.nextElementSibling;
      answer.classList.toggle("active");
      this.classList.toggle("active");
            });
        });
        
  // Initialize FAQ accordion - open first one by default for visibility
  initFaqAccordion();
}

// Initialize FAQ Accordion functionality
function initFaqAccordion() {
  console.log("Initializing FAQ accordion");

  // Automatically open the first FAQ for visibility
  const firstQuestion = document.querySelector(".faq-question");
  if (firstQuestion) {
    setTimeout(() => {
      const answer = firstQuestion.nextElementSibling;
      firstQuestion.classList.add("active");
      answer.classList.add("active");
      console.log("Opened first FAQ item for visibility");
    }, 500);
  }
}

// Unified Animation System for consistent animations across all pages
function initUnifiedAnimationSystem() {
  // Apply pop-up animations to elements that should have them
  applyPopUpAnimations();

  // Set up scroll-based animations
  initScrollAnimations();

  // Add a class to indicate animations are enabled
  document.documentElement.classList.add("animations-enabled");

  // Initialize page-specific animations
  initOperatorPlanAnimations();
  initRecommendationCardAnimations();
  initAboutPageAnimations();
  initContactPageAnimations();
}

// Apply pop-up animations to elements that should have them
function applyPopUpAnimations() {
  // Target elements for pop-up animations with consistent delays
  const animationGroups = [
    // Navigation elements
    { selector: ".logo, .nav-links .nav-item", baseDelay: 100, stagger: 50 },

    // Hero section
    { selector: ".hero-text h1, .hero-text p", baseDelay: 200, stagger: 100 },
    {
      selector: ".hero-buttons .btn-primary, .hero-buttons .btn-outline-white",
      baseDelay: 400,
      stagger: 100,
    },
    { selector: ".hero-image", baseDelay: 300, stagger: 0 },

    // Section titles
    {
      selector: ".section-title h2, .section-title p",
      baseDelay: 100,
      stagger: 100,
    },

    // Feature cards
    { selector: ".feature-card", baseDelay: 100, stagger: 100, limit: 6 },

    // How It Works steps - maintain the same animation pattern
    { selector: ".step", baseDelay: 100, stagger: 100, limit: 3 },

    // Testimonials
    { selector: ".testimonial-card", baseDelay: 100, stagger: 100, limit: 3 },

    // CTA section
    {
      selector: ".cta-content h2, .cta-content p",
      baseDelay: 100,
      stagger: 100,
    },
    {
      selector: ".cta-buttons .btn-primary, .cta-buttons .btn-outline-white",
      baseDelay: 300,
      stagger: 100,
    },

    // Footer sections
    { selector: ".footer-section", baseDelay: 100, stagger: 50 },
  ];

  // Process each animation group
  animationGroups.forEach((group) => {
    const elements = document.querySelectorAll(group.selector);
    const limit = group.limit || elements.length;

    elements.forEach((el, index) => {
      if (index >= limit) return;

      // Don't re-apply to elements that already have animation classes
      if (
        !el.classList.contains("animate-pop-up") &&
        !el.classList.contains("animate-on-scroll")
      ) {
        // Choose animation type based on element
        const isHeroOrVisible =
          el.closest(".hero-section") ||
          el.getBoundingClientRect().top < window.innerHeight * 0.5;

        if (isHeroOrVisible) {
          // Immediate pop-up animation for hero and visible elements
          el.classList.add("animate-pop-up");
          const delay = group.baseDelay + index * group.stagger;
          el.classList.add(`delay-${Math.floor(delay / 100) * 100}`);
                } else {
          // Scroll-based animation for elements below the fold
          el.classList.add("animate-on-scroll");
          el.style.animationDelay = `${
            (group.baseDelay + index * group.stagger) / 1000
          }s`;
        }
            }
        });
    });
    
  // Process explicit pop-up animations
  const popUpElements = document.querySelectorAll(
    ".animate-pop-up:not(.animated)"
  );

  popUpElements.forEach((element, index) => {
    // Add animated class to prevent re-animation
    element.classList.add("animated");

    // Get delay from class or set based on index
    let delay = 0;
    if (element.classList.contains("delay-100")) delay = 100;
    else if (element.classList.contains("delay-200")) delay = 200;
    else if (element.classList.contains("delay-300")) delay = 300;
    else if (element.classList.contains("delay-400")) delay = 400;
    else if (element.classList.contains("delay-500")) delay = 500;
    else delay = index * 100; // Default staggered delay

                setTimeout(() => {
      element.style.opacity = "1";
      element.style.transform = "scale(1) translateY(0)";
    }, delay);
  });
}

// Initialize scroll-based animations
function initScrollAnimations() {
  const animateElements = document.querySelectorAll(
    ".animate-on-scroll:not(.visible)"
  );
  if (!animateElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Small delay for smoother appearance when multiple elements enter viewport
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, 50);

          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.15,
    }
  );

  animateElements.forEach((element) => {
    observer.observe(element);
  });

  // Fallback to ensure all elements are visible after 5 seconds
  // This ensures no content stays hidden if there are any issues
  setTimeout(() => {
    document
      .querySelectorAll(".animate-on-scroll:not(.visible)")
      .forEach((el) => {
        el.classList.add("visible");
      });
  }, 5000);
}

// BSNL-style cursor tilt effect for cards
function initCardTiltEffect() {
  // Include How It Works page specific elements
  const cards = document.querySelectorAll(
    ".feature-card, .testimonial-card, .step, .timeline-item, .requirement-card, .faq-item"
  );

  cards.forEach((card) => {
    // Skip applying effect on mobile devices
    if (window.innerWidth <= 992) return;

    // Remove existing listeners if re-initializing
    card.removeEventListener("mousemove", handleCardTilt);
    card.removeEventListener("mouseleave", resetCardTilt);

    // Add event listeners for the tilt effect
    card.addEventListener("mousemove", handleCardTilt);
    card.addEventListener("mouseleave", resetCardTilt);
  });
}

function handleCardTilt(e) {
  const card = this;

  // Skip processing if card has the disable-tilt attribute
  if (card.getAttribute("data-disable-tilt") === "true") return;

  // Skip processing if card has become detached from DOM
  if (!card.isConnected) return;

  const cardRect = card.getBoundingClientRect();
  const cardWidth = cardRect.width;
  const cardHeight = cardRect.height;

  // Calculate cursor position relative to the card
  const mouseX = e.clientX - cardRect.left;
  const mouseY = e.clientY - cardRect.top;

  // Calculate rotation based on cursor position
  // Convert position to percentage (-50 to 50)
  const rotateY = (mouseX / cardWidth - 0.5) * 20;
  const rotateX = (mouseY / cardHeight - 0.5) * -20;

  // Apply the 3D rotation and other effects
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

  // Add a subtle highlight effect based on mouse position
  const glowX = (mouseX / cardWidth) * 100;
  const glowY = (mouseY / cardHeight) * 100;

  // Apply a radial gradient to simulate light reflection
  if (
    card.classList.contains("feature-card") ||
    card.classList.contains("timeline-item") ||
    card.classList.contains("requirement-card")
  ) {
    card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(var(--bg-dark-3-rgb), 1) 0%, rgba(var(--bg-dark-3-rgb), 0.95) 50%, rgba(var(--bg-dark-3-rgb), 0.9) 100%)`;
  } else if (
    card.classList.contains("testimonial-card") ||
    card.classList.contains("faq-item")
  ) {
    card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(var(--bg-dark-3-rgb), 1) 0%, rgba(var(--bg-dark-3-rgb), 0.95) 50%, rgba(var(--bg-dark-3-rgb), 0.9) 100%)`;
  }

  // Add box shadow based on cursor position to enhance 3D effect
  const shadowX = (mouseX / cardWidth - 0.5) * 20;
  const shadowY = (mouseY / cardHeight - 0.5) * 20;
  card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.4)`;

  // Handle special elements on How It Works page
  if (card.classList.contains("timeline-item")) {
    const timelineContent = card.querySelector(".timeline-content");
    if (timelineContent) {
      timelineContent.style.transform = `translateZ(20px)`;
    }

    const timelineDate = card.querySelector(".timeline-date");
    if (timelineDate) {
      timelineDate.style.transform = `translateZ(30px) translateY(${
        rotateX / 2
      }px)`;
    }
  }

  if (card.classList.contains("requirement-card")) {
    const icon = card.querySelector(".requirement-icon");
    if (icon) {
      icon.style.transform = `translateX(${rotateY / 2}px) translateY(${
        rotateX / 2
      }px) scale(1.1)`;
    }
  }

  if (card.classList.contains("faq-item")) {
    const question = card.querySelector(".faq-question");
    if (question) {
      question.style.transform = `translateZ(10px)`;
    }
  }

  // If the card has an icon, make it follow the cursor slightly
  const icon = card.querySelector(".feature-icon");
  if (icon) {
    icon.style.transform = `translateX(${rotateY / 2}px) translateY(${
      rotateX / 2
    }px) scale(1.1)`;
  }

  // Apply a glow effect to links or buttons inside the card
  const buttons = card.querySelectorAll(".btn-primary, .hero-btn, .cta-btn");
  buttons.forEach((button) => {
    button.style.boxShadow = "0 0 15px rgba(var(--primary-rgb), 0.5)";
    button.style.transform = "translateZ(20px)";
  });
}

function resetCardTilt(e) {
  const card = this;

  // Reset all transforms and effects with a smooth transition
  card.style.transform = "";
  card.style.background = "";
  card.style.boxShadow = "";

  // Reset timeline specific elements
  if (card.classList.contains("timeline-item")) {
    const timelineContent = card.querySelector(".timeline-content");
    if (timelineContent) {
      timelineContent.style.transform = "";
    }

    const timelineDate = card.querySelector(".timeline-date");
    if (timelineDate) {
      timelineDate.style.transform = "";
    }
  }

  // Reset requirement card elements
  if (card.classList.contains("requirement-card")) {
    const icon = card.querySelector(".requirement-icon");
    if (icon) {
      icon.style.transform = "";
    }
  }

  // Reset FAQ items
  if (card.classList.contains("faq-item")) {
    const question = card.querySelector(".faq-question");
    if (question) {
      question.style.transform = "";
    }
  }

  // Reset icon position
  const icon = card.querySelector(".feature-icon");
  if (icon) {
    icon.style.transform = "";
  }

  // Reset button glow
  const buttons = card.querySelectorAll(".btn-primary, .hero-btn, .cta-btn");
  buttons.forEach((button) => {
    button.style.boxShadow = "";
    button.style.transform = "";
  });
}

// Mobile Navigation Toggle - Enhanced with better animations
function initMobileNavigation() {
  console.log("Initializing mobile navigation with fixed implementation");
  
  const hamburger = document.querySelector(".hamburger");
  const navElements = document.querySelector(".nav-elements");
  
  if (!hamburger || !navElements) {
    console.warn("Hamburger menu elements not found");
    return;
  }
  
  // First clear any existing event listeners to avoid duplication
  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);
  
  // Handle hamburger click
  newHamburger.addEventListener("click", function(e) {
    e.stopPropagation();
    console.log("Hamburger clicked");
    
    // Toggle hamburger active state
    this.classList.toggle("active");
    
    if (!navElements.classList.contains("active")) {
      // Opening the menu
      // First ensure visibility is set
      navElements.style.visibility = "visible";
      navElements.style.opacity = "1";
      
      // Add active class in the next frame for smooth animation
      requestAnimationFrame(() => {
        navElements.classList.add("active");
        document.body.classList.add("menu-open");
      });
      
      // Set up animated elements inside the menu
      const navItems = navElements.querySelectorAll(".nav-item");
      navItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateX(30px)";
        
        // Forced reflow to ensure animation works
        void item.offsetWidth;
        
        // Apply animations with staggered delays
        item.style.transition = "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)";
        item.style.transitionDelay = `${0.2 + (index * 0.15)}s`;
        item.style.opacity = "1";
        item.style.transform = "translateX(0)";
      });
      
      // Animate auth buttons separately
      const authBtns = navElements.querySelector(".auth-btns");
      if (authBtns) {
        authBtns.style.opacity = "0";
        authBtns.style.transform = "translateY(30px)";
        
        // Forced reflow
        void authBtns.offsetWidth;
        
        // Apply animation
        authBtns.style.transition = "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)";
        authBtns.style.transitionDelay = "0.8s";
        authBtns.style.opacity = "1";
        authBtns.style.transform = "translateY(0)";
      }
    } else {
      // Closing the menu
      document.body.classList.remove("menu-open");
      navElements.classList.remove("active");
      
      // Hide after animation completes
      setTimeout(() => {
        if (!navElements.classList.contains("active")) {
          navElements.style.visibility = "hidden";
          navElements.style.opacity = "0";
          
          // Reset navigation item styles
          const navItems = navElements.querySelectorAll(".nav-item");
          navItems.forEach(item => {
            item.style.transition = "";
            item.style.transitionDelay = "";
          });
          
          // Reset auth buttons styles
          const authBtns = navElements.querySelector(".auth-btns");
          if (authBtns) {
            authBtns.style.transition = "";
            authBtns.style.transitionDelay = "";
          }
        }
      }, 800); // Match transition duration
    }
  });
  
  // Close navigation when clicking outside
  document.addEventListener("click", function(e) {
    if (navElements.classList.contains("active") && 
        !navElements.contains(e.target) && 
        !newHamburger.contains(e.target)) {
      
      console.log("Closing menu by outside click");
      newHamburger.classList.remove("active");
      document.body.classList.remove("menu-open");
      navElements.classList.remove("active");
      
      setTimeout(() => {
        if (!navElements.classList.contains("active")) {
          navElements.style.visibility = "hidden";
          navElements.style.opacity = "0";
        }
      }, 800);
    }
  });
  
  // Close navigation when clicking on a link
  const navLinks = navElements.querySelectorAll(".nav-item a, .nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      if (window.innerWidth <= 768) {
        console.log("Navigation link clicked, closing menu");
        newHamburger.classList.remove("active");
        document.body.classList.remove("menu-open");
        navElements.classList.remove("active");
        
        setTimeout(() => {
          navElements.style.visibility = "hidden";
          navElements.style.opacity = "0";
        }, 800);
      }
    });
  });
  
  // Close on ESC key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && navElements.classList.contains("active")) {
      console.log("ESC pressed, closing menu");
      newHamburger.classList.remove("active");
      document.body.classList.remove("menu-open");
      navElements.classList.remove("active");
      
      setTimeout(() => {
        navElements.style.visibility = "hidden";
        navElements.style.opacity = "0";
      }, 800);
    }
  });
  
  // Force hamburger bar visibility
  const hamburgerBars = newHamburger.querySelectorAll(".bar");
  hamburgerBars.forEach(bar => {
    bar.style.backgroundColor = "var(--primary-color)";
    bar.style.display = "block";
    bar.style.width = "100%";
    bar.style.height = "2px";
    bar.style.margin = "5px auto";
    bar.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  });
  
  console.log("Mobile navigation initialization complete");
}

// Update the existing reinitializer function to include all effects
function reinitializeAllEffects() {
  // Reset visibility for animation elements
  forceVisibilityForAllElements();

  // Reset button animations
  reinitializeButtonAnimations();

  // Initialize mobile navigation
  initMobileNavigation();

  // Initialize hero buttons
  initializeHeroButtons();

  // Initialize card effects if not on mobile
  if (window.innerWidth > 992) {
    initCardTiltEffect();
  }

  // Initialize FAQ accordion
  initFaqAccordion();

  console.log("All effects reinitialized");
}

// Special handling for hero button animations
function initializeHeroButtons() {
  console.log("Initializing hero buttons with CTA-style hover effects");
  const heroButtons = document.querySelectorAll(".hero-buttons .hero-btn");

  heroButtons.forEach((button) => {
    // Clear any existing inline styles that might interfere
    button.style.removeProperty("transform");
    button.style.removeProperty("box-shadow");
    button.style.removeProperty("transition");

    // Set a smooth transition for all hover effects
    button.style.transition =
      "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    // Set initial transform state
    button.style.transform = "translateY(0)";

    // Set up enhanced hover effects similar to CTA buttons
    button.addEventListener("mouseenter", function () {
      // Apply CTA-like hover effect with translateY movement
      this.style.transform = "translateY(-5px)";

      if (this.classList.contains("primary")) {
        // Use the glow-accent variable for primary buttons
        this.style.boxShadow = "var(--glow-accent)";
      } else if (this.classList.contains("secondary")) {
        // Enhanced effect for secondary buttons
        this.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
        this.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
        this.style.borderColor = "rgba(255, 255, 255, 0.9)";
      }

      // Create a pseudo-element effect similar to CTA buttons
      // This is simulated since we can't directly modify ::before with JS
      this.style.backgroundImage =
        "linear-gradient(90deg, var(--accent-color), var(--primary-color))";
      this.style.backgroundSize = "200% auto";

      // Animate icon if present - enhanced movement
      const icon = this.querySelector("i");
      if (icon) {
        icon.style.transform = "translateX(8px)";
        icon.style.transition =
          "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      }
    });

    // Reset on mouse leave
    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "";
      this.style.backgroundColor = "";
      this.style.borderColor = "";

      // Reset background to original
      if (this.classList.contains("primary")) {
        this.style.backgroundImage =
          "linear-gradient(135deg, var(--primary-color), var(--accent-color))";
            } else {
        this.style.backgroundImage = "";
      }

      // Reset icon
      const icon = this.querySelector("i");
      if (icon) {
        icon.style.transform = "";
      }
    });

    // Add ripple effect
    button.removeEventListener("click", createRippleEffect);
    button.addEventListener("click", createRippleEffect);

    // Add special glow pulse effect on click
    button.addEventListener("click", function () {
      // Add a temporary enhanced glow effect on click
      const originalBoxShadow = this.style.boxShadow;
      this.style.boxShadow =
        "var(--glow-accent), 0 0 20px rgba(var(--primary-rgb), 0.8)";

      // Reset after animation
      setTimeout(() => {
                this.style.boxShadow = originalBoxShadow;
      }, 300);
    });
  });
}

// NEW FUNCTION to disable navbar animations
function disableNavbarAnimations() {
  console.log("Disabling navbar animations");

  // Remove animation classes from navigation elements
  const navElements = document.querySelectorAll(
    ".header, header, .nav-elements, .nav-links, .nav-item, .logo, .hamburger, .btn-login, .btn-signup, .nav-link"
  );

  navElements.forEach((el) => {
    // Remove any animation classes
    el.classList.remove(
      "animate-pop-up",
      "animate-on-scroll",
      "animated",
      "visible",
      "in-view"
    );

    // Remove any animation or transform styles
    el.style.animation = "none";
    el.style.transform = "none";
    el.style.opacity = "1";
    el.style.visibility = "visible";

    // Remove any delay classes
    el.classList.remove(
      "delay-100",
      "delay-200",
      "delay-300",
      "delay-400",
      "delay-500"
    );

    // Remove any animation-related event listeners (cannot directly do this, but can prevent them from having effect)
    el.setAttribute("data-no-animation", "true");
  });
}

// Add this new function to fix testimonial card animations
function fixTestimonialCardAnimations() {
  console.log("Fixing testimonial card animations with 3D effects");

  // Get all testimonial cards in the "What Our Users Say" section
  const testimonialCards = document.querySelectorAll(".testimonial-card");

  if (!testimonialCards.length) {
    console.log("No testimonial cards found on page");
                    return;
                }
                
  // Remove any problematic animation or transform styles
  testimonialCards.forEach((card) => {
    // Remove animation classes that might be causing conflicts
    card.classList.remove(
      "animate-pop-up",
      "animate-on-scroll",
      "animated",
      "visible",
      "in-view"
    );

    // Apply proper 3D styles
    card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
    card.style.transform = "translateY(0) rotateY(0)";
    card.style.opacity = "1";
    card.style.visibility = "visible";

    // Enable proper 3D transforms
    card.style.transformStyle = "preserve-3d";
    card.style.backfaceVisibility = "hidden";
    card.style.perspective = "1000px";

    // Reset any animations that might be running
    card.style.animation = "none";

    // Set an initial box-shadow that looks good without animation
    card.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";

    // Remove data-disable-tilt attribute to allow 3D tilt effects
    card.removeAttribute("data-disable-tilt");

    // Remove event listeners for mouse interactions (can't directly remove unknown listeners)
    card.replaceWith(card.cloneNode(true));
  });

  // Re-add enhanced 3D hover effect
  const freshCards = document.querySelectorAll(".testimonial-card");
  freshCards.forEach((card) => {
    // Enable controlled tilt effect
    card.addEventListener("mouseenter", function () {
      // Apply a controlled 3D transform
      const isEven = Array.from(freshCards).indexOf(this) % 2 === 0;
      const rotateDirection = isEven ? 3 : -3; // Alternate rotation direction

      this.style.transform = `translateY(-10px) rotateY(${rotateDirection}deg)`;
      this.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.2)";
      this.style.borderColor = "var(--primary-color)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) rotateY(0)";
      this.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
      this.style.borderColor = "var(--bg-dark-4)";
        });
    });
    
  console.log("Fixed testimonial card animations with 3D effects");
}

// Initialize operator plan animations - disabled since section was removed
function initOperatorPlanAnimations() {
  console.log("Operator plan animations disabled - section removed");
  window._mainJsInitialized.operatorPlanAnimations = true;
}

// Initialize recommendation card animations - disabled since section was removed
function initRecommendationCardAnimations() {
  console.log("Recommendation card animations disabled - section removed");
  // No initialization needed as the section was removed
}

// Initialize the about page animations
function initAboutPageAnimations() {
  console.log("Initializing about page animations");
  
  // Only run on the about page
  if (!document.querySelector('.about-section')) {
                    return;
                }
                
  // Apply 3D tilt effect to mission items
  const missionItems = document.querySelectorAll('.mission-item');
  missionItems.forEach(item => {
    // Add 3D tilt effect on mousemove
    item.addEventListener('mousemove', function(e) {
      // Only apply 3D effect if not on mobile
      if (window.innerWidth <= 768) return;
      
      try {
        // Calculate mouse position relative to the item
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation based on mouse position (subtle effect)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 4; // max 4 degrees
        const rotateX = ((centerY - y) / centerY) * 4; // max 4 degrees
        
        // Apply the rotation with a smooth transition
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px)`;
        
        // Apply highlight effect based on mouse position
        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;
        this.style.backgroundImage = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(var(--bg-dark-2-rgb), 0.9) 0%, rgba(var(--bg-dark-3-rgb), 0.9) 80%)`;
        
        // Enhance the box shadow based on mouse position
        const shadowX = (x / rect.width - 0.5) * 10;
        const shadowY = (y / rect.height - 0.5) * 10;
        this.style.boxShadow = `
          ${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.2),
          0 0 20px rgba(var(--primary-rgb), 0.15)
        `;
        
        // Animate the icon to follow mouse movement
        const icon = this.querySelector('.mission-icon');
        if (icon) {
          icon.style.transform = `translateX(${rotateY * 2}px) translateY(${-rotateX * 2}px) scale(1.1)`;
        }
        
        // Lift the heading slightly
        const heading = this.querySelector('h3');
        if (heading) {
          heading.style.transform = `translateZ(15px)`;
          heading.style.textShadow = `0 2px 5px rgba(0, 0, 0, 0.2)`;
        }
      } catch (error) {
        console.warn('Error applying 3D effect to mission item:', error);
      }
    });
    
    // Reset the 3D effect on mouse leave
    item.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      this.style.backgroundImage = '';
      
      const icon = this.querySelector('.mission-icon');
      if (icon) {
        icon.style.transform = '';
      }
      
      const heading = this.querySelector('h3');
      if (heading) {
        heading.style.transform = '';
        heading.style.textShadow = '';
      }
    });
  });
  
  // Apply 3D tilt effect to team members
  const teamMembers = document.querySelectorAll('.team-member');
  teamMembers.forEach(member => {
    member.addEventListener('mousemove', function(e) {
      // Only apply 3D effect if not on mobile
      if (window.innerWidth <= 768) return;
      
      try {
        // Calculate mouse position relative to the card
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation based on mouse position (subtle effect)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 3; // max 3 degrees
        const rotateX = ((centerY - y) / centerY) * 3; // max 3 degrees
        
        // Apply the rotation with a smooth transition
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px)`;
        
        // Enhance the box shadow
        this.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(var(--primary-rgb), 0.2)`;
        
        // Add special effects to image
        const img = this.querySelector('.team-member-image img');
        if (img) {
          img.style.transform = `scale(1.1) translateZ(20px)`;
        }
        
        // Lift the team member info
        const info = this.querySelector('.team-member-info');
        if (info) {
          info.style.transform = `translateZ(20px)`;
        }
        
        // Animate social icons
        const socialIcons = this.querySelectorAll('.team-member-social a');
        socialIcons.forEach((icon, index) => {
          icon.style.transform = `translateY(-${5 + index * 2}px)`;
        });
      } catch (error) {
        console.warn('Error applying 3D effect to team member:', error);
      }
    });
    
    // Reset the 3D effect on mouse leave
    member.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      
      const img = this.querySelector('.team-member-image img');
      if (img) {
        img.style.transform = '';
      }
      
      const info = this.querySelector('.team-member-info');
      if (info) {
        info.style.transform = '';
      }
      
      const socialIcons = this.querySelectorAll('.team-member-social a');
      socialIcons.forEach(icon => {
        icon.style.transform = '';
      });
    });
  });
  
  // Apply 3D tilt effect to achievement cards
  const achievementCards = document.querySelectorAll('.achievement-card');
  achievementCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      // Only apply 3D effect if not on mobile
      if (window.innerWidth <= 768) return;
      
      try {
        // Calculate mouse position relative to the card
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation based on mouse position (subtle effect)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 5; // max 5 degrees
        const rotateX = ((centerY - y) / centerY) * 5; // max 5 degrees
        
        // Apply the rotation with a smooth transition
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.05)`;
        
        // Apply highlight effect based on mouse position
        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;
        this.style.backgroundImage = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(var(--bg-dark-2-rgb), 1) 0%, rgba(var(--bg-dark-3-rgb), 0.9) 80%)`;
        
        // Enhance the box shadow
        this.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(var(--primary-rgb), 0.2)`;
        
        // Animate the icon
        const icon = this.querySelector('.achievement-icon');
        if (icon) {
          icon.style.transform = `translateX(${rotateY * 1.5}px) translateY(${-rotateX * 1.5}px) rotate(${rotateY}deg) scale(1.2)`;
        }
        
        // Lift the heading
        const heading = this.querySelector('h3');
        if (heading) {
          heading.style.transform = `translateZ(20px)`;
          heading.style.textShadow = `0 2px 5px rgba(0, 0, 0, 0.2)`;
        }
        
        // Lift the paragraph
        const paragraph = this.querySelector('p');
        if (paragraph) {
          paragraph.style.transform = `translateZ(10px)`;
        }
      } catch (error) {
        console.warn('Error applying 3D effect to achievement card:', error);
      }
    });
    
    // Reset the 3D effect on mouse leave
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      this.style.backgroundImage = '';
      
      const icon = this.querySelector('.achievement-icon');
      if (icon) {
        icon.style.transform = '';
      }
      
      const heading = this.querySelector('h3');
      if (heading) {
        heading.style.transform = '';
        heading.style.textShadow = '';
      }
      
      const paragraph = this.querySelector('p');
      if (paragraph) {
        paragraph.style.transform = '';
      }
    });
  });
  
  // Apply parallax effect to about section image
  const aboutImage = document.querySelector('.about-image');
  if (aboutImage) {
    window.addEventListener('scroll', function() {
      // Simple parallax effect
      const scrollPosition = window.scrollY;
      aboutImage.style.transform = `translateY(${scrollPosition * 0.05}px)`;
    });
  }
  
  // Add scroll-triggered animations for statistic counters
  const statItems = document.querySelectorAll('.stat-item h3');
  
  // Animate number counter when stat items come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statValue = entry.target.innerText;
        const targetNumber = parseInt(statValue.replace(/[^\d]/g, ''));
        
        // Start from zero and count up
        let currentNumber = 0;
        const duration = 2000; // 2 seconds
        const interval = 16; // Update every ~16ms for smooth 60fps
        const steps = duration / interval;
        const increment = targetNumber / steps;
        
        // Counter animation
        const counter = setInterval(() => {
          currentNumber += increment;
          
          // Check if we've reached the target
          if (currentNumber >= targetNumber) {
            entry.target.innerText = statValue; // Set to original text
            clearInterval(counter);
    } else {
            // Format the number based on the original format
            if (statValue.includes('K+')) {
              entry.target.innerText = `${Math.floor(currentNumber)}K+`;
            } else if (statValue.includes('%')) {
              entry.target.innerText = `${Math.floor(currentNumber)}%`;
            } else {
              entry.target.innerText = `${Math.floor(currentNumber)}`;
            }
          }
        }, interval);
        
        // Stop observing after animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  
  // Start observing
  statItems.forEach(stat => {
    observer.observe(stat);
  });
  
  console.log("About page animations initialized");
}

// Contact Page Animations and Interactivity
function initContactPageAnimations() {
    console.log("Initializing contact page animations");
    
    // Make sure contact elements are visible
    ensureContactElementsVisibility();
    
    // Get in Touch section enhancements
    enhanceGetInTouchSection();
    
    // Initialize Port Forward animations
    initPortForwardAnimations();
    
    // Initialize Contact Form
    initContactForm();
    
    function enhanceGetInTouchSection() {
        const infoItems = document.querySelectorAll('.info-item');
        const infoHeader = document.querySelector('.info-header');
        const socialLinks = document.querySelector('.social-links');
        const infoIcon = document.querySelector('.info-icon');
        const formIcon = document.querySelector('.form-icon');
        const formHeader = document.querySelector('.form-header');
        
        // Add enhanced interactive effects to the form icon
        if (formIcon) {
            // Add a 3D perspective effect on mouse move
            formIcon.addEventListener('mousemove', function(e) {
                const iconRect = this.getBoundingClientRect();
                const mouseX = e.clientX - iconRect.left - iconRect.width / 2;
                const mouseY = e.clientY - iconRect.top - iconRect.height / 2;
                
                // Calculate rotation based on mouse position (max 10 degrees)
                const maxRotation = 10;
                const rotateX = (mouseY / (iconRect.height / 2)) * -maxRotation;
                const rotateY = (mouseX / (iconRect.width / 2)) * maxRotation;
                
                // Apply the rotation transform
                this.style.transform = `perspective(300px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                
                // Create a dynamic shine effect
                const shine = this.querySelector('::before');
                if (shine) {
                    const x = (mouseX / iconRect.width) * 100 + 50;
                    const y = (mouseY / iconRect.height) * 100 + 50;
                    this.style.setProperty('--shine-position', `${x}% ${y}%`);
                }
            });
            
            // Reset on mouse out
            formIcon.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            
            // Add a click effect
            formIcon.addEventListener('click', function() {
                // Create a ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('icon-ripple');
                ripple.style.position = 'absolute';
                ripple.style.top = '0';
                ripple.style.left = '0';
                ripple.style.width = '100%';
                ripple.style.height = '100%';
                ripple.style.borderRadius = '50%';
                ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
                ripple.style.zIndex = '4';
                
                this.appendChild(ripple);
                
                // Trigger the animation
                setTimeout(() => {
                    ripple.style.transform = 'scale(2)';
                    ripple.style.opacity = '0';
                }, 10);
                
                // Animate the icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.animation = 'none';
                    icon.style.transform = 'translateY(5px) rotate(10deg)';
                    
                    setTimeout(() => {
                        icon.style.transform = 'translateY(-10px) rotate(-15deg)';
                        
                        setTimeout(() => {
                            icon.style.transform = '';
                            icon.style.animation = 'paperPlaneFloat 3s ease-in-out infinite';
                        }, 200);
                    }, 200);
                }
                
                // Clean up the ripple element
                setTimeout(() => {
                    ripple.remove();
                }, 800);
            });
        }
        
        // Add subtle hover effect to the form header
        if (formHeader) {
            formHeader.addEventListener('mouseover', function() {
                const formIcon = this.querySelector('.form-icon');
                if (formIcon) {
                    formIcon.style.transform = 'scale(1.05) rotate(5deg)';
                    setTimeout(() => {
                        formIcon.style.transform = '';
                    }, 300);
                }
            });
        }
        
        // Add enhanced interactive effects to the info icon
        if (infoIcon) {
            // Add a 3D perspective effect on mouse move
            infoIcon.addEventListener('mousemove', function(e) {
                const iconRect = this.getBoundingClientRect();
                const mouseX = e.clientX - iconRect.left - iconRect.width / 2;
                const mouseY = e.clientY - iconRect.top - iconRect.height / 2;
                
                // Calculate rotation based on mouse position (max 10 degrees)
                const maxRotation = 10;
                const rotateX = (mouseY / (iconRect.height / 2)) * -maxRotation;
                const rotateY = (mouseX / (iconRect.width / 2)) * maxRotation;
                
                // Apply the rotation transform
                this.style.transform = `perspective(300px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                
                // Create a dynamic shine effect
                const shine = this.querySelector('::before');
                if (shine) {
                    const x = (mouseX / iconRect.width) * 100 + 50;
                    const y = (mouseY / iconRect.height) * 100 + 50;
                    this.style.setProperty('--shine-position', `${x}% ${y}%`);
                }
            });
            
            // Reset on mouse out
            infoIcon.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            
            // Add a click effect
            infoIcon.addEventListener('click', function() {
                // Create a ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('icon-ripple');
                ripple.style.position = 'absolute';
                ripple.style.top = '0';
                ripple.style.left = '0';
                ripple.style.width = '100%';
                ripple.style.height = '100%';
                ripple.style.borderRadius = '50%';
                ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
                ripple.style.zIndex = '4';
                
                this.appendChild(ripple);
                
                // Trigger the animation
                setTimeout(() => {
                    ripple.style.transform = 'scale(2)';
                    ripple.style.opacity = '0';
                }, 10);
                
                // Animate the icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.animation = 'none';
                    icon.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        icon.style.transform = 'scale(1.2)';
                        
                        setTimeout(() => {
                            icon.style.transform = '';
                            icon.style.animation = 'pulseAndRotate 3s ease-in-out infinite';
                        }, 200);
                    }, 200);
                }
                
                // Clean up the ripple element
                setTimeout(() => {
                    ripple.remove();
                }, 800);
            });
        }
        
        // Add subtle shimmer effect to the info header on hover
        if (infoHeader) {
            infoHeader.addEventListener('mouseover', function() {
                const infoIcon = this.querySelector('.info-icon');
                if (infoIcon) {
                    infoIcon.style.transform = 'scale(1.05) rotate(5deg)';
                    setTimeout(() => {
                        infoIcon.style.transform = '';
                    }, 300);
                }
            });
        }
        
        // Add hover effects to info items
        if (infoItems && infoItems.length > 0) {
            infoItems.forEach(item => {
                item.addEventListener('mouseover', function() {
                    // Add a subtle background animation
                    this.style.transition = 'all 0.3s ease';
                    
                    // Find the icon and add a bounce effect
                    const icon = this.querySelector('.item-icon i');
                    if (icon) {
                        icon.style.transition = 'all 0.3s ease';
                        icon.style.transform = 'scale(1.2)';
                        icon.style.color = 'var(--accent-color)';
                    }
                });
                
                item.addEventListener('mouseout', function() {
                    // Reset styles
                    const icon = this.querySelector('.item-icon i');
                    if (icon) {
                        icon.style.transform = 'scale(1)';
                        icon.style.color = 'var(--primary-color)';
                    }
                });
            });
        }
        
        // Add interactive effect to social links
        if (socialLinks) {
            const socialIcons = socialLinks.querySelectorAll('.social-icons a');
            if (socialIcons && socialIcons.length > 0) {
                socialIcons.forEach(icon => {
                    icon.addEventListener('mouseover', function() {
                        // Create a ripple effect
                        const ripple = document.createElement('span');
                        ripple.classList.add('social-ripple');
                        ripple.style.position = 'absolute';
                        ripple.style.top = '0';
                        ripple.style.left = '0';
                        ripple.style.width = '100%';
                        ripple.style.height = '100%';
                        ripple.style.borderRadius = '50%';
                        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        ripple.style.transform = 'scale(0)';
                        ripple.style.transition = 'transform 0.6s ease-out';
                        
                        this.appendChild(ripple);
                        
                        // Trigger the animation
                        setTimeout(() => {
                            ripple.style.transform = 'scale(1.5)';
                            ripple.style.opacity = '0';
                        }, 10);
                        
                        // Clean up the ripple element
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
            }
        }
    }
    
    function ensureContactElementsVisibility() {
        // ... existing code ...
    }
    
    function initPortForwardAnimations() {
        // ... existing code ...
    }
}

// Contact Form Validation and Interactivity
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const formInputs = contactForm.querySelectorAll('.form-control');
    const formGroups = contactForm.querySelectorAll('.form-group');
    
    // Add floating effect to icons on input focus
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            const icon = this.parentElement.querySelector('i');
            if (icon) {
                icon.classList.add('floating');
            }
        });
        
        input.addEventListener('blur', function() {
            const icon = this.parentElement.querySelector('i');
            if (icon) {
                icon.classList.remove('floating');
            }
        });
    });
    
    // Real-time validation
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
        
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // Form submission with validation
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        formInputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Show success message
            const formSuccess = document.createElement('div');
            formSuccess.className = 'form-success';
            formSuccess.innerHTML = `
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="success-message">
                    <h3>Message Sent Successfully!</h3>
                    <p>Thank you for reaching out. We'll get back to you shortly.</p>
                </div>
            `;
            
            // Replace form with success message
            contactForm.style.opacity = '0';
            setTimeout(() => {
                contactForm.innerHTML = '';
                contactForm.appendChild(formSuccess);
                contactForm.style.opacity = '1';
            }, 500);
            
            // Reset form after 5 seconds
            setTimeout(() => {
                location.reload();
            }, 5000);
        }
    });
    
    // Helper function to validate inputs
    function validateInput(input) {
        const errorElement = input.parentElement.parentElement.querySelector('.error-message');
        let isValid = true;
        
        // Clear previous error
        errorElement.style.display = 'none';
        errorElement.textContent = '';
        
        // Check if empty
        if (input.hasAttribute('required') && !input.value.trim()) {
            errorElement.textContent = 'This field is required';
            errorElement.style.display = 'block';
            isValid = false;
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                errorElement.textContent = 'Please enter a valid email address';
                errorElement.style.display = 'block';
                isValid = false;
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value.trim()) {
            const phoneRegex = /^[\d\s+()-]{10,15}$/;
            if (!phoneRegex.test(input.value.replace(/\s+/g, ''))) {
                errorElement.textContent = 'Please enter a valid phone number';
                errorElement.style.display = 'block';
                isValid = false;
            }
        }
        
        // Update input styling based on validation
        if (!isValid) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid');
        }
        
        return isValid;
    }
    
    // Add ripple effect to form button
    const formBtn = contactForm.querySelector('.form-btn');
    if (formBtn) {
        formBtn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
}

// Initialize the contact form when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});
