/**
 * Utility functions for PortMySim
 */

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    // More lenient validation - any 10 digits
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, '')); // Remove non-digit characters before testing
};

export const showError = (input, message) => {
    // Handle case where input is null or undefined
    if (!input || !input.parentElement) {
        console.warn('Cannot show error: input element or parent is null', { input, message });
        return;
    }
    
    const errorElement = input.parentElement.querySelector('.error-message');
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
    }
};

export const clearError = (input) => {
    // Handle case where input is null or undefined
    if (!input || !input.parentElement) {
        console.warn('Cannot clear error: input element or parent is null', { input });
        return;
    }
    
    const errorElement = input.parentElement.querySelector('.error-message');
    input.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}; 