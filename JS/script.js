import { validateEmail, validatePhone, showError, clearError } from './utils.js';

// Form Validation function
export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};

// Init function to setup all DOM-related functionality
export const initScriptFunctionality = () => {
    console.log('Initializing script functionality');
    
    try {
        // Mobile Menu Toggle - Using querySelector safely
        const menuToggle = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-elements');

        console.log('Menu elements found:', {menuToggle: !!menuToggle, navLinks: !!navLinks});

        // Add null checks before using these elements
        if (menuToggle && navLinks) {
            console.log('Setting up mobile menu toggle');
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active') && 
                    !e.target.closest('.navbar-content') &&
                    !e.target.closest('.hamburger')) {
                    navLinks.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        } else {
            console.warn('Mobile menu elements not found: ', 
                menuToggle ? 'navLinks missing' : 'menuToggle missing');
        }

        // Password Toggle Visibility
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        if (passwordToggles && passwordToggles.length > 0) {
            console.log('Setting up password toggles');
            passwordToggles.forEach(toggle => {
                if (toggle) {
                    toggle.addEventListener('click', () => {
                        const input = toggle.previousElementSibling;
                        const icon = toggle.querySelector('i');
                        
                        if (input && input.type === 'password') {
                            input.type = 'text';
                            if (icon) {
                                icon.classList.remove('fa-eye');
                                icon.classList.add('fa-eye-slash');
                            }
                        } else if (input) {
                            input.type = 'password';
                            if (icon) {
                                icon.classList.remove('fa-eye-slash');
                                icon.classList.add('fa-eye');
                            }
                        }
                    });
                }
            });
        } else {
            console.log('No password toggles found');
        }
        
        // Login Form Validation
        const loginForm = document.getElementById('loginForm');

        if (loginForm) {
            console.log('Setting up login form validation');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                let isValid = true;
                
                const email = loginForm.querySelector('#email');
                const password = loginForm.querySelector('#password');
                
                // Validate Email
                if (email && !email.value.trim()) {
                    showError(email, 'Email is required');
                    isValid = false;
                } else if (email && !validateEmail(email.value)) {
                    showError(email, 'Please enter a valid email address');
                    isValid = false;
                } else if (email) {
                    clearError(email);
                }
                
                // Validate Password
                if (password && !password.value.trim()) {
                    showError(password, 'Password is required');
                    isValid = false;
                } else if (password) {
                    clearError(password);
                }
                
                if (isValid) {
                    // Here you would typically send the form data to a server
                    console.log('Login form submitted successfully');
                    loginForm.reset();
                }
            });
        } else {
            console.log('No login form found');
        }

        // Setup all other functionality...
        setupFAQAccordion();
        setupSmoothScroll();
        updateCopyrightYear();
        setupAnimations();
        setupStickyNavigation();
        setupSignupForm();
        
        console.log('Script functionality initialized successfully');
    } catch (error) {
        console.error('Error initializing script functionality:', error);
    }
};

// Helper functions broken out for clarity
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        console.log('Setting up signup form validation');
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            const name = signupForm.querySelector('#name');
            const email = signupForm.querySelector('#email');
            const phone = signupForm.querySelector('#phone');
            const password = signupForm.querySelector('#password');
            const confirmPassword = signupForm.querySelector('#confirm-password');
            const terms = signupForm.querySelector('#terms');
            
            // Validate Name
            if (name && !name.value.trim()) {
                showError(name, 'Name is required');
                isValid = false;
            } else if (name) {
                clearError(name);
            }
            
            // Validate Email
            if (email && !email.value.trim()) {
                showError(email, 'Email is required');
                isValid = false;
            } else if (email && !validateEmail(email.value)) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            } else if (email) {
                clearError(email);
            }
            
            // Validate Phone
            if (phone && !phone.value.trim()) {
                showError(phone, 'Phone number is required');
                isValid = false;
            } else if (phone && !validatePhone(phone.value)) {
                showError(phone, 'Please enter a valid 10-digit phone number');
                isValid = false;
            } else if (phone) {
                clearError(phone);
            }
            
            // Validate Password
            if (password && !password.value.trim()) {
                showError(password, 'Password is required');
                isValid = false;
            } else if (password && !validatePassword(password.value)) {
                showError(password, 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
                isValid = false;
            } else if (password) {
                clearError(password);
            }
            
            // Validate Confirm Password
            if (confirmPassword && !confirmPassword.value.trim()) {
                showError(confirmPassword, 'Please confirm your password');
                isValid = false;
            } else if (confirmPassword && password && confirmPassword.value !== password.value) {
                showError(confirmPassword, 'Passwords do not match');
                isValid = false;
            } else if (confirmPassword) {
                clearError(confirmPassword);
            }
            
            // Validate Terms
            if (terms && !terms.checked) {
                const errorElement = terms.parentElement.nextElementSibling;
                if (errorElement) {
                    errorElement.textContent = 'You must agree to the Terms of Service and Privacy Policy';
                }
                isValid = false;
            } else if (terms) {
                const errorElement = terms.parentElement.nextElementSibling;
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
            
            if (isValid) {
                // Here you would typically send the form data to a server
                console.log('Signup form submitted successfully');
                signupForm.reset();
            }
        });
    } else {
        console.log('No signup form found');
    }
}

function setupFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    if (faqQuestions && faqQuestions.length > 0) {
        console.log('Setting up FAQ accordion');
        faqQuestions.forEach(question => {
            if (question) {
                question.addEventListener('click', () => {
                    const answer = question.nextElementSibling;
                    if (!answer) return;
                    
                    // Close all other answers
                    faqQuestions.forEach(q => {
                        if (q !== question && q) {
                            q.classList.remove('active');
                            const nextEl = q.nextElementSibling;
                            if (nextEl) {
                                nextEl.classList.remove('active');
                            }
                        }
                    });
                    
                    // Toggle current answer
                    question.classList.toggle('active');
                    answer.classList.toggle('active');
                });
            }
        });
    } else {
        console.log('No FAQ questions found');
    }
}

function setupSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    if (anchors && anchors.length > 0) {
        console.log('Setting up smooth scroll');
        anchors.forEach(anchor => {
            if (anchor) {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetSelector = this.getAttribute('href');
                    if (!targetSelector) return;
                    
                    const target = document.querySelector(targetSelector);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
        });
    } else {
        console.log('No anchor links found');
    }
}

function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    
    if (yearElement) {
        console.log('Updating copyright year');
        yearElement.textContent = currentYear;
    } else {
        console.log('No copyright year element found');
    }
}

function setupAnimations() {
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, {
        threshold: 0.1
    });

    const elements = document.querySelectorAll('.feature-card, .step-card, .testimonial-card');
    
    if (elements && elements.length > 0) {
        console.log('Setting up animations');
        elements.forEach(element => {
            if (element) {
                observer.observe(element);
            }
        });
    } else {
        console.log('No elements found for animations');
    }
}

function setupStickyNavigation() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        console.log('Setting up sticky navigation');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                navbar.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
                navbar.classList.remove('scroll-up');
                navbar.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
                navbar.classList.remove('scroll-down');
                navbar.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
        });
    } else {
        console.log('No navbar found');
    }
}

// Run the initialization
// Remove the auto-initialization to prevent it from running automatically
// Let script-init.js handle the initialization instead
/*
try {
    console.log('Auto-initializing script functionality');
    // Check if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Document already loaded, initialize now
        setTimeout(initScriptFunctionality, 0);
    } else {
        // Wait for document to load
        document.addEventListener('DOMContentLoaded', initScriptFunctionality);
    }
} catch (error) {
    console.error('Error auto-initializing script functionality:', error);
}
*/

// Additional defensive coding to ensure the module only exports the functionality
// without trying to access DOM elements on import 