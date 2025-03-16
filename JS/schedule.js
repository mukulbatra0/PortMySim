// Schedule Porting Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initScheduleForm();
    setupProgressSteps();
    setupProviderSelection();
    setupCircleSelection();
    setMinDate();
});

// Initialize the scheduling form
function initScheduleForm() {
    const form = document.getElementById('portingForm');
    if (!form) return;

    // Form navigation
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = parseInt(button.getAttribute('data-next')) - 1;
            const nextStep = parseInt(button.getAttribute('data-next'));
            
            // Validate current step before proceeding
            if (validateStep(currentStep)) {
                goToStep(nextStep);
                updateProgressSteps(nextStep);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = parseInt(button.getAttribute('data-prev'));
            goToStep(prevStep);
            updateProgressSteps(prevStep);
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate the final step
        if (validateStep(4)) {
            // Display success message with animation
            displaySuccessMessage();
            
            // Generate reference number
            generateReferenceNumber();
        }
    });

    // Input validations for real-time feedback
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.hasAttribute('required')) {
            input.addEventListener('input', function() {
                validateInput(this);
            });
            
            input.addEventListener('blur', function() {
                validateInput(this);
            });
        }
    });

    // Add floating animations to icons when input is focused
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const icon = group.querySelector('.form-icon');
        
        if (input && icon) {
            input.addEventListener('focus', () => {
                icon.classList.add('floating');
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    icon.classList.remove('floating');
                    input.parentElement.classList.remove('focused');
                }
            });
            
            // Check if input already has value (e.g., on page reload)
            if (input.value) {
                icon.classList.add('floating');
                input.parentElement.classList.add('focused');
            }
        }
    });
}

// Set up the progress steps indicators
function setupProgressSteps() {
    const progressLines = document.querySelectorAll('.progress-line');
    const steps = document.querySelectorAll('.step');
    
    // Activate the first step by default
    if (steps.length > 0) {
        steps[0].classList.add('active');
    }
}

// Update the progress steps based on current step
function updateProgressSteps(currentStep) {
    const steps = document.querySelectorAll('.step');
    const progressLines = document.querySelectorAll('.progress-line');
    
    steps.forEach((step, index) => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        
        if (stepNum < currentStep) {
            step.classList.remove('active');
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active');
            step.classList.remove('completed');
        }
    });
    
    // Update progress lines
    progressLines.forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

// Navigate between form steps
function goToStep(stepNumber) {
    const formSteps = document.querySelectorAll('.form-step');
    
    formSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    const newStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (newStep) {
        newStep.classList.add('active');
        
        // Scroll to top of form container
        const formContainer = document.querySelector('.schedule-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Validate each step before proceeding
function validateStep(stepNumber) {
    const currentStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (!currentStep) return true;
    
    const requiredInputs = currentStep.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    // Special handling for step 2 (provider selection)
    if (stepNumber === 2) {
        const newProvider = document.getElementById('newProvider');
        if (!newProvider.value) {
            const errorMsg = document.querySelector('.selected-provider .error-message');
            errorMsg.textContent = 'Please select a new service provider';
            errorMsg.classList.add('show');
            isValid = false;
        }
    }
    
    return isValid;
}

// Validate individual input fields
function validateInput(input) {
    const errorMessage = input.closest('.form-group').querySelector('.error-message');
    let isValid = true;
    let message = '';
    
    // Reset error message
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
    }
    
    // Required field validation
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (input.type === 'email' && input.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    
    // Phone number validation
    if (input.id === 'currentNumber' && input.value.trim()) {
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(input.value)) {
            isValid = false;
            message = 'Please enter a valid 10-digit mobile number';
        }
    }
    
    // End of Recharge Date validation
    if (input.id === 'currentPlan' && input.value.trim()) {
        const selectedDate = new Date(input.value);
        const today = new Date();
        
        // Clear time part for comparison
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            message = 'Please select a current or future date';
        }
    }
    
    // Display error message if any
    if (!isValid && errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }
    
    return isValid;
}

// Set up service provider selection cards
function setupProviderSelection() {
    const providerCards = document.querySelectorAll('.provider-card');
    const providerInput = document.getElementById('newProvider');
    
    providerCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            providerCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            card.classList.add('selected');
            
            // Update hidden input value
            const provider = card.getAttribute('data-provider');
            providerInput.value = provider;
            
            // Clear any error message
            const errorMsg = document.querySelector('.selected-provider .error-message');
            if (errorMsg) {
                errorMsg.textContent = '';
                errorMsg.classList.remove('show');
            }
        });
    });
}

// Set minimum date for the date picker
function setMinDate() {
    const datePicker = document.getElementById('portingDate');
    if (datePicker) {
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Format date as YYYY-MM-DD
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        
        datePicker.min = `${year}-${month}-${day}`;
    }
}

// Setup circle selection behavior
function setupCircleSelection() {
    const currentProvider = document.getElementById('currentProvider');
    const currentCircle = document.getElementById('currentCircle');
    
    // Optional functionality: You could change available circles based on provider
    if (currentProvider && currentCircle) {
        currentProvider.addEventListener('change', function() {
            // Reset circle selection when provider changes
            currentCircle.selectedIndex = 0;
            
            // You could add provider-specific circle filtering here if needed
            // For example, some providers might not be available in all circles
            /*
            const provider = currentProvider.value;
            Array.from(currentCircle.options).forEach(option => {
                if (option.value === '') return; // Skip the placeholder
                
                // Example: MTNL only available in Mumbai and Delhi
                if (provider === 'mtnl' && 
                    option.value !== 'mumbai' && 
                    option.value !== 'delhi') {
                    option.disabled = true;
                } else {
                    option.disabled = false;
                }
            });
            */
        });
    }
}

// Display success message with animation
function displaySuccessMessage() {
    const form = document.getElementById('portingForm');
    const successMessage = document.querySelector('.form-success');
    
    if (form && successMessage) {
        // Add fade-out animation to form steps
        form.querySelectorAll('.form-step').forEach(step => {
            step.style.animation = 'fadeOut 0.5s forwards';
        });
        
        // Show success message after form fades out
        setTimeout(() => {
            form.querySelectorAll('.form-step').forEach(step => {
                step.style.display = 'none';
            });
            
            successMessage.classList.add('show');
        }, 500);
    }
}

// Generate a random reference number
function generateReferenceNumber() {
    const refNumberElement = document.getElementById('refNumber');
    if (refNumberElement) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const refNumber = `PORT-${dateStr}-${randomNum}`;
        
        refNumberElement.textContent = refNumber;
    }
}

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.classList.contains('btn-next') || 
        target.classList.contains('btn-prev') || 
        target.classList.contains('btn-submit')) {
        
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // Position the ripple
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        // Apply styles to ripple
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Add ripple to button
        target.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}); 