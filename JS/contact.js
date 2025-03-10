// Contact Form Validation
const contactForm = document.getElementById('contactForm');

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    // Basic Indian phone number validation (10 digits)
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
};

const showError = (input, message) => {
    const errorElement = input.parentElement.querySelector('.error-message');
    input.classList.add('error');
    errorElement.textContent = message;
};

const clearError = (input) => {
    const errorElement = input.parentElement.querySelector('.error-message');
    input.classList.remove('error');
    errorElement.textContent = '';
};

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        const name = contactForm.querySelector('#name');
        const email = contactForm.querySelector('#email');
        const phone = contactForm.querySelector('#phone');
        const subject = contactForm.querySelector('#subject');
        const message = contactForm.querySelector('#message');
        
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
        
        // Validate Subject
        if (!subject.value) {
            showError(subject, 'Please select a subject');
            isValid = false;
        } else {
            clearError(subject);
        }
        
        // Validate Message
        if (!message.value.trim()) {
            showError(message, 'Message is required');
            isValid = false;
        } else if (message.value.trim().length < 10) {
            showError(message, 'Message must be at least 10 characters long');
            isValid = false;
        } else {
            clearError(message);
        }
        
        if (isValid) {
            // Here you would typically send the form data to a server
            console.log('Contact form submitted successfully');
            contactForm.reset();
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you for your message. We will get back to you soon!';
            successMessage.style.color = 'var(--success)';
            successMessage.style.marginTop = '1rem';
            successMessage.style.textAlign = 'center';
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.parentElement.insertBefore(successMessage, submitButton.nextSibling);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        }
    });
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.id === 'email' && input.value.trim()) {
                if (!validateEmail(input.value)) {
                    showError(input, 'Please enter a valid email address');
                } else {
                    clearError(input);
                }
            } else if (input.id === 'phone' && input.value.trim()) {
                if (!validatePhone(input.value)) {
                    showError(input, 'Please enter a valid 10-digit phone number');
                } else {
                    clearError(input);
                }
            } else if (!input.value.trim() && input.required) {
                showError(input, `${input.previousElementSibling.textContent.replace('*', '')} is required`);
            } else {
                clearError(input);
            }
        });
    });
} 