// Contact Form Validation and Submission
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

const showSuccessMessage = (message) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    successMessage.style.color = 'var(--success)';
    successMessage.style.marginTop = '1rem';
    successMessage.style.textAlign = 'center';
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.parentElement.insertBefore(successMessage, submitButton.nextSibling);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
};

const showErrorMessage = (message) => {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    errorMessage.style.color = 'var(--error)';
    errorMessage.style.marginTop = '1rem';
    errorMessage.style.textAlign = 'center';
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.parentElement.insertBefore(errorMessage, submitButton.nextSibling);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
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
            try {
                // Disable submit button and show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                // Prepare form data
                const formData = {
                    name: name.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    subject: subject.value,
                    message: message.value.trim()
                };

                // Send data to server
                console.log('Sending form data:', formData);
                const response = await fetch('http://localhost:5000/api/contact/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                    // Show success message
                    showSuccessMessage('Thank you for your message. We will get back to you soon!');
                    contactForm.reset();
                } else {
                    // Show error message
                    console.error('Server error:', data);
                    showErrorMessage(data.message || 'Error sending message. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showErrorMessage('Error sending message. Please try again later.');
            } finally {
                // Re-enable submit button and restore original text
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
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