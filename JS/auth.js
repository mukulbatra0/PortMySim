import { validateEmail, validatePhone, showError, clearError } from './utils.js';

// Directly check for authentication token
// This ensures we have the authentication token available ASAP
console.log('Auth.js loaded, checking authentication token');
const AUTH_TOKEN_KEY = 'portmysim_token';
const AUTH_USER_KEY = 'portmysim_user';

// Helper function to check if token is valid format
function isValidToken(token) {
    if (!token) return false;
    if (token === 'null' || token === 'undefined') return false;
    
    // Check if it's a valid JWT format (simplified check)
    // JWT format: xxxxx.yyyyy.zzzzz (three parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
}

// Clean up the token if needed and reinstate it
function ensureValidToken() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // Debug the token
    if (token) {
        console.log('Token exists in storage:', token.substring(0, 10) + '...');
        if (!isValidToken(token)) {
            console.warn('Token appears invalid, clearing token');
            localStorage.removeItem(AUTH_TOKEN_KEY);
            return null;
        }
        
        // Remove any quotes if they got accidentally wrapped around the token
        if (token.startsWith('"') && token.endsWith('"')) {
            const cleanToken = token.substring(1, token.length - 1);
            console.log('Fixing quoted token format');
            localStorage.setItem(AUTH_TOKEN_KEY, cleanToken);
            return cleanToken;
        }
        
        return token;
    }
    return null;
}

// Run token check immediately
const validToken = ensureValidToken();
console.log('Valid token check result:', !!validToken);

// Ensure the API client is available globally
if (!window.PortMySimAPI) {
    console.log('Creating global PortMySimAPI client');
    window.PortMySimAPI = {
        auth: {
            login: async (email, password) => {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success && data.token) {
                        // Ensure token is clean before storing
                        const cleanToken = String(data.token).trim().replace(/^["'](.*)["']$/, '$1');
                        console.log('Storing clean token after login');
                        
                        // Store in both key locations for compatibility
                        localStorage.setItem(AUTH_TOKEN_KEY, cleanToken);
                        localStorage.setItem('portmysim_token', cleanToken);
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
                        
                        // Debug token storage
                        console.log('Token stored with key:', AUTH_TOKEN_KEY);
                        console.log('Token stored with legacy key: portmysim_token');
                        console.log('Token length:', cleanToken.length);
                    }
                    
                    return data;
                } catch (error) {
                    console.error('Login error:', error);
                    return { success: false, message: 'Network error. Please try again.' };
                }
            },
            logout: () => {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_USER_KEY);
                window.location.href = '/HTML/index.html';
            },
            refreshToken: async () => {
                try {
                    // Try to refresh the token using a refresh endpoint
                    const response = await fetch('http://localhost:5000/api/auth/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success && data.token) {
                        // Store the new token
                        const cleanToken = String(data.token).trim().replace(/^["'](.*)["']$/, '$1');
                        localStorage.setItem(AUTH_TOKEN_KEY, cleanToken);
                        console.log('Token refreshed successfully');
                        return true;
                    }
                    
                    return false;
                } catch (error) {
                    console.error('Error refreshing token:', error);
                    return false;
                }
            },
            resendVerification: async (email) => {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email })
                    });
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error resending verification:', error);
                    return { success: false, message: 'Network error. Please try again.' };
                }
            }
        },
        isAuthenticated: () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            return !!token;
        },
        getToken: () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return null;
            
            // Clean up token format if needed
            if (token.startsWith('"') && token.endsWith('"')) {
                return token.substring(1, token.length - 1);
            }
            return token;
        },
        getUser: () => {
            try {
                const userData = localStorage.getItem('portmysim_user');
                if (!userData || userData === 'null' || userData === 'undefined') {
                    return null;
                }
                
                const parsedUser = JSON.parse(userData);
                
                // Ensure we have a valid user object with at least a name
                if (!parsedUser || typeof parsedUser !== 'object') {
                    return null;
                }
                
                // Make sure name exists and is a string
                if (!parsedUser.name || typeof parsedUser.name !== 'string') {
                    // Add a default name if missing
                    parsedUser.name = 'User';
                }
                
                return parsedUser;
            } catch (e) {
                console.error('Error parsing user data:', e);
                // Return a default user object rather than null
                return { name: 'User', email: '' };
            }
        },
        testServerConnection: async () => {
            try {
                const response = await fetch('http://localhost:5000/api/health', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                return response.ok;
            } catch (error) {
                console.error('Server connection test failed:', error);
                return false;
            }
        }
    };
}

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
    // Initialize the API client if it doesn't exist
    if (!window.PortMySimAPI) {
        console.log('Initializing PortMySimAPI client');
        
        // Create the API client
        window.PortMySimAPI = {
            auth: {
                login: async (email, password) => {
                    try {
                        const response = await fetch('http://localhost:5000/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email, password })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success && data.token) {
                            localStorage.setItem('portmysim_token', data.token);
                            localStorage.setItem('portmysim_user', JSON.stringify(data.user));
                        }
                        
                        return data;
                    } catch (error) {
                        console.error('Login error:', error);
                        return { success: false, message: 'Network error. Please try again.' };
                    }
                },
                logout: () => {
                    localStorage.removeItem('portmysim_token');
                    localStorage.removeItem('portmysim_user');
                    window.location.href = '/HTML/index.html';
                },
                refreshToken: async () => {
                    try {
                        // Try to refresh the token using a refresh endpoint
                        const response = await fetch('http://localhost:5000/api/auth/refresh', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('portmysim_token')}`
                            }
                        });
                        
                        const data = await response.json();
                        
                        if (data.success && data.token) {
                            // Store the new token
                            const cleanToken = String(data.token).trim().replace(/^["'](.*)["']$/, '$1');
                            localStorage.setItem('portmysim_token', cleanToken);
                            console.log('Token refreshed successfully');
                            return true;
                        }
                        
                        return false;
                    } catch (error) {
                        console.error('Error refreshing token:', error);
                        return false;
                    }
                },
                resendVerification: async (email) => {
                    try {
                        const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email })
                        });
                        
                        return await response.json();
                    } catch (error) {
                        console.error('Error resending verification:', error);
                        return { success: false, message: 'Network error. Please try again.' };
                    }
                }
            },
            isAuthenticated: () => {
                const token = localStorage.getItem('portmysim_token');
                return !!token;
            },
            getToken: () => {
                const token = localStorage.getItem('portmysim_token');
                if (!token) return null;
                
                // Clean up token format if needed
                if (token.startsWith('"') && token.endsWith('"')) {
                    return token.substring(1, token.length - 1);
                }
                return token;
            },
            getUser: () => {
                try {
                    const userData = localStorage.getItem('portmysim_user');
                    if (!userData || userData === 'null' || userData === 'undefined') {
                        return null;
                    }
                    
                    const parsedUser = JSON.parse(userData);
                    
                    // Ensure we have a valid user object with at least a name
                    if (!parsedUser || typeof parsedUser !== 'object') {
                        return null;
                    }
                    
                    // Make sure name exists and is a string
                    if (!parsedUser.name || typeof parsedUser.name !== 'string') {
                        // Add a default name if missing
                        parsedUser.name = 'User';
                    }
                    
                    return parsedUser;
                } catch (e) {
                    console.error('Error parsing user data:', e);
                    // Return a default user object rather than null
                    return { name: 'User', email: '' };
                }
            },
            testServerConnection: async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/health', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return response.ok;
                } catch (error) {
                    console.error('Server connection test failed:', error);
                    return false;
                }
            }
        };
    }

    // Check if user is authenticated
    if (window.PortMySimAPI && window.PortMySimAPI.isAuthenticated && window.PortMySimAPI.isAuthenticated()) {
        try {
            const user = window.PortMySimAPI.getUser ? window.PortMySimAPI.getUser() : null;
            
            // Ensure user has a valid name property, otherwise create a default user
            const validUser = (user && typeof user === 'object' && user.name && typeof user.name === 'string') 
                ? user 
                : { name: 'User', email: '' };
            
            // Update auth buttons in nav if they exist
            const authBtns = document.querySelector('.auth-btns');
            if (authBtns) {
                const firstLetter = validUser.name.charAt(0).toUpperCase();
                authBtns.innerHTML = `
                    <div class="user-profile-dropdown">
                        <div class="user-profile-circle" title="${validUser.name}">
                            ${firstLetter}
                        </div>
                        <div class="dropdown-menu">
                            <span class="user-greeting">Hello, ${validUser.name.includes(' ') ? validUser.name.split(' ')[0] : validUser.name}</span>
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
            } else if (authBtns) {
                // This else-if block is no longer needed since we're already handling all cases
                // with the validUser variable, but keeping it here to maintain structure
                setupProfileDropdown();
            }
            
            // Redirect if on login/signup pages
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('signup.html')) {
                window.location.href = '/HTML/schedule-porting.html';
            }
        } catch (error) {
            console.error('Error handling authenticated user:', error);
            // Do not break the page if there's an error
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
                if (window.PortMySimAPI && window.PortMySimAPI.auth) {
                    window.PortMySimAPI.auth.logout();
                } else {
                    console.error('Error: window.PortMySimAPI.auth is not available for logout');
                    // Fallback logout approach - clear any auth tokens and redirect to login
                    localStorage.removeItem('portmysim_token');
                    localStorage.removeItem('portmysim_user');
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    localStorage.removeItem(AUTH_USER_KEY);
                    window.location.href = '/HTML/login.html';
                }
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
        
        if (isValid) {
            try {
                // Disable button and show loading
                submitButton.disabled = true;
                submitButton.textContent = 'Logging in...';
                
                // Check API connectivity before login attempt
                if (!window.PortMySimAPI) {
                    console.error('API client not initialized');
                    showFormMessage(loginForm, 'Error: API client not initialized. The backend server may not be running.');
                    return;
                }
                
                // Test the server connection explicitly
                try {
                    const serverConnected = await window.PortMySimAPI.testServerConnection();
                    if (!serverConnected) {
                        showFormMessage(loginForm, 'Error: Cannot connect to the server. Please make sure the backend is running.');
                        return;
                    }
                } catch (connectionError) {
                    console.error('Server connection test failed:', connectionError);
                    showFormMessage(loginForm, `Error connecting to server: ${connectionError.message}`);
                    return;
                }
                
                console.log(`Attempting login for ${email.value.trim()}`);
                
                // Call login API
                const response = await window.PortMySimAPI.auth.login(
                    email.value.trim(), 
                    password.value.trim()
                );
                
                console.log('Login API response:', response);
                
                if (response.success) {
                    // Show success message
                    showFormMessage(loginForm, 'Login successful! Redirecting...', true);
                    
                    // Check for redirect parameter or stored redirect
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirectParam = urlParams.get('redirect');
                    const storedRedirect = localStorage.getItem('auth_redirect');
                    
                    // Clear the stored redirect if it exists
                    if (storedRedirect) {
                        localStorage.removeItem('auth_redirect');
                    }
                    
                    // Determine redirect destination
                    const redirectDestination = redirectParam 
                        ? `/HTML/${redirectParam}` 
                        : storedRedirect || '/HTML/dashboard.html';
                    
                    console.log('Redirecting to:', redirectDestination);
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = redirectDestination;
                    }, 1000);
                } else {
                    // Show detailed error
                    const errorMessage = response.message || 'Login failed. Please try again.';
                    console.error('Login error:', errorMessage);
                    
                    if (response.unverified) {
                        // Special handling for unverified accounts
                        const messageContainer = document.createElement('div');
                        messageContainer.className = 'form-message error';
                        messageContainer.innerHTML = `
                            <p>${errorMessage}</p>
                            <button id="resendVerificationBtn" class="btn btn-outline-primary mt-2">Resend Verification Email</button>
                        `;
                        
                        // Remove any existing message
                        const existingMessage = loginForm.querySelector('.form-message');
                        if (existingMessage) {
                            existingMessage.remove();
                        }
                        
                        // Add message to the form
                        const submitButton = loginForm.querySelector('button[type="submit"]');
                        submitButton.parentElement.insertBefore(messageContainer, submitButton);
                        
                        // Add click handler for resend button
                        const resendBtn = document.getElementById('resendVerificationBtn');
                        if (resendBtn) {
                            resendBtn.addEventListener('click', async () => {
                                try {
                                    resendBtn.textContent = 'Sending...';
                                    resendBtn.disabled = true;
                                    
                                    // Call resend verification API - ensure email is passed correctly
                                    const userEmail = email.value.trim();
                                    console.log('Sending verification email to:', userEmail);
                                    
                                    const resendResponse = await window.PortMySimAPI.auth.resendVerification(userEmail);
                                    
                                    if (resendResponse.success) {
                                        showFormMessage(loginForm, 'Verification email sent! Please check your inbox.', true);
                                    } else {
                                        showFormMessage(loginForm, resendResponse.message || 'Failed to resend verification email.');
                                    }
                                } catch (error) {
                                    console.error('Error resending verification:', error);
                                    showFormMessage(loginForm, 'Failed to resend verification email.');
                                } finally {
                                    resendBtn.textContent = 'Resend Verification Email';
                                    resendBtn.disabled = false;
                                }
                            });
                        }
                    } else if (response.statusCode === 401) {
                        showFormMessage(loginForm, 'Invalid email or password. Please try again.');
                    } else {
                        showFormMessage(loginForm, `Login error: ${errorMessage}`);
                    }
                    
                    // If using demo account, show hint
                    if (email.value.trim() === 'demo@example.com') {
                        setTimeout(() => {
                            showFormMessage(loginForm, 'Hint: For the demo account, try the password "Password123"');
                        }, 1500);
                    }
                }
            } catch (error) {
                // Show detailed error message
                console.error('Login exception:', error);
                showFormMessage(loginForm, `Login failed: ${error.message || 'Unknown error'}`);
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

// Add a direct login function for debugging and test authentication
function loginDirectly(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Attempting direct login for ${email}...`);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        console.log('Login successful, storing token');
        // Clean token and store
        const cleanToken = String(data.token).trim().replace(/^["'](.*)["']$/, '$1');
        localStorage.setItem('portmysim_token', cleanToken);
        localStorage.setItem('portmysim_user', JSON.stringify(data.user));
        
        // Test the token immediately
        testStoredToken();
        
        resolve(true);
      } else {
        console.error('Login failed:', data.message);
        reject(new Error(data.message || 'Login failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      reject(error);
    }
  });
}

// Function to test if the stored token is valid
async function testStoredToken() {
  const token = localStorage.getItem('portmysim_token');
  if (!token) {
    console.error('No token found in localStorage');
    return false;
  }
  
  try {
    console.log('Testing token validity...');
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('Token is valid');
      return true;
    } else {
      console.error('Token validation failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error testing token:', error);
    return false;
  }
}

// Expose these functions to the global window for debugging
window.portmysimAuth = {
  login: loginDirectly,
  testToken: testStoredToken
}; 