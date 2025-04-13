import { validateEmail, validatePhone, showError, clearError } from './utils.js';

// Form Validation Functions
const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
};

// Show form message (success or error)
const showFormMessage = (form, message, isSuccess = false) => {
    // Remove any existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${isSuccess ? 'success' : 'error'}`;
    messageElement.textContent = message;
    messageElement.style.padding = '10px';
    messageElement.style.marginTop = '15px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.textAlign = 'center';
    
    if (isSuccess) {
        messageElement.style.backgroundColor = 'rgba(var(--success-rgb), 0.1)';
        messageElement.style.color = 'var(--success)';
        messageElement.style.border = '1px solid var(--success)';
    } else {
        messageElement.style.backgroundColor = 'rgba(var(--error-rgb), 0.1)';
        messageElement.style.color = 'var(--error)';
        messageElement.style.border = '1px solid var(--error)';
    }
    
    // Insert before submit button
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.parentElement.insertBefore(messageElement, submitButton);
    
    // Remove after 5 seconds if success
    if (isSuccess) {
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
};

// Password Toggle Visibility
const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        const icon = toggle.querySelector('i');
        
        // Add null checks to prevent errors
        if (!input || !icon) {
            console.warn('Password toggle missing required elements', toggle);
            return;
        }
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Check auth state and update UI accordingly
document.addEventListener('DOMContentLoaded', () => {
    // If API client is loaded
    if (window.PortMySimAPI) {
        // Check if user is authenticated
        if (window.PortMySimAPI.isAuthenticated()) {
            const user = window.PortMySimAPI.getUser();
            
            // Update auth buttons in nav if they exist
            const authBtns = document.querySelector('.auth-btns');
            if (authBtns) {
                const firstLetter = user.name.charAt(0).toUpperCase();
                authBtns.innerHTML = `
                    <div class="user-profile-dropdown">
                        <div class="user-profile-circle" title="${user.name}">
                            ${firstLetter}
                        </div>
                        <div class="dropdown-menu">
                            <span class="user-greeting">Hello, ${user.name.split(' ')[0]}</span>
                            <a href="/HTML/dashboard.html" class="dropdown-item">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                            <a href="/HTML/schedule-porting.html" class="dropdown-item">
                                <i class="fas fa-calendar-alt"></i> Schedule Porting
                            </a>
                            <button id="logoutBtn" class="dropdown-item">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                `;
                
                // Setup dropdown functionality after DOM update
                setupProfileDropdown();
            }
            
            // Redirect if on login/signup pages
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('signup.html')) {
                window.location.href = '/HTML/schedule-porting.html';
            }
        }
    }
});

// Setup profile dropdown functionality
function setupProfileDropdown() {
    try {
        const profileCircle = document.querySelector('.user-profile-circle');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        // Only setup listeners if both elements exist
        if (!profileCircle || !dropdownMenu) {
            console.log('Profile dropdown elements not found, skipping setup');
            return;
        }
        
        // Toggle dropdown when clicking the profile circle
        profileCircle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        // Prevent dropdown from closing when clicking inside it
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Close dropdown when clicking outside - store a reference to the click handler
        const documentClickHandler = () => {
            // First check if the element still exists in the DOM
            const menuStillExists = document.querySelector('.dropdown-menu');
            if (menuStillExists && document.contains(menuStillExists)) {
                menuStillExists.classList.remove('active');
            } else {
                // If element no longer exists, remove this event listener
                document.removeEventListener('click', documentClickHandler);
            }
        };
        
        // Add the click handler
        document.addEventListener('click', documentClickHandler);
        
        // Add logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.PortMySimAPI.auth.logout();
            });
        }
    } catch (error) {
        console.error('Error setting up profile dropdown:', error);
    }
}

// Login Form Validation
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        
        const email = loginForm.querySelector('#email');
        const password = loginForm.querySelector('#password');
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        // Validate Email
        if (!email.value.trim()) {
            showError(email, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(email);
        }
        
        // Validate Password
        if (!password.value.trim()) {
            showError(password, 'Password is required');
            isValid = false;
        } else {
            clearError(password);
        }
        
        if (isValid && window.PortMySimAPI) {
            try {
                // Disable button and show loading
                submitButton.disabled = true;
                submitButton.textContent = 'Logging in...';
                
                // Call login API
                const response = await window.PortMySimAPI.auth.login(
                    email.value.trim(), 
                    password.value.trim()
                );
                
                if (response.success) {
                    // Show success message
                    showFormMessage(loginForm, 'Login successful! Redirecting...', true);
                    
                    // Redirect to schedule-porting page
                    setTimeout(() => {
                        window.location.href = '/HTML/schedule-porting.html';
                    }, 1000);
                } else {
                    // Show error
                    showFormMessage(loginForm, response.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                // Show error message
                showFormMessage(loginForm, error.message || 'Login failed. Please try again.');
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = 'Log In';
            }
        }
    });
}

// Signup Form Validation
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    console.log('Signup form found, attaching event listener');
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Get form elements with null checks
        const name = signupForm.querySelector('#name');
        const email = signupForm.querySelector('#email');
        const phone = signupForm.querySelector('#phone');
        const password = signupForm.querySelector('#password');
        const confirmPassword = signupForm.querySelector('#confirm-password');
        const terms = signupForm.querySelector('#terms');
        const submitButton = signupForm.querySelector('button[type="submit"]');
        
        // Log form elements to help debug
        console.log('Form elements found:', {
            name: !!name,
            email: !!email,
            phone: !!phone,
            password: !!password,
            confirmPassword: !!confirmPassword,
            terms: !!terms,
            submitButton: !!submitButton
        });
        
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
            showError(phone, 'Please enter a valid Indian mobile number (10 digits starting with 6-9)');
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
            showError(terms, 'You must agree to the Terms of Service and Privacy Policy');
            isValid = false;
        } else if (terms) {
            clearError(terms);
        }
        
        if (isValid && window.PortMySimAPI && name && email && phone && password) {
            try {
                console.log('Form is valid, attempting to create account');
                
                // Disable button and show loading
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Creating Account...';
                }
                
                // Call register API
                const response = await window.PortMySimAPI.auth.register({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    password: password.value.trim()
                });
                
                if (response.success) {
                    // Show success message
                    showFormMessage(signupForm, 'Account created successfully! Redirecting...', true);
                    
                    // Redirect to schedule-porting page
                    setTimeout(() => {
                        window.location.href = '/HTML/schedule-porting.html';
                    }, 1500);
                } else {
                    // Show error
                    showFormMessage(signupForm, response.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                // Show error message
                showFormMessage(signupForm, error.message || 'Registration failed. Please try again.');
            } finally {
                // Re-enable button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Create Account';
                }
            }
        } else if (!window.PortMySimAPI) {
            showFormMessage(signupForm, 'API connection error. Please try again later.');
            console.error('PortMySimAPI not available');
        }
    });
}

// Add forgot password functionality
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        
        const email = forgotPasswordForm.querySelector('#email');
        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
        
        // Validate Email
        if (!email.value.trim()) {
            showError(email, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(email);
        }
        
        if (isValid && window.PortMySimAPI) {
            try {
                // Disable button and show loading
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';
                
                // Call forgot password API
                const response = await window.PortMySimAPI.auth.forgotPassword(email.value.trim());
                
                if (response.success) {
                    // Show success message
                    showFormMessage(forgotPasswordForm, 'Password reset email sent! Check your inbox.', true);
                    email.value = ''; // Clear the email field
                } else {
                    // Show error
                    showFormMessage(forgotPasswordForm, response.message || 'Request failed. Please try again.');
                }
            } catch (error) {
                // Show error message
                showFormMessage(forgotPasswordForm, error.message || 'Request failed. Please try again.');
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = 'Reset Password';
            }
        }
    });
}

// Add reset password functionality
const resetPasswordForm = document.getElementById('resetPasswordForm');

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        
        const password = resetPasswordForm.querySelector('#password');
        const confirmPassword = resetPasswordForm.querySelector('#confirm-password');
        const submitButton = resetPasswordForm.querySelector('button[type="submit"]');
        
        // Get reset token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');
        
        if (!resetToken) {
            showFormMessage(resetPasswordForm, 'Invalid or missing reset token. Please request a new password reset.');
            return;
        }
        
        // Validate Password
        if (!password.value.trim()) {
            showError(password, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password.value)) {
            showError(password, 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
            isValid = false;
        } else {
            clearError(password);
        }
        
        // Validate Confirm Password
        if (!confirmPassword.value.trim()) {
            showError(confirmPassword, 'Please confirm your password');
            isValid = false;
        } else if (confirmPassword.value !== password.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        } else {
            clearError(confirmPassword);
        }
        
        if (isValid && window.PortMySimAPI) {
            try {
                // Disable button and show loading
                submitButton.disabled = true;
                submitButton.textContent = 'Updating Password...';
                
                // Call reset password API
                const response = await window.PortMySimAPI.auth.resetPassword(
                    resetToken,
                    password.value.trim()
                );
                
                if (response.success) {
                    // Show success message
                    showFormMessage(resetPasswordForm, 'Password updated successfully! Redirecting to login...', true);
                    
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = '/HTML/login.html';
                    }, 2000);
                } else {
                    // Show error
                    showFormMessage(resetPasswordForm, response.message || 'Password reset failed. Please try again.');
                }
            } catch (error) {
                // Show error message
                showFormMessage(resetPasswordForm, error.message || 'Password reset failed. Please try again.');
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = 'Update Password';
            }
        }
    });
} 