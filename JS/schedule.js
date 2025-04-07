// Schedule Porting Form JavaScript

// Base API URL - using same URL from api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Import the mobile number database
import { mobileOperatorData, specificPrefixes, firstDigitOperators, priorityPrefixes } from "./data/mobileLookup.js";
import { lookupPhoneNumber } from "./truecallerHelper.js";

// Get user's location if allowed
let userLocation = null;
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Location obtained:', userLocation);
        // When location is obtained, find nearby porting centers
        findNearbyPortingCenters();
      },
      error => {
        console.error('Error getting location:', error);
        displayLocationError();
      }
    );
  }
}

document.addEventListener('DOMContentLoaded', function() {
    initScheduleForm();
    setupProgressSteps();
    setupProviderSelection();
    setupCircleSelection();
    setMinDate();
    loadProviders();
    loadCircles();
    setupMobileNumberDetection();
    getUserLocation();
    setupSpecialFields();
    generatePortingGuid();
    setupAutomationOptions();
});

// Generate GUID for porting identification
function generatePortingGuid() {
  const guidElement = document.getElementById('portingGuid');
  if (!guidElement) return;
  
  // Generate a random GUID pattern for porting
  const timestamp = new Date().getTime().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  const guid = `PORT-${timestamp}-${randomStr}`.toUpperCase();
  
  // Display with a slight delay to simulate "generating"
  setTimeout(() => {
    guidElement.textContent = guid;
  }, 1000);
  
  // Store the GUID for form submission
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem('portingGuid', guid);
  }
  
  return guid;
}

// Calculate and display SMS sending date
function calculateSmsSendDate() {
  const smsSendDateElement = document.getElementById('smsSendDate');
  if (!smsSendDateElement) return;
  
  // Get the current date
  const currentDate = new Date();
  
  // Add 1 day to the current date for SMS sending
  const smsSendDate = new Date(currentDate);
  smsSendDate.setDate(currentDate.getDate() + 1);
  
  // Format the date
  const formattedDate = smsSendDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  // Display the date
  smsSendDateElement.textContent = formattedDate;
  
  return smsSendDate;
}

// Setup automation options
function setupAutomationOptions() {
  const automatePortingCheckbox = document.getElementById('automatePorting');
  if (!automatePortingCheckbox) return;
  
  automatePortingCheckbox.addEventListener('change', function() {
    const smsSendDateElement = document.getElementById('smsSendDate');
    const portingGuidElement = document.getElementById('portingGuid');
    
    if (this.checked) {
      // If automation is checked, show "Automated" for SMS date
      if (smsSendDateElement) {
        smsSendDateElement.innerHTML = '<span style="color: var(--accent-color);">Automated by PortMySim</span>';
      }
      
      // Highlight the GUID as it will be used for automation
      if (portingGuidElement) {
        portingGuidElement.style.color = 'var(--accent-color)';
      }
    } else {
      // If unchecked, show the normal calculated date
      calculateSmsSendDate();
      
      // Reset GUID style
      if (portingGuidElement) {
        portingGuidElement.style.color = '';
      }
    }
  });
}

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
            // Show loading state
            const submitButton = document.querySelector('.btn-submit');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitButton.disabled = true;
            
            // Get form data
            const formData = {
                mobileNumber: document.getElementById('currentNumber').value,
                currentProvider: document.getElementById('currentProvider').value,
                currentCircle: document.getElementById('currentCircle').value,
                newProvider: document.getElementById('newProvider').value,
                planEndDate: document.getElementById('currentPlan').value,
                automatePorting: document.getElementById('automatePorting').checked,
                notifyUpdates: document.getElementById('notifyUpdates').checked,
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                alternateNumber: document.getElementById('altNumber').value || null,
                location: userLocation,
                scheduledDate: localStorage.getItem('calculatedPortingDate') || new Date().toISOString()
            };
            
            // Send data to backend API
            fetch(`${API_BASE_URL}/porting/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}` // Function to get auth token from localStorage
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Reset button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                if (data.success) {
                    // Store reference number for display
                    const refNumberElement = document.getElementById('refNumber');
                    if (refNumberElement && data.data && data.data.refNumber) {
                        refNumberElement.textContent = data.data.refNumber;
                    }
                    
                    // Store SMS date information
                    if (data.data && data.data.smsDate) {
                        const smsDateElement = document.getElementById('smsDate');
                        if (smsDateElement) {
                            const date = new Date(data.data.smsDate);
                            smsDateElement.textContent = date.toLocaleDateString('en-IN', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                        }
                    }
                    
                    // Display porting center information if available
                    if (data.data && data.data.portingCenterDetails) {
                        const centerElement = document.getElementById('portingCenter');
                        if (centerElement) {
                            centerElement.textContent = `${data.data.portingCenterDetails.name}, ${data.data.portingCenterDetails.address}`;
                        }
                    }
                    
                    // Display success message with animation
                    displaySuccessMessage();
                } else {
                    // Handle error
                    displayErrorMessage(data.error || 'Failed to submit porting request. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error submitting porting request:', error);
                
                // Reset button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                // Display error message
                displayErrorMessage('Network error. Please check your connection and try again.');
            });
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
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum === stepNumber) {
            step.classList.add('active');
            
            // Special handling for step 3 (Schedule)
            if (stepNumber === 3) {
                calculateSmsSendDate();
                calculatePortingDates();
                findNearbyPortingCenters();
            }
        } else {
            step.classList.remove('active');
        }
    });
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
    const formGroup = input.closest('.form-group');
    const errorMessage = formGroup ? formGroup.querySelector('.error-message') : null;
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
        } else {
            // Valid mobile number - attempt to detect operator and circle
            detectOperatorAndCircle(input.value);
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
            const provider = card.getAttribute('data-provider');
            
            // Remove selection from all cards
            providerCards.forEach(c => c.classList.remove('selected'));
            
            // Select clicked card
            card.classList.add('selected');
            
            // Update hidden input
            if (providerInput) {
                providerInput.value = provider;
                
                // Refresh nearby centers when provider changes
                findNearbyPortingCenters();
            }
        });
    });
}

// Set minimum date for the date picker
function setMinDate() {
    // Set minimum date for porting date
    const portingDatePicker = document.getElementById('portingDate');
    if (portingDatePicker) {
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Format date as YYYY-MM-DD
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        
        portingDatePicker.min = `${year}-${month}-${day}`;
        
        // Add placeholder to display correctly in all browsers
        portingDatePicker.setAttribute('placeholder', 'Select a date');
        
        // Fix to ensure the value is visible when selected
        portingDatePicker.addEventListener('change', function() {
            if (this.value) {
                this.classList.add('has-value');
                // If the icon element exists, add the floating class
                const icon = this.parentElement.querySelector('.form-icon');
                if (icon) icon.classList.add('floating');
                this.parentElement.classList.add('focused');
            }
        });
    }
    
    // Set current date as default for the end of recharge date (currentPlan)
    const currentPlanPicker = document.getElementById('currentPlan');
    if (currentPlanPicker) {
        // Set placeholder
        currentPlanPicker.setAttribute('placeholder', 'Select a date');
        
        // Add event listener to handle styling
        currentPlanPicker.addEventListener('change', function() {
            if (this.value) {
                this.classList.add('has-value');
                // If the icon element exists, add the floating class
                const icon = this.parentElement.querySelector('.form-icon');
                if (icon) icon.classList.add('floating');
                this.parentElement.classList.add('focused');
            }
        });
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

// Display success message and animation
function displaySuccessMessage() {
    // Hide form steps
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show success message
    const successMessage = document.querySelector('.form-success');
    if (successMessage) {
        successMessage.classList.add('show');
        
        // Update GUID in success screen
        const guidDisplay = document.getElementById('guidDisplay');
        if (guidDisplay) {
            const storedGuid = localStorage.getItem('portingGuid') || 'PORT-UNKNOWN';
            guidDisplay.textContent = storedGuid;
        }
        
        // Update porting date display from localStorage
        const portingDateDisplay = document.getElementById('portingDateDisplay');
        const timelinePortingDate = document.getElementById('timelinePortingDate');
        if (portingDateDisplay) {
            const formattedPortingDate = localStorage.getItem('formattedPortingDate');
            if (formattedPortingDate) {
                portingDateDisplay.textContent = formattedPortingDate;
                
                if (timelinePortingDate) {
                    timelinePortingDate.textContent = ` (${formattedPortingDate})`;
                }
            } else if (localStorage.getItem('calculatedPortingDate')) {
                // Fallback to calculating from ISO date if formatted date not found
                const calculatedDate = new Date(localStorage.getItem('calculatedPortingDate'));
                const formattedDate = calculatedDate.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                portingDateDisplay.textContent = formattedDate;
                
                if (timelinePortingDate) {
                    timelinePortingDate.textContent = ` (${formattedDate})`;
                }
            }
        }
        
        // Update automation status in success screen
        const automationStatus = document.getElementById('automationStatus');
        const automatePortingCheckbox = document.getElementById('automatePorting');
        if (automationStatus && automatePortingCheckbox) {
            if (automatePortingCheckbox.checked) {
                automationStatus.textContent = 'Automated by PortMySim';
                automationStatus.style.color = 'var(--accent-color)';
                
                // Update timeline descriptions for automated process
                const smsStepDescription = document.getElementById('smsStepDescription');
                const upcStepDescription = document.getElementById('upcStepDescription');
                
                if (smsStepDescription) {
                    smsStepDescription.innerHTML = '<strong style="color: var(--accent-color);">Automated:</strong> Our system will send the SMS on your behalf';
                }
                
                if (upcStepDescription) {
                    upcStepDescription.innerHTML = '<strong style="color: var(--accent-color);">Automated:</strong> We will retrieve and process your UPC code';
                }
            } else {
                automationStatus.textContent = 'Manual Process';
            }
        }
        
        // Set SMS date on timeline
        const timelineSmsDate = document.getElementById('timelineSmsDate');
        const smsDateElement = document.getElementById('smsDate');
        const storedSmsDate = localStorage.getItem('smsSendDate');
        
        if (timelineSmsDate && storedSmsDate) {
            timelineSmsDate.textContent = ` (${storedSmsDate})`;
        }
        
        if (smsDateElement && storedSmsDate) {
            smsDateElement.textContent = storedSmsDate;
        }
        
        // Set reference number (if not already set by API response)
        const refNumberElement = document.getElementById('refNumber');
        if (refNumberElement && refNumberElement.textContent === 'PORT-12345') {
            refNumberElement.textContent = generateReferenceNumber();
        }
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

// Helper function to get auth token from localStorage
function getAuthToken() {
    // Use the PortMySimAPI to get the token if it's available
    if (window.PortMySimAPI && window.PortMySimAPI.auth) {
        return window.PortMySimAPI.getToken ? window.PortMySimAPI.getToken() : localStorage.getItem('authToken') || '';
    }
    // Fallback to direct localStorage access
    return localStorage.getItem('authToken') || '';
}

// Display error message
function displayErrorMessage(message) {
    // Create error alert if it doesn't exist
    let errorAlert = document.querySelector('.form-error-alert');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.className = 'form-error-alert';
        
        // Insert after the form title
        const formTitle = document.querySelector('.form-step.active h2');
        if (formTitle && formTitle.parentNode) {
            formTitle.parentNode.insertBefore(errorAlert, formTitle.nextSibling);
        }
    }
    
    // Update error message
    errorAlert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorAlert.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.classList.remove('show');
    }, 5000);
    
    // Scroll to error message
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Load providers from the API
function loadProviders() {
    fetch(`${API_BASE_URL}/porting/providers`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProviderCards(data.data);
            }
        })
        .catch(error => {
            console.error('Error fetching providers:', error);
        });
}

// Update provider cards with data from API
function updateProviderCards(providers) {
    const providerContainer = document.querySelector('.provider-options');
    if (!providerContainer) return;
    
    // Clear existing cards (keep only the first 4 as fallback)
    const existingCards = providerContainer.querySelectorAll('.provider-card');
    const cardsToKeep = Math.min(existingCards.length, 4);
    
    // Create and append provider cards
    providers.forEach(provider => {
        // Check if a card already exists for this provider
        const existingCard = providerContainer.querySelector(`.provider-card[data-provider="${provider.id}"]`);
        
        if (existingCard) {
            // Update existing card
            const nameElement = existingCard.querySelector('h3');
            const descElement = existingCard.querySelector('p');
            
            if (nameElement) nameElement.textContent = provider.name;
            if (descElement) descElement.textContent = provider.description;
        } else {
            // Create a new card
            const card = document.createElement('div');
            card.className = 'provider-card';
            card.setAttribute('data-provider', provider.id);
            
            card.innerHTML = `
                <div class="provider-logo">
                    <i class="fas fa-broadcast-tower"></i>
                </div>
                <h3>${provider.name}</h3>
                <p>${provider.description}</p>
            `;
            
            providerContainer.appendChild(card);
            
            // Add click event handler
            card.addEventListener('click', () => {
                // Remove selected class from all cards
                providerContainer.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'));
                
                // Add selected class to clicked card
                card.classList.add('selected');
                
                // Update hidden input value
                const providerInput = document.getElementById('newProvider');
                if (providerInput) {
                    providerInput.value = provider.id;
                }
                
                // Clear any error message
                const errorMsg = document.querySelector('.selected-provider .error-message');
                if (errorMsg) {
                    errorMsg.textContent = '';
                    errorMsg.classList.remove('show');
                }
            });
        }
    });
}

// Load telecom circles from the API
function loadCircles() {
    fetch(`${API_BASE_URL}/porting/circles`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCircleOptions(data.data);
            }
        })
        .catch(error => {
            console.error('Error fetching circles:', error);
        });
}

// Update circle select options with data from API
function updateCircleOptions(circles) {
    const circleSelect = document.getElementById('currentCircle');
    if (!circleSelect) return;
    
    // Keep the placeholder option
    const placeholderOption = circleSelect.querySelector('option[disabled][selected]');
    
    // Clear existing options except placeholder
    circleSelect.innerHTML = '';
    
    // Add placeholder option back
    if (placeholderOption) {
        circleSelect.appendChild(placeholderOption);
    }
    
    // Add circles from API
    circles.forEach(circle => {
        const option = document.createElement('option');
        option.value = circle.id;
        option.textContent = circle.name;
        circleSelect.appendChild(option);
    });
}

// Setup mobile number detection event handlers
function setupMobileNumberDetection() {
    const mobileInput = document.getElementById('currentNumber');
    if (mobileInput) {
        let detectTimeout;
        
        mobileInput.addEventListener('input', function(e) {
            // Clear any previous detection timeout
            if (detectTimeout) {
                clearTimeout(detectTimeout);
            }
            
            // Remove any existing detection message
            const currentNumberField = this.closest('.form-group');
            const existingMsg = currentNumberField.querySelector('.detection-message');
            if (existingMsg) {
                existingMsg.remove();
            }
            
            // Only detect when we have 10 digits
            if (this.value.length === 10) {
                // Show loading indicator
                const loadingMsg = document.createElement('div');
                loadingMsg.className = 'detection-message loading-message show';
                loadingMsg.innerHTML = `
                    <div class="detection-header">
                        <span><i class="fas fa-spinner fa-spin"></i> Detecting operator and circle...</span>
                    </div>
                `;
                currentNumberField.appendChild(loadingMsg);
                
                // Wait a brief moment to avoid detection on every keystroke
                detectTimeout = setTimeout(async () => {
                    try {
                        await detectOperatorAndCircle(this.value);
                        // Remove loading message (updateOperatorAndCircle will create the actual detection message)
                        if (loadingMsg && loadingMsg.parentNode) {
                            loadingMsg.remove();
                        }
                    } catch (error) {
                        console.error('Detection error:', error);
                        // Show error message
                        if (loadingMsg && loadingMsg.parentNode) {
                            loadingMsg.innerHTML = `
                                <div class="detection-header">
                                    <span><i class="fas fa-exclamation-circle"></i> Detection failed. Please select manually.</span>
                                </div>
                            `;
                            setTimeout(() => {
                                loadingMsg.classList.remove('show');
                                setTimeout(() => {
                                    if (loadingMsg.parentNode) {
                                        loadingMsg.remove();
                                    }
                                }, 300);
                            }, 3000);
                        }
                    }
                }, 500);
            }
        });
    }
}

// Detect operator and circle based on mobile number
async function detectOperatorAndCircle(mobileNumber) {
    if (!mobileNumber || mobileNumber.length !== 10) {
        return;
    }

    // Use local database lookup only
    console.log("Using local database for", mobileNumber);
    const result = localMobileNumberLookup(mobileNumber);
    if (result) {
        updateOperatorAndCircle(result.operator, result.circle, result.confidence);
    }
}

// Local mobile number lookup based on TRAI data
function localMobileNumberLookup(mobileNumber) {
    if (!mobileNumber || mobileNumber.length !== 10) {
        return null;
    }

    // Step 1: Check for specific 4-digit prefixes (highest accuracy)
    const prefix4 = mobileNumber.substring(0, 4);
    if (specificPrefixes[prefix4]) {
        return specificPrefixes[prefix4];
    }

    // Step 2: Check for specific 3-digit prefixes
    const prefix3 = mobileNumber.substring(0, 3);
    if (specificPrefixes[prefix3]) {
        return specificPrefixes[prefix3];
    }

    // Step 3: Use the first 2 digits and check against priority mapping to resolve conflicts
    const prefix2 = mobileNumber.substring(0, 2);
    
    // Check if this prefix is in our priority mapping for resolving conflicts
    if (priorityPrefixes[prefix2]) {
        const operatorId = priorityPrefixes[prefix2];
        const operatorData = mobileOperatorData[operatorId];
        
        // If operator has this prefix in its data, use it
        if (operatorData && operatorData.prefixes[prefix2]) {
            const possibleCircles = operatorData.prefixes[prefix2];
            const subIndex = parseInt(mobileNumber.substring(2, 4)) % possibleCircles.length;
            return { 
                operator: operatorId, 
                circle: possibleCircles[subIndex],
                confidence: "medium"
            };
        }
    }
    
    // Step 4: Try general prefix mapping across all operators
    for (const [operatorId, operatorData] of Object.entries(mobileOperatorData)) {
        if (operatorData.prefixes[prefix2]) {
            // Found an operator with this prefix
            const possibleCircles = operatorData.prefixes[prefix2];
            const subIndex = parseInt(mobileNumber.substring(2, 4)) % possibleCircles.length;
            return { 
                operator: operatorId, 
                circle: possibleCircles[subIndex],
                confidence: "medium"
            };
        }
    }

    // Step 5: Fallback to first digit prediction
    const firstDigit = mobileNumber.charAt(0);
    if (firstDigitOperators[firstDigit]) {
        const operatorId = firstDigitOperators[firstDigit];
        const operatorData = mobileOperatorData[operatorId];
        
        // Pick a circle associated with this operator
        const firstPrefix = Object.keys(operatorData.prefixes)[0];
        const possibleCircles = operatorData.prefixes[firstPrefix];
        const circleIndex = parseInt(mobileNumber.substring(1, 3)) % possibleCircles.length;
        
        return {
            operator: operatorId,
            circle: possibleCircles[circleIndex],
            confidence: "low"
        };
    }

    // Step 6: Ultimate fallback - guarantee an answer for any number
    const operators = Object.keys(mobileOperatorData);
    const lastDigits = parseInt(mobileNumber.substring(8, 10));
    const operatorIndex = lastDigits % operators.length;
    const operatorId = operators[operatorIndex];
    
    // Pick any circle from the selected operator
    const firstCircleKey = Object.keys(mobileOperatorData[operatorId].prefixes)[0];
    const circles = mobileOperatorData[operatorId].prefixes[firstCircleKey];
    const circleIndex = Math.floor(lastDigits / 4) % circles.length;
    
    return {
        operator: operatorId,
        circle: circles[circleIndex],
        confidence: "very_low"
    };
}

// Update the form with detected operator and circle
function updateOperatorAndCircle(operator, circle, confidence) {
    if (!operator || !circle) return;
    
    const operatorSelect = document.getElementById('currentProvider');
    const circleSelect = document.getElementById('currentCircle');
    
    if (operatorSelect && operator) {
        // Find the option with matching value
        const operatorOption = Array.from(operatorSelect.options).find(option => 
            option.value === operator);
            
        if (operatorOption) {
            operatorSelect.value = operator;
            // Trigger change event to update any dependent elements
            const event = new Event('change', { bubbles: true });
            operatorSelect.dispatchEvent(event);
        }
    }
    
    if (circleSelect && circle) {
        // Find the option with matching value
        const circleOption = Array.from(circleSelect.options).find(option => 
            option.value === circle);
            
        if (circleOption) {
            circleSelect.value = circle;
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            circleSelect.dispatchEvent(event);
        }
    }
    
    // Add visual feedback
    if (operatorSelect && circleSelect && operator && circle) {
        // Apply a quick highlight effect to show the fields were auto-filled
        [operatorSelect, circleSelect].forEach(select => {
            select.classList.add('auto-detected');
            setTimeout(() => {
                select.classList.remove('auto-detected');
            }, 2000);
        });
        
        // Show detection confirmation message
        const currentNumberField = document.getElementById('currentNumber').closest('.form-group');
        let detectionMsg = currentNumberField.querySelector('.detection-message');
        
        if (!detectionMsg) {
            detectionMsg = document.createElement('div');
            detectionMsg.className = 'detection-message';
            currentNumberField.appendChild(detectionMsg);
        }
        
        const operatorName = operatorSelect.options[operatorSelect.selectedIndex].text;
        const circleName = circleSelect.options[circleSelect.selectedIndex].text;
        
        // Get confidence text and class based on confidence level
        let confidenceText = '';
        let confidenceClass = '';
        
        if (confidence) {
            switch(confidence) {
                case 'high':
                    confidenceText = 'High confidence';
                    confidenceClass = 'high-confidence';
                    break;
                case 'medium':
                    confidenceText = 'Medium confidence';
                    confidenceClass = 'medium-confidence';
                    break;
                case 'low':
                    confidenceText = 'Low confidence';
                    confidenceClass = 'low-confidence';
                    break;
                case 'very_low':
                    confidenceText = 'Best guess';
                    confidenceClass = 'very-low-confidence';
                    break;
            }
        }
        
        detectionMsg.innerHTML = `
            <div class="detection-header">
                <span>Detected ${operatorName} from ${circleName}</span>
                <div class="detection-actions">
                    <button type="button" class="btn-confirm-detection">✓ Correct</button>
                    <button type="button" class="btn-wrong-detection">✗ Not Correct</button>
                </div>
            </div>
            <small class="detection-disclaimer">
                This is our best guess based on your number prefix. ${confidenceText ? `<span class="confidence ${confidenceClass}">${confidenceText}</span>` : ''}
                Please confirm if correct.
            </small>
        `;
        detectionMsg.classList.add('show');
        
        // Add event listeners for confirmation buttons
        const confirmBtn = detectionMsg.querySelector('.btn-confirm-detection');
        const wrongBtn = detectionMsg.querySelector('.btn-wrong-detection');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                detectionMsg.innerHTML = `<span>Confirmed: ${operatorName} from ${circleName}</span>`;
                setTimeout(() => {
                    detectionMsg.classList.remove('show');
                }, 3000);
            });
        }
        
        if (wrongBtn) {
            wrongBtn.addEventListener('click', () => {
                detectionMsg.innerHTML = `<span>Please select your correct operator and circle manually</span>`;
                // Clear the selections to let user pick manually
                operatorSelect.selectedIndex = 0;
                circleSelect.selectedIndex = 0;
                
                // Focus on the operator dropdown
                operatorSelect.focus();
                
                setTimeout(() => {
                    detectionMsg.classList.remove('show');
                }, 5000);
            });
        }
        
        // Auto-hide after 15 seconds if user doesn't interact
        const hideTimeout = setTimeout(() => {
            if (detectionMsg.classList.contains('show')) {
                detectionMsg.classList.remove('show');
            }
        }, 15000);
        
        // Clear timeout if user interacts with buttons
        [confirmBtn, wrongBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    clearTimeout(hideTimeout);
                });
            }
        });
    }
}

// Calculate porting dates based on current plan end date
function calculatePortingDates() {
    const planEndDateInput = document.getElementById('currentPlan');
    const currentCircleInput = document.getElementById('currentCircle');
    
    if (planEndDateInput && planEndDateInput.value && currentCircleInput && currentCircleInput.value) {
        // Get values
        const planEndDate = planEndDateInput.value;
        const circleId = currentCircleInput.value;
        
        try {
            // Parse the end date
            const endDate = new Date(planEndDate);
            
            // Calculate porting date (same as end date)
            const portingDate = new Date(endDate);
            
            // Determine working days before based on circle (5 for J&K, 3 for others)
            const isJammuKashmir = circleId.toLowerCase().includes('jammu') || 
                                circleId.toLowerCase().includes('kashmir');
            const workingDaysBefore = isJammuKashmir ? 5 : 3;
            
            // Calculate SMS date
            const smsDate = new Date(endDate);
            let workingDaysCount = 0;
            
            // Check if end date is a working day (not Sunday)
            if (endDate.getDay() !== 0) {
                workingDaysCount = 1;
            }
            
            // Count backward to find the SMS date
            while (workingDaysCount < workingDaysBefore) {
                // Move one day back
                smsDate.setDate(smsDate.getDate() - 1);
                
                // If not Sunday, count as working day
                if (smsDate.getDay() !== 0) {
                    workingDaysCount++;
                }
            }
            
            // Store the calculated porting date for use in submission
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('calculatedPortingDate', portingDate.toISOString());
            }
            
            // Format the SMS date
            const formattedSmsDate = smsDate.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Format the Porting date
            const formattedPortingDate = portingDate.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Show SMS date info in Current Details section (Step 1)
            const smsDateInfo = document.getElementById('smsDateInfo');
            if (smsDateInfo) {
                const daysText = isJammuKashmir ? 
                    "5 working days (for Jammu & Kashmir circle)" : 
                    "3 working days";
                
                smsDateInfo.innerHTML = `<div class="info-message">
                    <i class="fas fa-info-circle"></i>
                    <span>Based on your plan end date, you should send PORT SMS to 1900 on 
                    <strong>${formattedSmsDate}</strong> (${daysText} before expiry). Your number will be ported on <strong>${formattedPortingDate}</strong>.</span>
                </div>`;
                smsDateInfo.style.display = 'block';
            }
            
            // Update SMS date on step 3
            const smsSendDateElement = document.getElementById('smsSendDate');
            if (smsSendDateElement) {
                smsSendDateElement.textContent = formattedSmsDate;
            }
            
            // Store SMS date for later use
            localStorage.setItem('smsSendDate', formattedSmsDate);
            localStorage.setItem('formattedPortingDate', formattedPortingDate);
        } catch (error) {
            console.error('Error calculating porting dates locally:', error);
        }
    }
}

// Find nearby porting centers based on selected provider and user location
function findNearbyPortingCenters() {
    const nearbyCentersList = document.getElementById('nearbyCentersList');
    if (!nearbyCentersList) return;

    // Show loading message
    nearbyCentersList.innerHTML = '<p class="centers-loading"><i class="fas fa-spinner fa-spin"></i> Finding nearby centers...</p>';

    // Get the selected provider and circle
    const selectedProvider = document.getElementById('newProvider').value || 'any';
    const selectedCircle = document.getElementById('currentCircle').value || 'delhi';
    
    // Check if we have both a provider (or 'any') and a circle
    const hasValidSelection = (selectedProvider === 'any' || selectedProvider) && selectedCircle;
    
    // Get the parent element to control visibility
    const nearbySection = document.querySelector('.nearby-centers');
    
    if (!hasValidSelection) {
        // If we don't have both values yet, show a message
        if (nearbySection) {
            nearbySection.style.display = 'none';
        }
        return;
    }
    
    // Show the section if it was hidden
    if (nearbySection) {
        nearbySection.style.display = 'block';
    }
    
    // Generate centers based on the selected circle and provider
    try {
        setTimeout(() => {
            // Create centers data based on selected provider and user's circle
            const mockCenters = generateCentersForCircle(selectedProvider, selectedCircle);
            
            if (mockCenters && mockCenters.length > 0) {
                // Clear the loading message
                nearbyCentersList.innerHTML = '';
                
                // Display heading with circle name
                const circleName = document.querySelector(`#currentCircle option[value="${selectedCircle}"]`)?.textContent || selectedCircle;
                const heading = document.createElement('h4');
                heading.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${circleName} Porting Centers`;
                nearbyCentersList.appendChild(heading);
                
                // Display each center
                mockCenters.forEach(center => {
                    const centerItem = document.createElement('div');
                    centerItem.className = 'center-item';
                    
                    // Add provider logo/icon based on provider
                    const providerIcon = getProviderIcon(center.provider);
                    
                    centerItem.innerHTML = `
                        <div class="center-icon">
                            ${providerIcon}
                        </div>
                        <div class="center-info">
                            <div class="center-name">${center.name}</div>
                            <div class="center-address">${center.address}</div>
                            <div class="center-services">
                                <span class="service-badge">Porting</span>
                                <span class="service-badge">New SIM</span>
                                <span class="service-badge">Customer Service</span>
                            </div>
                        </div>
                        <div class="center-distance">${center.distance} km</div>
                    `;
                    
                    nearbyCentersList.appendChild(centerItem);
                });
            } else {
                // No centers found
                nearbyCentersList.innerHTML = '<p class="centers-loading">No centers found in your area. Please contact customer support.</p>';
            }
        }, 800); // Add a delay to simulate API call
    } catch (error) {
        console.error('Error generating centers:', error);
        nearbyCentersList.innerHTML = '<p class="centers-loading">Unable to load nearby centers. Please try again later.</p>';
    }
}

// Helper function to get provider icon HTML
function getProviderIcon(provider) {
    switch(provider) {
        case 'airtel':
            return '<i class="fas fa-broadcast-tower" style="color: #e40000;"></i>';
        case 'jio':
            return '<i class="fas fa-broadcast-tower" style="color: #0f3cc9;"></i>';
        case 'vi':
            return '<i class="fas fa-broadcast-tower" style="color: #ee008c;"></i>';
        case 'bsnl':
            return '<i class="fas fa-broadcast-tower" style="color: #1d8a13;"></i>';
        case 'mtnl':
            return '<i class="fas fa-broadcast-tower" style="color: #ff6a00;"></i>';
        default:
            return '<i class="fas fa-broadcast-tower"></i>';
    }
}

// Generate centers for a specific circle and provider
function generateCentersForCircle(provider, circle) {
    // Map of circle to city/area names - expanded with real cities in each circle
    const circleCities = {
        'delhi': ['Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Greater Noida'],
        'mumbai': ['Mumbai', 'Thane', 'Navi Mumbai', 'Kalyan', 'Dombivli'],
        'maharashtra': ['Pune', 'Nagpur', 'Aurangabad', 'Nashik', 'Kolhapur'],
        'kolkata': ['Kolkata', 'Howrah', 'Salt Lake', 'Barrackpore', 'Durgapur'],
        'chennai': ['Chennai', 'Tambaram', 'Porur', 'Ambattur', 'Sholinganallur'],
        'karnataka': ['Bengaluru', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
        'andhra-pradesh': ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Guntur'],
        'gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
        'punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
        'haryana': ['Gurgaon', 'Faridabad', 'Rohtak', 'Panipat', 'Ambala'],
        'rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
        'madhya-pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
        'bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
        'orissa': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Puri'],
        'assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur'],
        'northeast': ['Shillong', 'Imphal', 'Aizawl', 'Agartala', 'Itanagar'],
        'himachal': ['Shimla', 'Mandi', 'Dharamshala', 'Solan', 'Kullu'],
        'jammu': ['Jammu', 'Srinagar', 'Anantnag', 'Baramulla', 'Udhampur'],
        'kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
        'tamil-nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
        'up-east': ['Lucknow', 'Varanasi', 'Prayagraj', 'Gorakhpur', 'Jaunpur'],
        'up-west': ['Meerut', 'Agra', 'Aligarh', 'Bareilly', 'Moradabad'],
        'west-bengal': ['Kolkata', 'Siliguri', 'Asansol', 'Kharagpur', 'Durgapur']
    };
    
    // Map of provider to center names
    const providerCenters = {
        'airtel': ['Airtel Experience Center', 'Airtel Store', 'Airtel Flagship Store', 'Airtel Connect'],
        'jio': ['Jio Store', 'Jio Center', 'Reliance Digital', 'Jio Point'],
        'vi': ['Vodafone Idea Store', 'Vi Shop', 'Vi Center', 'Vi Retail'],
        'bsnl': ['BSNL Customer Care', 'BSNL Service Center', 'BSNL Office', 'BSNL Retail'],
        'mtnl': ['MTNL Customer Care', 'MTNL Office', 'MTNL Service Center'],
        'any': ['Mobile Store', 'Telecom Center', 'Phone Hub', 'Connect Store']
    };
    
    // Map of common area types by circle
    const areaTypes = {
        'delhi': ['Market', 'Mall', 'Main Road', 'Metro Station', 'Sector'],
        'mumbai': ['Junction', 'Road', 'Market', 'Station', 'Mall'],
        'default': ['Main Road', 'Market', 'Shopping Center', 'Complex', 'Plaza']
    };
    
    // Get cities for the selected circle
    const cities = circleCities[circle] || circleCities['delhi'];
    
    // Get area types for this circle or use default
    const areas = areaTypes[circle] || areaTypes['default'];
    
    // Get center names for the selected provider
    let centerNames;
    if (provider === 'any') {
        // If 'any' provider, show a mix of all providers
        const allProviders = ['airtel', 'jio', 'vi', 'bsnl'];
        if (circle === 'delhi' || circle === 'mumbai') {
            allProviders.push('mtnl'); // MTNL only in Delhi and Mumbai
        }
        
        // Generate 3-5 random centers with different providers
        const numCenters = Math.floor(Math.random() * 3) + 3; // 3 to 5 centers
        const mockCenters = [];
        
        for (let i = 0; i < numCenters; i++) {
            const cityIndex = i % cities.length;
            const randomProvider = allProviders[Math.floor(Math.random() * allProviders.length)];
            const centerNames = providerCenters[randomProvider];
            const centerIndex = Math.floor(Math.random() * centerNames.length);
            const areaType = areas[Math.floor(Math.random() * areas.length)];
            
            mockCenters.push({
                name: `${centerNames[centerIndex]} ${cities[cityIndex]}`,
                provider: randomProvider,
                address: `${Math.floor(Math.random() * 100) + 1}, ${cities[cityIndex]} ${areaType}, ${getCircleMajorRegion(circle)}`,
                distance: (Math.random() * 5 + 0.5).toFixed(1) // 0.5 to 5.5 km
            });
        }
        
        // Sort by distance
        return mockCenters.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else {
        // Specific provider selected
        centerNames = providerCenters[provider] || providerCenters['any'];
        
        // Generate 3-5 random centers
        const numCenters = Math.floor(Math.random() * 3) + 3; // 3 to 5 centers
        const mockCenters = [];
        
        for (let i = 0; i < numCenters; i++) {
            const cityIndex = i % cities.length;
            const centerIndex = i % centerNames.length;
            const areaType = areas[Math.floor(Math.random() * areas.length)];
            
            mockCenters.push({
                name: `${centerNames[centerIndex]} ${cities[cityIndex]}`,
                provider: provider,
                address: `${Math.floor(Math.random() * 100) + 1}, ${cities[cityIndex]} ${areaType}, ${getCircleMajorRegion(circle)}`,
                distance: (Math.random() * 5 + 0.5).toFixed(1) // 0.5 to 5.5 km
            });
        }
        
        // Sort by distance
        return mockCenters.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
}

// Helper to get major region name from circle ID
function getCircleMajorRegion(circle) {
    const regions = {
        'delhi': 'Delhi NCR',
        'mumbai': 'Maharashtra',
        'maharashtra': 'Maharashtra',
        'kolkata': 'West Bengal',
        'chennai': 'Tamil Nadu',
        'karnataka': 'Karnataka',
        'andhra-pradesh': 'Andhra Pradesh',
        'gujarat': 'Gujarat',
        'punjab': 'Punjab',
        'haryana': 'Haryana',
        'rajasthan': 'Rajasthan',
        'madhya-pradesh': 'Madhya Pradesh',
        'bihar': 'Bihar',
        'orissa': 'Odisha',
        'assam': 'Assam',
        'northeast': 'North East India',
        'himachal': 'Himachal Pradesh',
        'jammu': 'Jammu & Kashmir',
        'kerala': 'Kerala',
        'tamil-nadu': 'Tamil Nadu',
        'up-east': 'Uttar Pradesh (East)',
        'up-west': 'Uttar Pradesh (West)',
        'west-bengal': 'West Bengal'
    };
    
    return regions[circle] || circle;
}

// Display error if location access denied
function displayLocationError() {
    const nearbyCentersList = document.getElementById('nearbyCentersList');
    if (!nearbyCentersList) return;
    
    nearbyCentersList.innerHTML = `
        <p class="centers-loading">
            <i class="fas fa-exclamation-circle" style="color: var(--error-color);"></i> 
            Location access denied. Please enable location services to see nearby centers.
        </p>
    `;
}

// Event listeners for special fields
function setupSpecialFields() {
    // Plan end date change triggers porting date calculation
    const planEndDateInput = document.getElementById('currentPlan');
    const circleInput = document.getElementById('currentCircle');
    
    if (planEndDateInput) {
        planEndDateInput.addEventListener('change', function() {
            // Calculate dates immediately when plan end date changes
            calculatePortingDates();
            
            // Make sure the SMS info is visible
            const smsDateInfo = document.getElementById('smsDateInfo');
            if (smsDateInfo) {
                smsDateInfo.style.display = 'block';
            }
        });
        
        // Also trigger calculation when the input loses focus
        planEndDateInput.addEventListener('blur', function() {
            if (this.value) {
                calculatePortingDates();
                
                // Make sure the SMS info is visible
                const smsDateInfo = document.getElementById('smsDateInfo');
                if (smsDateInfo) {
                    smsDateInfo.style.display = 'block';
                }
            }
        });
    }
    
    if (circleInput) {
        circleInput.addEventListener('change', function() {
            // When circle changes, also update nearby porting centers
            findNearbyPortingCenters();
            
            if (planEndDateInput && planEndDateInput.value) {
                calculatePortingDates();
                
                // Make sure the SMS info is visible
                const smsDateInfo = document.getElementById('smsDateInfo');
                if (smsDateInfo) {
                    smsDateInfo.style.display = 'block';
                }
            }
        });
    }
    
    // New provider selection triggers finding nearby centers
    const newProviderInput = document.getElementById('newProvider');
    if (newProviderInput) {
        newProviderInput.addEventListener('change', findNearbyPortingCenters);
    }
} 