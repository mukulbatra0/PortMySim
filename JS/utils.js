/**
 * Utility functions for PortMySim
 */

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    // Basic Indian phone number validation (10 digits)
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
};

export const showError = (input, message) => {
    const errorElement = input.parentElement.querySelector('.error-message');
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
    }
};

export const clearError = (input) => {
    const errorElement = input.parentElement.querySelector('.error-message');
    input.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}; 