// Schedule Porting Form JavaScript

// Base API URL - using same URL from api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Import the mobile number database
import { mobileOperatorData, specificPrefixes, firstDigitOperators, priorityPrefixes } from "./data/mobileLookup.js";
import { lookupPhoneNumber } from "./truecallerHelper.js";
import { lookupMobileNumber, getNearbyPortingCenters } from "./api.js";

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

// Setup special form fields
function setupSpecialFields() {
    // Initialize location input with Google Places Autocomplete
    const locationInput = document.getElementById('location');
    if (locationInput) {
        const autocomplete = new google.maps.places.Autocomplete(locationInput, {
            types: ['(cities)'],
            componentRestrictions: { country: 'in' }
        });

        // When a place is selected, find nearby porting centers
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                userLocation = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                findNearbyPortingCenters();
            }
        });
    }

    // Setup porting date input
    const portingDateInput = document.getElementById('portingDate');
    if (portingDateInput) {
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        portingDateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Set maximum date to 30 days from now
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        portingDateInput.max = maxDate.toISOString().split('T')[0];
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

    try {
        // First try Numlookup API
        const numlookupResult = await lookupMobileNumber(mobileNumber);
        console.log('Numlookup API result:', numlookupResult);
        
        if (numlookupResult && numlookupResult.operator && numlookupResult.operator !== 'Unknown') {
            // API returned valid data, use it to update form
            const currentProvider = document.getElementById('currentProvider');
            const currentCircle = document.getElementById('currentCircle');
            const currentNumberField = document.getElementById('currentNumber').closest('.form-group');
            
            // Get all dropdown options
            const providerOptions = Array.from(currentProvider.options);
            const circleOptions = Array.from(currentCircle.options);
            
            // Try to find a matching provider (case insensitive)
            let providerFound = false;
            let apiOperator = numlookupResult.operator.toLowerCase();
            
            // Common provider name mappings
            const operatorMappings = {
                'airtel': ['airtel', 'bharti airtel', 'bhartiairtel'],
                'jio': ['jio', 'reliancejio', 'reliance jio'],
                'vi': ['vi', 'vodafone idea', 'vodafoneidea', 'vodafone', 'idea'],
                'bsnl': ['bsnl', 'bharat sanchar nigam limited'],
                'mtnl': ['mtnl', 'mahanagar telephone nigam limited']
            };
            
            console.log('Trying to match operator:', apiOperator);
            
            // First try direct comparison
            for (let option of providerOptions) {
                if (option.value && option.value.toLowerCase() === apiOperator) {
                    currentProvider.value = option.value;
                    providerFound = true;
                    console.log('Direct match found for provider:', option.value);
                    break;
                }
            }
            
            // If not found, try using the mappings
            if (!providerFound) {
                console.log('No direct match, trying mappings');
                for (const [provider, aliases] of Object.entries(operatorMappings)) {
                    if (aliases.some(alias => apiOperator.includes(alias))) {
                        for (let option of providerOptions) {
                            if (option.value.toLowerCase() === provider) {
                                currentProvider.value = option.value;
                                providerFound = true;
                                console.log('Mapped match found for provider:', option.value);
                                break;
                            }
                        }
                        if (providerFound) break;
                    }
                }
            }
            
            // Try to find a matching circle (case insensitive)
            let circleFound = false;
            let apiCircle = numlookupResult.circle.toLowerCase();
            
            // Common circle name mappings
            const circleMappings = {
                'delhi': ['delhi', 'new delhi', 'delhi ncr'],
                'mumbai': ['mumbai', 'bombay'],
                'maharashtra': ['maharashtra', 'mh'],
                'kolkata': ['kolkata', 'calcutta'],
                'chennai': ['chennai', 'madras'],
                'karnataka': ['karnataka', 'ka', 'bangalore', 'bengaluru'],
                'andhra-pradesh': ['andhra pradesh', 'andhra', 'ap', 'telangana'],
                'gujarat': ['gujarat', 'gj'],
                'punjab': ['punjab'],
                'haryana': ['haryana'],
                'rajasthan': ['rajasthan', 'rj'],
                'madhya-pradesh': ['madhya pradesh', 'mp'],
                'bihar': ['bihar'],
                'orissa': ['orissa', 'odisha'],
                'assam': ['assam'],
                'northeast': ['northeast', 'north east', 'ne'],
                'himachal': ['himachal pradesh', 'himachal', 'hp'],
                'jammu': ['jammu and kashmir', 'jammu', 'kashmir', 'j&k'],
                'kerala': ['kerala', 'kl'],
                'tamil-nadu': ['tamil nadu', 'tn'],
                'up-east': ['uttar pradesh east', 'up east', 'up-east'],
                'up-west': ['uttar pradesh west', 'up west', 'up-west'],
                'west-bengal': ['west bengal', 'wb']
            };
            
            console.log('Trying to match circle:', apiCircle);
            
            // First try direct comparison
            for (let option of circleOptions) {
                if (option.value && option.value.toLowerCase() === apiCircle) {
                    currentCircle.value = option.value;
                    circleFound = true;
                    console.log('Direct match found for circle:', option.value);
                    break;
                }
            }
            
            // If not found, try using the mappings
            if (!circleFound) {
                console.log('No direct match, trying mappings');
                for (const [circle, aliases] of Object.entries(circleMappings)) {
                    if (aliases.some(alias => apiCircle.includes(alias))) {
                        for (let option of circleOptions) {
                            if (option.value.toLowerCase() === circle) {
                                currentCircle.value = option.value;
                                circleFound = true;
                                console.log('Mapped match found for circle:', option.value);
                                break;
                            }
                        }
                        if (circleFound) break;
                    }
                }
            }
            
            // Clean up any existing detection message
            const existingMsg = currentNumberField.querySelector('.detection-message');
            if (existingMsg) {
                existingMsg.remove();
            }
            
            // Create new detection message
            const detectionMsg = document.createElement('div');
            detectionMsg.className = 'detection-message show';
            
            const confidence = numlookupResult.confidence || 'medium';
            const confidenceIcon = confidence === 'high' ? 'fa-check-circle' : 'fa-info-circle';
            const confidenceText = confidence === 'high' ? 'High Confidence' : 'Medium Confidence';
            
            if (providerFound || circleFound) {
                // Show success message
                detectionMsg.innerHTML = `
                    <div class="detection-header">
                        <span><i class="fas ${confidenceIcon}"></i> Mobile number detected</span>
                        <small class="confidence-badge ${confidence}">${confidenceText}</small>
                    </div>
                    <div class="detection-details">
                        ${providerFound ? `<div>Provider: ${currentProvider.options[currentProvider.selectedIndex].text}</div>` : ''}
                        ${circleFound ? `<div>Circle: ${currentCircle.options[currentCircle.selectedIndex].text}</div>` : ''}
                    </div>
                `;
                detectionMsg.classList.add('success-message');
            } else {
                // Show warning if nothing was found
                detectionMsg.innerHTML = `
                    <div class="detection-header">
                        <span><i class="fas fa-exclamation-circle"></i> Unable to match operator and circle. Please select manually.</span>
                    </div>
                `;
                detectionMsg.classList.add('error-message');
            }
            
            currentNumberField.appendChild(detectionMsg);
            
            // Trigger change events to update dependent fields
            if (providerFound) currentProvider.dispatchEvent(new Event('change'));
            if (circleFound) currentCircle.dispatchEvent(new Event('change'));
            
            return;
        }

        // Fallback to local database if API fails
        console.log("Falling back to local database for", mobileNumber);
        const localResult = localMobileNumberLookup(mobileNumber);
        if (localResult) {
            updateOperatorAndCircle(localResult.operator, localResult.circle, localResult.confidence);
        }
    } catch (error) {
        console.error('Error in operator detection:', error);
        // Fallback to local database on error
        const localResult = localMobileNumberLookup(mobileNumber);
        if (localResult) {
            updateOperatorAndCircle(localResult.operator, localResult.circle, localResult.confidence);
        }
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
    const currentProvider = document.getElementById('currentProvider');
    const currentCircle = document.getElementById('currentCircle');
    const currentNumberField = document.getElementById('currentNumber').closest('.form-group');
    
    // Remove any existing detection message
    const existingMsg = currentNumberField.querySelector('.detection-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create new detection message
    const detectionMsg = document.createElement('div');
    detectionMsg.className = 'detection-message show';
    
    if (operator === 'Unknown' || circle === 'Unknown') {
        // Show error message for failed detection
        detectionMsg.innerHTML = `
            <div class="detection-header">
                <span><i class="fas fa-exclamation-circle"></i> Unable to detect operator and circle. Please select manually.</span>
            </div>
        `;
        detectionMsg.classList.add('error-message');
    } else {
        // Show success message with detected information
        const confidenceIcon = confidence === 'high' ? 'fa-check-circle' : 'fa-info-circle';
        const confidenceText = confidence === 'high' ? 'High Confidence' : 'Low Confidence';
        
        detectionMsg.innerHTML = `
            <div class="detection-header">
                <span><i class="fas ${confidenceIcon}"></i> Detected: ${operator.toUpperCase()} in ${circle.replace(/-/g, ' ').toUpperCase()}</span>
                <small class="confidence-badge ${confidence}">${confidenceText}</small>
            </div>
        `;
        detectionMsg.classList.add('success-message');
        
        // Update form fields
        if (currentProvider) {
            const option = Array.from(currentProvider.options).find(opt => 
                opt.value.toLowerCase() === operator.toLowerCase()
            );
            if (option) {
                currentProvider.value = option.value;
            }
        }
        
        if (currentCircle) {
            const option = Array.from(currentCircle.options).find(opt => 
                opt.value.toLowerCase() === circle.toLowerCase()
            );
            if (option) {
                currentCircle.value = option.value;
            }
        }
    }
    
    // Add some styles for the detection message
    const style = document.createElement('style');
    style.textContent = `
        .detection-message {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            animation: fadeIn 0.3s ease;
        }
        .detection-message.show {
            display: block;
        }
        .detection-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .confidence-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 500;
        }
        .confidence-badge.high {
            background: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
        }
        .confidence-badge.low {
            background: rgba(255, 152, 0, 0.2);
            color: #FF9800;
        }
        .success-message {
            background: rgba(76, 175, 80, 0.1);
            border-left: 3px solid #4CAF50;
        }
        .error-message {
            background: rgba(244, 67, 54, 0.1);
            border-left: 3px solid #F44336;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    currentNumberField.appendChild(detectionMsg);
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

// Database of porting centers by state and district
const portingCentersDB = {
    'delhi': {
        'new delhi': [
            { name: 'Airtel Experience Center', address: 'Connaught Place, New Delhi', provider: 'airtel' },
            { name: 'Jio Store', address: 'Karol Bagh, New Delhi', provider: 'jio' },
            { name: 'Vi Store', address: 'Rajouri Garden, New Delhi', provider: 'vi' }
        ],
        'south delhi': [
            { name: 'Airtel Store', address: 'Saket, South Delhi', provider: 'airtel' },
            { name: 'Jio Center', address: 'Hauz Khas, South Delhi', provider: 'jio' }
        ],
        'east delhi': [
            { name: 'Airtel Store', address: 'Preet Vihar, East Delhi', provider: 'airtel' },
            { name: 'Jio Store', address: 'Mayur Vihar, East Delhi', provider: 'jio' }
        ],
        'west delhi': [
            { name: 'Airtel Store', address: 'Rajouri Garden, West Delhi', provider: 'airtel' },
            { name: 'Jio Store', address: 'Punjabi Bagh, West Delhi', provider: 'jio' }
        ],
        'north delhi': [
            { name: 'Airtel Store', address: 'Pitampura, North Delhi', provider: 'airtel' },
            { name: 'Jio Store', address: 'Rohini, North Delhi', provider: 'jio' }
        ]
    },
    'maharashtra': {
        'mumbai': [
            { name: 'Airtel Experience Center', address: 'Bandra West, Mumbai', provider: 'airtel' },
            { name: 'Jio Store', address: 'Andheri East, Mumbai', provider: 'jio' },
            { name: 'Vi Store', address: 'Malad West, Mumbai', provider: 'vi' }
        ],
        'pune': [
            { name: 'Airtel Store', address: 'Koregaon Park, Pune', provider: 'airtel' },
            { name: 'Jio Center', address: 'Viman Nagar, Pune', provider: 'jio' }
        ],
        'nagpur': [
            { name: 'Airtel Store', address: 'Sitabuldi, Nagpur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Dharampeth, Nagpur', provider: 'jio' }
        ],
        'nashik': [
            { name: 'Airtel Store', address: 'College Road, Nashik', provider: 'airtel' },
            { name: 'Jio Store', address: 'Gangapur Road, Nashik', provider: 'jio' }
        ],
        'thane': [
            { name: 'Airtel Store', address: 'Kopri, Thane', provider: 'airtel' },
            { name: 'Jio Store', address: 'Manpada, Thane', provider: 'jio' }
        ]
    },
    'karnataka': {
        'bangalore': [
            { name: 'Airtel Experience Center', address: 'Indiranagar, Bangalore', provider: 'airtel' },
            { name: 'Jio Store', address: 'Koramangala, Bangalore', provider: 'jio' },
            { name: 'Vi Store', address: 'Whitefield, Bangalore', provider: 'vi' }
        ],
        'mysore': [
            { name: 'Airtel Store', address: 'Vijayanagar, Mysore', provider: 'airtel' },
            { name: 'Jio Center', address: 'Kuvempunagar, Mysore', provider: 'jio' }
        ],
        'mangalore': [
            { name: 'Airtel Store', address: 'Hampankatta, Mangalore', provider: 'airtel' },
            { name: 'Jio Store', address: 'Kadri, Mangalore', provider: 'jio' }
        ],
        'hubli': [
            { name: 'Airtel Store', address: 'Gokul Road, Hubli', provider: 'airtel' },
            { name: 'Jio Store', address: 'Deshpande Nagar, Hubli', provider: 'jio' }
        ]
    },
    'tamil nadu': {
        'chennai': [
            { name: 'Airtel Experience Center', address: 'T Nagar, Chennai', provider: 'airtel' },
            { name: 'Jio Store', address: 'Anna Nagar, Chennai', provider: 'jio' },
            { name: 'Vi Store', address: 'Adyar, Chennai', provider: 'vi' }
        ],
        'coimbatore': [
            { name: 'Airtel Store', address: 'RS Puram, Coimbatore', provider: 'airtel' },
            { name: 'Jio Store', address: 'Gandhipuram, Coimbatore', provider: 'jio' }
        ],
        'madurai': [
            { name: 'Airtel Store', address: 'KK Nagar, Madurai', provider: 'airtel' },
            { name: 'Jio Store', address: 'Anna Nagar, Madurai', provider: 'jio' }
        ]
    },
    'gujarat': {
        'ahmedabad': [
            { name: 'Airtel Experience Center', address: 'CG Road, Ahmedabad', provider: 'airtel' },
            { name: 'Jio Store', address: 'Prahlad Nagar, Ahmedabad', provider: 'jio' },
            { name: 'Vi Store', address: 'Maninagar, Ahmedabad', provider: 'vi' }
        ],
        'surat': [
            { name: 'Airtel Store', address: 'Adajan, Surat', provider: 'airtel' },
            { name: 'Jio Store', address: 'Vesu, Surat', provider: 'jio' }
        ],
        'vadodara': [
            { name: 'Airtel Store', address: 'Alkapuri, Vadodara', provider: 'airtel' },
            { name: 'Jio Store', address: 'Akota, Vadodara', provider: 'jio' }
        ]
    },
    'west bengal': {
        'kolkata': [
            { name: 'Airtel Experience Center', address: 'Park Street, Kolkata', provider: 'airtel' },
            { name: 'Jio Store', address: 'Salt Lake, Kolkata', provider: 'jio' },
            { name: 'Vi Store', address: 'New Town, Kolkata', provider: 'vi' }
        ],
        'howrah': [
            { name: 'Airtel Store', address: 'Golabari, Howrah', provider: 'airtel' },
            { name: 'Jio Store', address: 'Shibpur, Howrah', provider: 'jio' }
        ],
        'durgapur': [
            { name: 'Airtel Store', address: 'City Center, Durgapur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Benachity, Durgapur', provider: 'jio' }
        ]
    },
    'andhra pradesh': {
        'hyderabad': [
            { name: 'Airtel Experience Center', address: 'Banjara Hills, Hyderabad', provider: 'airtel' },
            { name: 'Jio Store', address: 'Gachibowli, Hyderabad', provider: 'jio' },
            { name: 'Vi Store', address: 'Hitech City, Hyderabad', provider: 'vi' }
        ],
        'vijayawada': [
            { name: 'Airtel Store', address: 'Benz Circle, Vijayawada', provider: 'airtel' },
            { name: 'Jio Store', address: 'MG Road, Vijayawada', provider: 'jio' }
        ],
        'visakhapatnam': [
            { name: 'Airtel Store', address: 'Dwaraka Nagar, Visakhapatnam', provider: 'airtel' },
            { name: 'Jio Store', address: 'MVP Colony, Visakhapatnam', provider: 'jio' }
        ]
    },
    'kerala': {
        'kochi': [
            { name: 'Airtel Experience Center', address: 'MG Road, Kochi', provider: 'airtel' },
            { name: 'Jio Store', address: 'Panampilly Nagar, Kochi', provider: 'jio' },
            { name: 'Vi Store', address: 'Kakkanad, Kochi', provider: 'vi' }
        ],
        'thiruvananthapuram': [
            { name: 'Airtel Store', address: 'Kowdiar, Thiruvananthapuram', provider: 'airtel' },
            { name: 'Jio Store', address: 'Vazhuthacaud, Thiruvananthapuram', provider: 'jio' }
        ],
        'kozhikode': [
            { name: 'Airtel Store', address: 'Mavoor Road, Kozhikode', provider: 'airtel' },
            { name: 'Jio Store', address: 'Palayam, Kozhikode', provider: 'jio' }
        ]
    },
    'punjab': {
        'chandigarh': [
            { name: 'Airtel Experience Center', address: 'Sector 17, Chandigarh', provider: 'airtel' },
            { name: 'Jio Store', address: 'Sector 35, Chandigarh', provider: 'jio' },
            { name: 'Vi Store', address: 'Sector 22, Chandigarh', provider: 'vi' }
        ],
        'ludhiana': [
            { name: 'Airtel Store', address: 'Ferozepur Road, Ludhiana', provider: 'airtel' },
            { name: 'Jio Store', address: 'Model Town, Ludhiana', provider: 'jio' }
        ],
        'amritsar': [
            { name: 'Airtel Store', address: 'Lawrence Road, Amritsar', provider: 'airtel' },
            { name: 'Jio Store', address: 'Ranjit Avenue, Amritsar', provider: 'jio' }
        ]
    },
    'rajasthan': {
        'jaipur': [
            { name: 'Airtel Experience Center', address: 'C Scheme, Jaipur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Vaishali Nagar, Jaipur', provider: 'jio' },
            { name: 'Vi Store', address: 'Malviya Nagar, Jaipur', provider: 'vi' }
        ],
        'jodhpur': [
            { name: 'Airtel Store', address: 'Ratanada, Jodhpur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Shastri Nagar, Jodhpur', provider: 'jio' }
        ],
        'udaipur': [
            { name: 'Airtel Store', address: 'Hiran Magri, Udaipur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Sector 11, Udaipur', provider: 'jio' }
        ]
    },
    'uttar pradesh': {
        'lucknow': [
            { name: 'Airtel Experience Center', address: 'Gomti Nagar, Lucknow', provider: 'airtel' },
            { name: 'Jio Store', address: 'Hazratganj, Lucknow', provider: 'jio' },
            { name: 'Vi Store', address: 'Aliganj, Lucknow', provider: 'vi' }
        ],
        'kanpur': [
            { name: 'Airtel Store', address: 'Swaroop Nagar, Kanpur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Kakadeo, Kanpur', provider: 'jio' }
        ],
        'varanasi': [
            { name: 'Airtel Store', address: 'Sigra, Varanasi', provider: 'airtel' },
            { name: 'Jio Store', address: 'Lanka, Varanasi', provider: 'jio' }
        ]
    },
    'bihar': {
        'patna': [
            { name: 'Airtel Experience Center', address: 'Boring Road, Patna', provider: 'airtel' },
            { name: 'Jio Store', address: 'Kankarbagh, Patna', provider: 'jio' },
            { name: 'Vi Store', address: 'Exhibition Road, Patna', provider: 'vi' }
        ],
        'gaya': [
            { name: 'Airtel Store', address: 'Civil Lines, Gaya', provider: 'airtel' },
            { name: 'Jio Store', address: 'Kotwali, Gaya', provider: 'jio' }
        ],
        'muzaffarpur': [
            { name: 'Airtel Store', address: 'Saraiyaganj, Muzaffarpur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Bela, Muzaffarpur', provider: 'jio' }
        ]
    },
    'madhya pradesh': {
        'bhopal': [
            { name: 'Airtel Experience Center', address: 'MP Nagar, Bhopal', provider: 'airtel' },
            { name: 'Jio Store', address: 'Arera Colony, Bhopal', provider: 'jio' },
            { name: 'Vi Store', address: 'New Market, Bhopal', provider: 'vi' }
        ],
        'indore': [
            { name: 'Airtel Store', address: 'Vijay Nagar, Indore', provider: 'airtel' },
            { name: 'Jio Store', address: 'Sapna Sangeeta, Indore', provider: 'jio' }
        ],
        'jabalpur': [
            { name: 'Airtel Store', address: 'Civil Lines, Jabalpur', provider: 'airtel' },
            { name: 'Jio Store', address: 'Wright Town, Jabalpur', provider: 'jio' }
        ]
    },
    'assam': {
        'guwahati': [
            { name: 'Airtel Experience Center', address: 'GS Road, Guwahati', provider: 'airtel' },
            { name: 'Jio Store', address: 'Dispur, Guwahati', provider: 'jio' },
            { name: 'Vi Store', address: 'Paltan Bazaar, Guwahati', provider: 'vi' }
        ],
        'silchar': [
            { name: 'Airtel Store', address: 'Central Road, Silchar', provider: 'airtel' },
            { name: 'Jio Store', address: 'Tarapur, Silchar', provider: 'jio' }
        ],
        'dibrugarh': [
            { name: 'Airtel Store', address: 'Borguri, Dibrugarh', provider: 'airtel' },
            { name: 'Jio Store', address: 'Mohanbari, Dibrugarh', provider: 'jio' }
        ]
    }
};

// Function to find nearby porting centers based on location
async function findNearbyPortingCenters() {
    const locationInput = document.getElementById('location');
    const selectedProvider = document.getElementById('newProvider').value;
    const nearbyCentersList = document.getElementById('nearbyCentersList');
    
    if (!locationInput || !nearbyCentersList) return;
    
    const location = locationInput.value.trim();
    if (!location) {
        nearbyCentersList.innerHTML = '<p class="centers-loading">Please enter your location to find nearby centers.</p>';
        return;
    }
    
    // Show loading message
    nearbyCentersList.innerHTML = '<p class="centers-loading"><i class="fas fa-spinner fa-spin"></i> Finding nearby centers...</p>';
    
    try {
        // Call the API to get nearby centers
        const centers = await getNearbyPortingCenters(location, selectedProvider);
        
        if (centers && centers.length > 0) {
            // Display the found centers
            nearbyCentersList.innerHTML = '';
            centers.forEach(center => {
                const centerElement = document.createElement('div');
                centerElement.className = 'center-item';
                
                // Create the opening hours HTML if available
                let openingHoursHtml = '';
                if (center.openingHours) {
                    openingHoursHtml = `
                        <div class="opening-hours">
                            <h5>Opening Hours</h5>
                            <ul>
                                ${center.openingHours.map(hours => `<li>${hours}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }
                
                // Create the rating stars
                const rating = center.rating || 0;
                const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
                
                centerElement.innerHTML = `
                    <div class="center-icon">
                        <i class="fas fa-store"></i>
                    </div>
                    <div class="center-info">
                        <h4>${center.name}</h4>
                        <p class="address"><i class="fas fa-map-marker-alt"></i> ${center.address}</p>
                        ${center.phone ? `<p class="phone"><i class="fas fa-phone"></i> ${center.phone}</p>` : ''}
                        <div class="center-meta">
                            <span class="distance"><i class="fas fa-route"></i> ${center.distance} km</span>
                            <span class="provider-badge ${center.provider}">${center.provider.toUpperCase()}</span>
                            ${center.openNow ? '<span class="open-now">Open Now</span>' : ''}
                        </div>
                        <div class="rating">
                            <span class="stars">${stars}</span>
                            <span class="rating-count">(${center.totalRatings || 0} reviews)</span>
                        </div>
                        ${openingHoursHtml}
                        ${center.website ? `<a href="${center.website}" target="_blank" class="website-link">Visit Website</a>` : ''}
                    </div>
                `;
                
                // Add click handler to show on map
                centerElement.addEventListener('click', () => {
                    showOnMap(center.location.lat, center.location.lng, center.name);
                });
                
                nearbyCentersList.appendChild(centerElement);
            });
            
            // Initialize the map with the first center
            if (centers[0]) {
                initializeMap(centers);
            }
        } else {
            nearbyCentersList.innerHTML = '<p class="centers-loading">No porting centers found in your area. Please try a different location.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        nearbyCentersList.innerHTML = '<p class="centers-loading">Error finding centers. Please try again later.</p>';
    }
}

// Function to initialize the map
function initializeMap(centers) {
    const mapContainer = document.getElementById('centersMap');
    if (!mapContainer) return;
    
    // Create the map centered on the first center
    const map = new google.maps.Map(mapContainer, {
        center: { lat: centers[0].location.lat, lng: centers[0].location.lng },
        zoom: 12
    });
    
    // Add markers for all centers
    centers.forEach(center => {
        const marker = new google.maps.Marker({
            position: center.location,
            map: map,
            title: center.name,
            icon: getProviderIcon(center.provider)
        });
        
        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info-window">
                    <h4>${center.name}</h4>
                    <p>${center.address}</p>
                    ${center.phone ? `<p>📞 ${center.phone}</p>` : ''}
                    <p>🚶 ${center.distance} km away</p>
                    ${center.openNow ? '<p class="open-now">✅ Open Now</p>' : ''}
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}

// Function to get provider-specific map marker icon
function getProviderIcon(provider) {
    const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
    switch(provider) {
        case 'airtel':
            return iconBase + 'red-dot.png';
        case 'jio':
            return iconBase + 'blue-dot.png';
        case 'vi':
            return iconBase + 'purple-dot.png';
        default:
            return iconBase + 'yellow-dot.png';
    }
}

// Function to show a specific location on the map
function showOnMap(lat, lng, name) {
    const map = new google.maps.Map(document.getElementById('centersMap'), {
        center: { lat, lng },
        zoom: 15
    });
    
    const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: name
    });
}

// Add event listeners
document.getElementById('location')?.addEventListener('input', debounce(findNearbyPortingCenters, 500));
document.getElementById('newProvider')?.addEventListener('change', findNearbyPortingCenters);

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize map when Google Maps API is loaded
let mapInitialized = false;

// Function to check if Google Maps API is loaded
function checkGoogleMapsLoaded() {
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        if (!mapInitialized) {
            mapInitialized = true;
            console.log('Google Maps API loaded successfully');
            // Initialize any map-related functionality here
            setupSpecialFields();
        }
    } else {
        // If not loaded yet, check again after a short delay
        setTimeout(checkGoogleMapsLoaded, 100);
    }
}

// Start checking for Google Maps API
checkGoogleMapsLoaded();

// ... existing code ...