// Form Validation Functions
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};

const validatePhone = (phone) => {
    // Basic Indian phone number validation (10 digits)
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
};

const showError = (input, message) => {
    const errorElement = input.parentElement.nextElementSibling;
    input.classList.add('error');
    errorElement.textContent = message;
};

const clearError = (input) => {
    const errorElement = input.parentElement.nextElementSibling;
    input.classList.remove('error');
    errorElement.textContent = '';
};

// Password Toggle Visibility
const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        const icon = toggle.querySelector('i');
        
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

// Login Form Validation
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        const email = loginForm.querySelector('#email');
        const password = loginForm.querySelector('#password');
        
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
            // Here you would typically send the form data to a server
            console.log('Login form submitted successfully');
            loginForm.reset();
        }
    });
}

// Signup Form Validation
const signupForm = document.getElementById('signupForm');

if (signupForm) {
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
        if (!name.value.trim()) {
            showError(name, 'Name is required');
            isValid = false;
        } else {
            clearError(name);
        }
        
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
        
        // Validate Phone
        if (!phone.value.trim()) {
            showError(phone, 'Phone number is required');
            isValid = false;
        } else if (!validatePhone(phone.value)) {
            showError(phone, 'Please enter a valid 10-digit phone number');
            isValid = false;
        } else {
            clearError(phone);
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
        
        // Validate Terms
        if (!terms.checked) {
            const errorElement = terms.parentElement.nextElementSibling;
            errorElement.textContent = 'You must agree to the Terms of Service and Privacy Policy';
            isValid = false;
        } else {
            const errorElement = terms.parentElement.nextElementSibling;
            errorElement.textContent = '';
        }
        
        if (isValid) {
            // Here you would typically send the form data to a server
            console.log('Signup form submitted successfully');
            signupForm.reset();
        }
    });
} 