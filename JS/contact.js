// Contact Form Validation and Submission
// Import functions from utils.js
// Instead of using ES modules, we'll define these functions directly

// Utility functions
const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
    // Allow 10 digits with optional country code
    const re = /^[+]?[0-9]{10,15}$/;
    return re.test(String(phone).replace(/\s+/g, ''));
};

const showError = (element, message) => {
    const errorDiv = element.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
};

const clearError = (element) => {
    const errorDiv = element.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    const showSuccessMessage = (message) => {
        if (!contactForm) return;
        
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        successMessage.style.color = 'var(--success)';
        successMessage.style.marginTop = '1rem';
        successMessage.style.textAlign = 'center';
        
        const formFooter = contactForm.querySelector('.form-footer');
        if (formFooter) {
            formFooter.appendChild(successMessage);
        } else {
            contactForm.appendChild(successMessage);
        }
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    };

    const showErrorMessage = (message) => {
        if (!contactForm) return;
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        errorMessage.style.color = 'var(--error)';
        errorMessage.style.marginTop = '1rem';
        errorMessage.style.textAlign = 'center';
        
        const formFooter = contactForm.querySelector('.form-footer');
        if (formFooter) {
            formFooter.appendChild(errorMessage);
        } else {
            contactForm.appendChild(errorMessage);
        }
        
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
                    // Get submit button - use more reliable selector
                    const submitButton = contactForm.querySelector('.form-btn');
                    
                    // Store original button content if button exists
                    let originalButtonText = '';
                    if (submitButton) {
                        originalButtonText = submitButton.innerHTML;
                        submitButton.disabled = true;
                        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                    }

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
                    // Re-enable submit button and restore original text if button exists
                    const submitButton = contactForm.querySelector('.form-btn');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                    }
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
}); 