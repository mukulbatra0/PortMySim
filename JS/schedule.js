// Schedule Porting Form JavaScript

// Base API URL - using same URL from api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Import the mobile number database
import { mobileOperatorData, specificPrefixes, firstDigitOperators, priorityPrefixes } from "./data/mobileLookup.js";
import { lookupPhoneNumber } from "./truecallerHelper.js";
import { 
    lookupMobileNumber, 
    getNearbyPortingCenters, 
    getFallbackPortingCenters 
} from "./api.js";
import CONFIG from './config.js';

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
    try {
        // Setup Google Places Autocomplete for location field
        const locationInput = document.getElementById('location');
        if (locationInput && window.google && window.google.maps && window.google.maps.places) {
            console.log('Setting up Google Places Autocomplete');
            
            const autocomplete = new google.maps.places.Autocomplete(locationInput, {
                types: ['geocode'],
                fields: ['address_components', 'formatted_address', 'geometry', 'name']
            });
            
            // Set the autocomplete bias to the user's country if available
            if (navigator.language) {
                const countryCode = navigator.language.split('-')[1];
                if (countryCode) {
                    autocomplete.setComponentRestrictions({
                        country: countryCode
                    });
                }
            }
            
            // Listen for place selection
            autocomplete.addListener('place_changed', function() {
                const place = autocomplete.getPlace();
                
                if (!place.geometry) {
                    console.warn('No geometry found for selected place');
                    return;
                }
                
                // Automatically search for porting centers when location is selected
                setTimeout(() => {
                    findNearbyPortingCenters();
                }, 500);
            });
            
            console.log('Google Places Autocomplete initialized successfully');
        } else {
            console.warn('Google Maps Places API not available');
        }
    } catch (error) {
        console.error('Error setting up special fields:', error);
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize step navigation
    setupStepNavigation();
    
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
    
    // Add a div for Google Maps error
    const mapsErrorDiv = document.createElement('div');
    mapsErrorDiv.id = 'mapsLoadingError';
    mapsErrorDiv.className = 'error-message';
    mapsErrorDiv.style.display = 'none';
    mapsErrorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to load mapping service. Some features may not work properly.';
    
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.prepend(mapsErrorDiv);
    } else {
        // Fallback - append to body if form-container doesn't exist
        document.body.appendChild(mapsErrorDiv);
    }
    
    // Load Google Maps API
    loadGoogleMapsAPI();
    
    // Setup form listeners
    setupFormListeners();
    
    // Add custom styles for porting tracker and status indicators
    addPortingStyles();
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
    form.addEventListener('submit', submitForm);

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

    // Initialize porting tracker UI
    const trackerContainer = document.createElement('div');
    trackerContainer.id = 'portingTracker';
    trackerContainer.className = 'porting-tracker';
    
    const formContainer = document.querySelector('.schedule-form');
    if (formContainer) {
        formContainer.insertBefore(trackerContainer, formContainer.firstChild);
        updatePortingTrackerUI();
    }
    
    // Add eligibility checking for the current number
    const mobileInput = document.getElementById('currentNumber');
    const formGroup = mobileInput ? mobileInput.closest('.form-group') : null;
    
    if (formGroup) {
        // Add status display area
        const statusDiv = document.createElement('div');
        statusDiv.id = 'portingStatus';
        statusDiv.className = 'porting-status';
        formGroup.appendChild(statusDiv);
        
        // Add eligibility check button
        const checkButton = document.createElement('button');
        checkButton.type = 'button';
        checkButton.id = 'checkEligibility';
        checkButton.className = 'btn btn-secondary btn-sm';
        checkButton.innerText = 'Check Eligibility';
        checkButton.addEventListener('click', () => {
            if (mobileInput && mobileInput.value) {
                if (/^[6-9]\d{9}$/.test(mobileInput.value)) {
                    checkPortingEligibility(mobileInput.value);
                } else {
                    showError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9");
                }
            } else {
                showError("Please enter your mobile number first");
            }
        });
        
        formGroup.appendChild(checkButton);
    }
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
    
    // Update the porting tracker UI
    updatePortingTrackerUI();
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
    
    // Update the porting tracker UI
    updatePortingTrackerUI();
}

// Validate step
function validateStep(stepNumber) {
    const formStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (!formStep) return false;
    
    const inputs = formStep.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        // Skip validation for non-required fields
        if (!input.required && !input.value) return;
        
        // Skip hidden inputs
        if (input.type === 'hidden' && !input.required) return;
        
        const isInputValid = validateInput(input);
        if (!isInputValid) {
            isValid = false;
        }
    });
    
    // Special validation for step 2 (provider selection)
    if (stepNumber === 2) {
        const newProviderInput = document.getElementById('newProvider');
        if (!newProviderInput || !newProviderInput.value) {
            const errorMessage = formStep.querySelector('.selected-provider .error-message');
            if (errorMessage) {
                errorMessage.textContent = 'Please select a new service provider';
                errorMessage.style.display = 'block';
            }
            isValid = false;
        }
    }
    
    // Special validation for step 3 (porting center)
    if (stepNumber === 3) {
        const selectedCenterId = localStorage.getItem('selectedCenterId');
        if (!selectedCenterId) {
            showError('Please select a porting center before proceeding');
            isValid = false;
        }
    }
    
    // Additional validation for mobile number
    if (stepNumber === 1) {
        const mobileNumberInput = document.getElementById('currentNumber');
        if (mobileNumberInput && mobileNumberInput.value) {
            const mobileNumber = mobileNumberInput.value;
            
            // Check if number starts with 6-9 and has 10 digits
            if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
                const errorMessage = mobileNumberInput.parentElement.nextElementSibling;
                if (errorMessage) {
                    errorMessage.textContent = 'Please enter a valid 10-digit mobile number starting with 6-9';
                    errorMessage.style.display = 'block';
                }
                isValid = false;
            }
        }
        
        // Call the date calculation API when step 1 is validated
        if (isValid) {
            calculatePortingDates();
        }
    }
    
    return isValid;
}

// Validate a single input field
function validateInput(input) {
    let isValid = true;
    let errorMessage = '';
    
    // Skip validation for checkbox that isn't required
    if (input.type === 'checkbox' && !input.required) {
        return true;
    }
    
    // Check if field is empty but required
    if (input.required && !input.value) {
        isValid = false;
        errorMessage = 'This field is required';
    } 
    // Check if pattern validation fails
    else if (input.pattern && input.value && !new RegExp(input.pattern).test(input.value)) {
        isValid = false;
        
        // Custom error messages based on field
        if (input.id === 'currentNumber' || input.id === 'alternateNumber') {
            errorMessage = 'Please enter a valid 10-digit mobile number starting with 6-9';
        } else if (input.id === 'email') {
            errorMessage = 'Please enter a valid email address';
        } else {
            errorMessage = 'Please enter a valid value';
        }
    }
    // Special validation for date inputs
    else if (input.type === 'date' && input.value) {
        const selectedDate = new Date(input.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (input.id === 'currentPlan') {
            // Plan end date should be in the future
            if (selectedDate < today) {
                isValid = false;
                errorMessage = 'Plan end date should be in the future';
            }
        } else if (input.id === 'scheduledDate') {
            // Porting date should be after SMS date
            const smsDateStr = localStorage.getItem('calculatedSmsDate');
            if (smsDateStr) {
                const smsDate = new Date(smsDateStr);
                smsDate.setHours(0, 0, 0, 0);
                
                if (selectedDate <= smsDate) {
                    isValid = false;
                    errorMessage = 'Porting date should be after the SMS date';
                }
            }
            
            // Porting date should be in the future
            if (selectedDate < today) {
                isValid = false;
                errorMessage = 'Porting date should be in the future';
            }
        }
    }
    
    // Find and display error message
    const errorElement = input.parentElement.nextElementSibling;
    
    if (errorElement && errorElement.classList.contains('error-message')) {
        if (!isValid) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            input.classList.add('invalid');
            input.classList.remove('valid');
        } else {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            input.classList.remove('invalid');
            input.classList.add('valid');
        }
    }
    
    return isValid;
}

// Validate all steps
function validateAllSteps() {
    let isValid = true;
    
    for (let i = 1; i <= 4; i++) {
        if (!validateStep(i)) {
            isValid = false;
        }
    }
    
    return isValid;
}

// Setup form listeners
function setupFormListeners() {
    const form = document.getElementById('portingForm');
    if (!form) return;
    
    // Form submission
    form.addEventListener('submit', submitForm);
    
    // Plan end date change
    const planEndDateInput = document.getElementById('currentPlan');
    if (planEndDateInput) {
        planEndDateInput.addEventListener('change', calculatePortingDates);
    }
    
    // Circle change
    const circleSelect = document.getElementById('currentCircle');
    if (circleSelect) {
        circleSelect.addEventListener('change', function() {
            if (planEndDateInput && planEndDateInput.value) {
                calculatePortingDates();
            }
        });
    }
    
    // Location change
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.addEventListener('change', debounce(function() {
            if (locationInput.value) {
                findNearbyPortingCenters();
            }
        }, 500));
    }
    
    // New provider selection
    const providerCards = document.querySelectorAll('.provider-card');
    const newProviderInput = document.getElementById('newProvider');
    
    providerCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            providerCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Set hidden input value
            if (newProviderInput) {
                const provider = this.getAttribute('data-provider');
                newProviderInput.value = provider;
                
                // Clear error message
                const errorMessage = document.querySelector('.selected-provider .error-message');
                if (errorMessage) {
                    errorMessage.textContent = '';
                    errorMessage.style.display = 'none';
                }
                
                // Find nearby centers if location is already entered
                if (locationInput && locationInput.value) {
                    findNearbyPortingCenters();
                }
            }
        });
    });
    
    // Automate porting toggle
    const automatePortingCheckbox = document.getElementById('automatePorting');
    if (automatePortingCheckbox) {
        automatePortingCheckbox.addEventListener('change', function() {
            updateAutomationDisplay();
        });
    }
    
    // Add input validation on blur
    const allInputs = form.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // Also validate on change for select elements
        if (input.tagName.toLowerCase() === 'select') {
            input.addEventListener('change', function() {
                validateInput(this);
            });
        }
    });
}

// Update display based on automation toggle
function updateAutomationDisplay() {
    const automatePortingCheckbox = document.getElementById('automatePorting');
    const smsSendDateElement = document.getElementById('smsSendDate');
    const portingGuidElement = document.getElementById('portingGuid');
    
    if (!automatePortingCheckbox || !smsSendDateElement || !portingGuidElement) return;
    
    if (automatePortingCheckbox.checked) {
        // If automation is checked, show "Automated" for SMS date
        smsSendDateElement.innerHTML = '<span style="color: var(--accent-color);">Automated by PortMySim</span>';
        
        // Highlight the GUID as it will be used for automation
        portingGuidElement.style.color = 'var(--accent-color)';
    } else {
        // If unchecked, show the normal calculated date
        calculateSmsSendDate();
        
        // Reset GUID style
        portingGuidElement.style.color = '';
    }
}

// Initialize map with porting centers
function initializeMap(centers, userCoordinates) {
    const mapContainer = document.getElementById('centersMap');
    if (!mapContainer || !window.google || !window.google.maps) return;
    
    // Create map centered at user location
    const map = new google.maps.Map(mapContainer, {
        center: userCoordinates,
        zoom: 12,
        styles: [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"visibility": "on"}, {"color": "#3e606f"}, {"weight": 2}, {"gamma": 0.84}]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{"weight": 0.6}, {"color": "#1a3541"}]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{"color": "#2c5a71"}]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{"color": "#406d80"}]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{"color": "#2c5a71"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#29768a"}, {"lightness": -37}]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [{"color": "#406d80"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#193341"}]
            }
        ]
    });
    
    // Add user marker
    new google.maps.Marker({
        position: userCoordinates,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2
        },
        title: "Your Location"
    });
    
    // Add markers for centers
    const markers = centers.map((center, i) => {
        if (!center.location || !center.location.coordinates) return null;
        
        const position = {
            lat: center.location.coordinates[1] || 0,
            lng: center.location.coordinates[0] || 0
        };
        
        // Get provider-specific icon
        const icon = {
            url: getProviderIcon(center.provider),
            scaledSize: new google.maps.Size(32, 32)
        };
        
        const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: center.name,
            icon: icon
        });
        
        // Info window content
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info-window">
                    <h4>${center.name}</h4>
                    <p>${center.address?.formattedAddress || center.address || 'Address not available'}</p>
                    ${center.openingHours ? `<p><small>${center.openingHours}</small></p>` : ''}
                    ${center.phone ? `<p><small>${center.phone}</small></p>` : ''}
                </div>
            `
        });
        
        // Open info window on click
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
            
            // Select the corresponding item in the list
            const centerItems = document.querySelectorAll('.center-item');
            centerItems.forEach(item => {
                if (item.getAttribute('data-center-id') === center._id) {
                    item.click();
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
        
        return marker;
    }).filter(Boolean);
    
    // Create bounds to fit all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(userCoordinates);
        
        markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        
        map.fitBounds(bounds);
        
        // Adjust zoom if too close
        const listener = google.maps.event.addListener(map, 'idle', function() {
            if (map.getZoom() > 15) {
                map.setZoom(15);
            }
            google.maps.event.removeListener(listener);
        });
    }
}

// Show a specific location on the map
function showOnMap(lat, lng, name) {
    const mapContainer = document.getElementById('centersMap');
    if (!mapContainer || !window.google || !window.google.maps) return;
    
    // Get existing map
    const map = mapContainer.map;
    
    if (map) {
        const position = { lat, lng };
        map.panTo(position);
        map.setZoom(15);
    }
}

// Find nearby porting centers based on location and selected provider
async function findNearbyPortingCenters() {
    const locationInput = document.getElementById('location');
    const newProviderInput = document.getElementById('newProvider');
    const centersList = document.getElementById('nearbyCentersList');
    const mapContainer = document.getElementById('centersMap');
    
    if (!locationInput || !locationInput.value || !newProviderInput || !newProviderInput.value || !centersList) {
        if (centersList) {
            centersList.innerHTML = '<p class="centers-empty">Please select a provider and enter your location first.</p>';
        }
        return;
    }
    
    // Show loading
    centersList.innerHTML = '<p class="centers-loading"><i class="fas fa-spinner fa-spin"></i> Searching for nearby centers...</p>';
    
    // Get coordinates from Google Places API if available
    let coordinates = null;
    
    if (window.google && window.google.maps && window.google.maps.places) {
        const geocoder = new google.maps.Geocoder();
        try {
            const results = await new Promise((resolve, reject) => {
                geocoder.geocode({ address: locationInput.value }, (results, status) => {
                    if (status === google.maps.GeocoderStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }
                });
            });
            
            if (results && results.length > 0) {
                const location = results[0].geometry.location;
                coordinates = {
                    lat: location.lat(),
                    lng: location.lng()
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    } else if (userLocation) {
        // Fallback to user's location if available
        coordinates = userLocation;
    }
    
    if (!coordinates) {
        centersList.innerHTML = '<p class="centers-empty">Unable to determine location. Please try again or select a different location.</p>';
        return;
    }
    
    // Fetch nearby centers from the API
    try {
        const token = localStorage.getItem('authToken') || '';
        
        const response = await fetch(`${API_BASE_URL}/porting/centers/nearby`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                lat: coordinates.lat,
                lng: coordinates.lng,
                provider: newProviderInput.value,
                radius: 10 // 10km radius
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            displayPortingCenters(data.data, coordinates);
        } else {
            // Try fallback centers if no centers found
            const fallbackResponse = await getFallbackPortingCenters(newProviderInput.value);
            
            if (fallbackResponse.success && fallbackResponse.data && fallbackResponse.data.length > 0) {
                displayPortingCenters(fallbackResponse.data, coordinates);
            } else {
                centersList.innerHTML = '<p class="centers-empty">No porting centers found in your area. Please try a different location or contact customer support.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching nearby centers:', error);
        centersList.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-circle"></i> Failed to fetch nearby centers. Please try again later.</p>';
    }
}

// Display porting centers on the list and map
function displayPortingCenters(centers, userCoordinates) {
    const centersList = document.getElementById('nearbyCentersList');
    if (!centersList) return;
    
    // Clear previous content
    centersList.innerHTML = '';
    
    // Create and add center items
    centers.forEach((center, index) => {
        const distance = calculateDistance(
            userCoordinates.lat, 
            userCoordinates.lng,
            center.location?.coordinates[1] || 0,
            center.location?.coordinates[0] || 0
        );
        
        const centerItem = document.createElement('div');
        centerItem.className = 'center-item';
        centerItem.setAttribute('data-center-id', center._id);
        centerItem.setAttribute('data-lat', center.location?.coordinates[1] || 0);
        centerItem.setAttribute('data-lng', center.location?.coordinates[0] || 0);
        
        // Get provider-specific color
        const providerColor = getProviderColor(center.provider);
        
        centerItem.innerHTML = `
            <div class="center-icon">
                <i class="fas fa-store" style="color: ${providerColor};"></i>
            </div>
            <div class="center-info">
                <h4 class="center-name">${center.name}</h4>
                <p class="center-address">${center.address?.formattedAddress || center.address || 'Address not available'}</p>
                <div class="center-meta">
                    <span class="provider-badge ${center.provider.toLowerCase()}">${center.provider}</span>
                    <span class="distance">${distance.toFixed(1)} km away</span>
                    ${center.isOpen ? '<span class="open-now">Open Now</span>' : ''}
                </div>
                ${center.openingHours ? `<p class="opening-hours">${center.openingHours}</p>` : ''}
                ${center.phone ? `<p class="center-phone"><i class="fas fa-phone-alt"></i> ${center.phone}</p>` : ''}
                <button type="button" class="btn-map" data-center-id="${center._id}">
                    <i class="fas fa-map-marker-alt"></i> View on Map
                </button>
            </div>
        `;
        
        // Add click handler for center selection
        centerItem.addEventListener('click', function() {
            // Remove selected class from all items
            document.querySelectorAll('.center-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selected class to this item
            this.classList.add('selected');
            
            // Store selected center
            const centerId = this.getAttribute('data-center-id');
            const centerName = this.querySelector('.center-name').textContent;
            const centerAddress = this.querySelector('.center-address').textContent;
            
            // Save selected center data
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('selectedCenterId', centerId);
                localStorage.setItem('selectedCenterName', centerName);
                localStorage.setItem('selectedCenterAddress', centerAddress);
            }
            
            // Show on map
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            
            if (!isNaN(lat) && !isNaN(lng)) {
                showOnMap(lat, lng, centerName);
            }
        });
        
        // Add map button handler
        const mapButton = centerItem.querySelector('.btn-map');
        if (mapButton) {
            mapButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent item click
                
                const lat = parseFloat(centerItem.getAttribute('data-lat'));
                const lng = parseFloat(centerItem.getAttribute('data-lng'));
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    showOnMap(lat, lng, center.name);
                }
            });
        }
        
        centersList.appendChild(centerItem);
    });
    
    // Initialize map with centers
    initializeMap(centers, userCoordinates);
    
    // Select first center by default
    const firstCenter = centersList.querySelector('.center-item');
    if (firstCenter) {
        firstCenter.click();
    }
}

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Get color based on provider name
function getProviderColor(provider) {
    const providerLower = provider.toLowerCase();
    
    if (providerLower.includes('airtel')) {
        return '#e40000'; // Airtel red
    } else if (providerLower.includes('jio')) {
        return '#0f3cc9'; // Jio blue
    } else if (providerLower.includes('vi') || providerLower.includes('vodafone')) {
        return '#ee008c'; // Vi pink
    } else if (providerLower.includes('bsnl')) {
        return '#1d8a13'; // BSNL green
    } else if (providerLower.includes('mtnl')) {
        return '#ff6a00'; // MTNL orange
    }
    
    return '#666666'; // Default grey
}

// Setup mobile number detection
function setupMobileNumberDetection() {
    const mobileNumberInput = document.getElementById('currentNumber');
    if (!mobileNumberInput) return;
    
    mobileNumberInput.addEventListener('input', debounce(function(e) {
        const number = e.target.value;
        
        // Clear detection if number is less than 10 digits
        if (number.length < 10) {
            hideDetectionMessage();
            return;
        }
        
        // Validate 10-digit number and starting with 6-9
        if (number.length === 10 && /^[6-9]\d{9}$/.test(number)) {
            detectMobileProvider(number);
        }
    }, 500));
}

// Detect mobile provider from number
async function detectMobileProvider(number) {
    showLoadingIndicator();
    
    try {
        // First try API lookup
        const apiData = await lookupMobileNumber(number);
        
        if (apiData && apiData.success && apiData.data.operator) {
            displayDetectedProvider(apiData.data.operator, apiData.data.circle, 'high');
            return;
        }
        
        // Fall back to local detection
        const result = detectProviderFromNumber(number);
        if (result && result.provider) {
            displayDetectedProvider(result.provider, result.circle || 'Unknown', 'medium');
            return;
        }
        
        // If both fail, hide detection
        hideDetectionMessage();
    } catch (error) {
        console.error('Error detecting provider:', error);
        
        // Fall back to local detection on API error
        const result = detectProviderFromNumber(number);
        if (result && result.provider) {
            displayDetectedProvider(result.provider, result.circle || 'Unknown', 'low');
            return;
        }
        
        hideDetectionMessage();
    } finally {
        hideLoadingIndicator();
    }
}

// Local detection using the imported database
function detectProviderFromNumber(number) {
    // Check first for specific prefixes (highest priority)
    const prefix4 = number.substring(0, 4);
    const prefix3 = number.substring(0, 3);
    
    // Check for specific 4-digit prefixes
    for (const prefixObj of priorityPrefixes) {
        if (prefixObj.prefix === prefix4) {
            return {
                provider: prefixObj.operator,
                circle: prefixObj.circle || null,
                confidence: 'high'
            };
        }
    }
    
    // Check for specific 3-digit prefixes
    for (const prefix in specificPrefixes) {
        if (prefix === prefix3) {
            return {
                provider: specificPrefixes[prefix],
                confidence: 'medium'
            };
        }
    }
    
    // Check first digit (lowest priority)
    const firstDigit = number.charAt(0);
    if (firstDigitOperators[firstDigit]) {
        return {
            provider: firstDigitOperators[firstDigit],
            confidence: 'low'
        };
    }
    
    return null;
}

// Show detected provider
function displayDetectedProvider(provider, circle, confidence) {
    const detectionDiv = document.getElementById('providerDetection');
    const providerText = document.getElementById('detectedProvider');
    const confidenceElement = document.getElementById('confidenceLevel');
    const currentProviderSelect = document.getElementById('currentProvider');
    const currentCircleSelect = document.getElementById('currentCircle');
    
    if (!detectionDiv || !providerText || !confidenceElement) return;
    
    // Format provider name for display (capitalize first letter)
    let formattedProvider = provider.toLowerCase();
    formattedProvider = formattedProvider.charAt(0).toUpperCase() + formattedProvider.slice(1);
    
    // Special case for Vi
    if (formattedProvider.toLowerCase() === 'vodafone idea' || formattedProvider.toLowerCase() === 'vodafone-idea') {
        formattedProvider = 'Vi (Vodafone Idea)';
    }
    
    // Display provider
    providerText.textContent = formattedProvider;
    
    // Set confidence class
    confidenceElement.className = 'confidence';
    confidenceElement.classList.add(`${confidence}-confidence`);
    
    // Set confidence text
    switch (confidence) {
        case 'high':
            confidenceElement.textContent = 'High Confidence';
            break;
        case 'medium':
            confidenceElement.textContent = 'Medium Confidence';
            break;
        case 'low':
            confidenceElement.textContent = 'Low Confidence';
            break;
        default:
            confidenceElement.textContent = '';
    }
    
    // Show detection message
    detectionDiv.style.display = 'block';
    detectionDiv.classList.add('show');
    
    // Setup buttons
    const confirmBtn = detectionDiv.querySelector('.btn-confirm-detection');
    const wrongBtn = detectionDiv.querySelector('.btn-wrong-detection');
    
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            // Map the provider name to the select option value
            let selectValue = '';
            
            if (formattedProvider.toLowerCase().includes('airtel')) {
                selectValue = 'airtel';
            } else if (formattedProvider.toLowerCase().includes('jio')) {
                selectValue = 'jio';
            } else if (formattedProvider.toLowerCase().includes('vi') || 
                       formattedProvider.toLowerCase().includes('vodafone')) {
                selectValue = 'vi';
            } else if (formattedProvider.toLowerCase().includes('bsnl')) {
                selectValue = 'bsnl';
            } else if (formattedProvider.toLowerCase().includes('mtnl')) {
                selectValue = 'mtnl';
            } else {
                selectValue = 'other';
            }
            
            // Set the provider dropdown value
            if (currentProviderSelect) {
                currentProviderSelect.value = selectValue;
                currentProviderSelect.classList.add('auto-detected');
                
                // Trigger change event
                const event = new Event('change');
                currentProviderSelect.dispatchEvent(event);
            }
            
            // Set circle if available
            if (circle && circle !== 'Unknown' && currentCircleSelect) {
                // Map circle name to select option value
                let circleValue = '';
                
                // Simple mapping - can be expanded for more complex cases
                const circleName = circle.toLowerCase();
                
                // Map common circle names
                if (circleName.includes('delhi')) {
                    circleValue = 'delhi';
                } else if (circleName.includes('mumbai')) {
                    circleValue = 'mumbai';
                } else if (circleName.includes('kolkata')) {
                    circleValue = 'kolkata';
                } else if (circleName.includes('maharashtra')) {
                    circleValue = 'maharashtra';
                } else if (circleName.includes('gujarat')) {
                    circleValue = 'gujarat';
                } else if (circleName.includes('andhra')) {
                    circleValue = 'andhra-pradesh';
                } else if (circleName.includes('karnataka')) {
                    circleValue = 'karnataka';
                } else if (circleName.includes('tamil')) {
                    circleValue = 'tamil-nadu';
                } else if (circleName.includes('kerala')) {
                    circleValue = 'kerala';
                } else if (circleName.includes('punjab')) {
                    circleValue = 'punjab';
                } else if (circleName.includes('haryana')) {
                    circleValue = 'haryana';
                } else if (circleName.includes('up-east') || circleName.includes('up east')) {
                    circleValue = 'up-east';
                } else if (circleName.includes('up-west') || circleName.includes('up west')) {
                    circleValue = 'up-west';
                } else if (circleName.includes('west bengal')) {
                    circleValue = 'west-bengal';
                } else if (circleName.includes('assam')) {
                    circleValue = 'assam';
                } else if (circleName.includes('bihar')) {
                    circleValue = 'bihar';
                } else if (circleName.includes('orissa')) {
                    circleValue = 'orissa';
                } else if (circleName.includes('jammu')) {
                    circleValue = 'jammu';
                } else if (circleName.includes('himachal')) {
                    circleValue = 'himachal';
                } else if (circleName.includes('northeast')) {
                    circleValue = 'northeast';
                }
                
                if (circleValue) {
                    currentCircleSelect.value = circleValue;
                    currentCircleSelect.classList.add('auto-detected');
                    
                    // Trigger change event
                    const event = new Event('change');
                    currentCircleSelect.dispatchEvent(event);
                }
            }
            
            // Hide detection message
            hideDetectionMessage();
        };
    }
    
    if (wrongBtn) {
        wrongBtn.onclick = function() {
            hideDetectionMessage();
        };
    }
}

function hideDetectionMessage() {
    const detectionDiv = document.getElementById('providerDetection');
    if (detectionDiv) {
        detectionDiv.style.display = 'none';
        detectionDiv.classList.remove('show');
    }
}

function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Calculate porting dates based on plan end date and regulations
async function calculatePortingDates() {
    const planEndDateInput = document.getElementById('currentPlan');
    const currentCircleSelect = document.getElementById('currentCircle');
    const smsDateInfoDiv = document.getElementById('smsDateInfo');
    const calculatedSmsDateSpan = document.getElementById('calculatedSmsDate');
    
    if (!planEndDateInput || !planEndDateInput.value || 
        !currentCircleSelect || !currentCircleSelect.value ||
        !smsDateInfoDiv || !calculatedSmsDateSpan) {
        return;
    }
    
    const planEndDate = planEndDateInput.value;
    const circleId = currentCircleSelect.value;
    
    showLoadingIndicator();
    
    try {
        // Call the backend API to calculate dates
        const response = await fetch(`${API_BASE_URL}/porting/calculate-dates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planEndDate,
                circleId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Display SMS date
            const smsDate = new Date(data.data.smsDate);
            const formattedDate = smsDate.toLocaleDateString('en-IN', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
            
            calculatedSmsDateSpan.textContent = formattedDate;
            smsDateInfoDiv.style.display = 'flex';
            
            // Save dates for form submission
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('calculatedSmsDate', data.data.smsDate);
                localStorage.setItem('calculatedPortingDate', data.data.portingDate);
            }
            
            // Update the minimum date for porting date input
            const scheduledDateInput = document.getElementById('scheduledDate');
            if (scheduledDateInput) {
                const minDate = new Date(data.data.smsDate);
                minDate.setDate(minDate.getDate() + 1); // At least one day after SMS date
                scheduledDateInput.min = minDate.toISOString().split('T')[0];
                
                // Set a default suggested date (one day after SMS date)
                const suggestedDate = new Date(data.data.smsDate);
                suggestedDate.setDate(suggestedDate.getDate() + 1);
                scheduledDateInput.value = suggestedDate.toISOString().split('T')[0];
            }
        } else {
            console.error('Error calculating dates:', data.error);
            smsDateInfoDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Error calling calculate dates API:', error);
        smsDateInfoDiv.style.display = 'none';
    } finally {
        hideLoadingIndicator();
    }
}

// Set minimum date for date inputs
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Format as YYYY-MM-DD
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];
    
    // Set min date for plan end date
    const planEndDateInput = document.getElementById('currentPlan');
    if (planEndDateInput) {
        planEndDateInput.min = formattedTomorrow;
    }
    
    // Set min date for porting date
    const portingDateInput = document.getElementById('scheduledDate');
    if (portingDateInput) {
        portingDateInput.min = formattedTomorrow;
    }
}

// Load Google Maps API
function loadGoogleMapsAPI() {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
        console.log('Google Maps API already loaded');
        setupSpecialFields();
        return;
    }
    
    // Use API key from config if available
    const apiKey = CONFIG.googleMapsApiKey || '';
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=mapsCallback`;
    script.async = true;
    script.defer = true;
    
    // Add error handler
    script.onerror = function() {
        console.error('Failed to load Google Maps API');
        const mapsErrorDiv = document.getElementById('mapsLoadingError');
        if (mapsErrorDiv) {
            mapsErrorDiv.style.display = 'block';
        }
    };
    
    // Add to document
    document.body.appendChild(script);
    
    // Define callback function (global scope)
    window.mapsCallback = function() {
        console.log('Google Maps API loaded successfully');
        setupSpecialFields();
    };
}

// Setup provider selection
function setupProviderSelection() {
    const providerCards = document.querySelectorAll('.provider-card');
    const newProviderInput = document.getElementById('newProvider');
    
    if (!providerCards.length || !newProviderInput) return;
    
    providerCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            providerCards.forEach(c => {
                c.classList.remove('selected');
            });
            
            // Add selected class to this card
            this.classList.add('selected');
            
            // Set hidden input value
            const provider = this.getAttribute('data-provider');
            newProviderInput.value = provider;
            
            // Find nearby centers if location is already entered
            const locationInput = document.getElementById('location');
            if (locationInput && locationInput.value) {
                findNearbyPortingCenters();
            }
        });
    });
}

// Initialize all providers from API
async function loadProviders() {
    const currentProviderSelect = document.getElementById('currentProvider');
    
    if (!currentProviderSelect) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/porting/providers`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Clear existing options except the default
            const defaultOption = currentProviderSelect.querySelector('option[disabled][selected]');
            currentProviderSelect.innerHTML = '';
            
            if (defaultOption) {
                currentProviderSelect.appendChild(defaultOption);
            }
            
            // Add providers from API
            data.data.forEach(provider => {
                const option = document.createElement('option');
                option.value = provider.code;
                option.textContent = provider.name;
                currentProviderSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading providers:', error);
    }
}

// Initialize all telecom circles from API
async function loadCircles() {
    const circleSelect = document.getElementById('currentCircle');
    
    if (!circleSelect) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/porting/circles`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Clear existing options except the default
            const defaultOption = circleSelect.querySelector('option[disabled][selected]');
            circleSelect.innerHTML = '';
            
            if (defaultOption) {
                circleSelect.appendChild(defaultOption);
            }
            
            // Add circles from API
            data.data.forEach(circle => {
                const option = document.createElement('option');
                option.value = circle.code;
                option.textContent = circle.name;
                circleSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading circles:', error);
    }
}

// Setup step navigation
function setupStepNavigation() {
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
}

// Show generic error message
function showError(message) {
    // Create error alert if it doesn't exist
    let errorAlert = document.querySelector('.form-error-alert');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.className = 'form-error-alert';
        
        const formContainer = document.querySelector('.schedule-form-container');
        if (formContainer) {
            formContainer.prepend(errorAlert);
        } else {
            // Fallback to body
            document.body.prepend(errorAlert);
        }
    }
    
    // Set message and show
    errorAlert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorAlert.classList.add('show');
    
    // Scroll to error
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.classList.remove('show');
    }, 5000);
}

// Show warning message
function showWarning(message) {
    // Create warning alert if it doesn't exist
    let warningAlert = document.querySelector('.warning-message');
    
    if (!warningAlert) {
        warningAlert = document.createElement('div');
        warningAlert.className = 'warning-message';
        
        const formContainer = document.querySelector('.schedule-form-container');
        if (formContainer) {
            formContainer.prepend(warningAlert);
        } else {
            // Fallback to body
            document.body.prepend(warningAlert);
        }
    }
    
    // Set message and show
    warningAlert.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    warningAlert.classList.add('show');
    
    // Scroll to warning
    warningAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        warningAlert.classList.remove('show');
    }, 5000);
}

// Helper function for debouncing
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

// URL for provider icons
function getProviderIcon(provider) {
    const providerLower = provider.toLowerCase();
    
    // Default icon
    let iconPath = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    
    // Provider-specific icons
    if (providerLower.includes('airtel')) {
        iconPath = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    } else if (providerLower.includes('jio')) {
        iconPath = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    } else if (providerLower.includes('vi') || providerLower.includes('vodafone')) {
        iconPath = 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png';
    } else if (providerLower.includes('bsnl')) {
        iconPath = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (providerLower.includes('mtnl')) {
        iconPath = 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    }
    
    return iconPath;
}

// Add custom styles for page
function addPortingStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .detection-icon {
            font-size: 18px;
            margin-right: 8px;
            color: var(--primary-color);
        }
        
        .centers-loading {
            text-align: center;
            padding: 20px;
            color: var(--text-light-muted);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .centers-loading i {
            margin-right: 10px;
            color: var(--primary-color);
        }
        
        .loading-indicator {
            display: none;
            align-items: center;
            justify-content: center;
            padding: 15px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .loading-indicator .spinner {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(var(--primary-rgb), 0.3);
            border-radius: 50%;
            border-top-color: var(--primary-color);
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }
        
        .loading-indicator span {
            color: var(--text-light);
            font-size: 14px;
        }
        
        .map-info-window {
            padding: 10px;
            max-width: 250px;
        }
        
        .map-info-window h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 14px;
            font-weight: 600;
        }
        
        .map-info-window p {
            margin: 5px 0;
            color: #666;
            font-size: 12px;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Function to update the porting tracker UI
function updatePortingTrackerUI() {
    const trackerContainer = document.getElementById('portingTracker');
    if (!trackerContainer) return;
    
    // Get the active step
    const activeStep = document.querySelector('.form-step.active');
    const currentStep = activeStep ? parseInt(activeStep.getAttribute('data-step')) : 1;
    
    // Define the porting stages
    const stages = [
        { name: 'Information', step: 1, icon: 'fa-user', status: currentStep > 1 ? 'completed' : (currentStep === 1 ? 'active' : 'pending') },
        { name: 'Provider', step: 2, icon: 'fa-mobile-alt', status: currentStep > 2 ? 'completed' : (currentStep === 2 ? 'active' : 'pending') },
        { name: 'Schedule', step: 3, icon: 'fa-calendar-alt', status: currentStep > 3 ? 'completed' : (currentStep === 3 ? 'active' : 'pending') },
        { name: 'Confirm', step: 4, icon: 'fa-check-circle', status: currentStep > 4 ? 'completed' : (currentStep === 4 ? 'active' : 'pending') }
    ];
    
    // Clear previous content
    trackerContainer.innerHTML = '';
    
    // Create the tracker UI
    const trackerHTML = `
        <div class="tracker-title">Porting Progress</div>
        <div class="tracker-stages">
            ${stages.map(stage => `
                <div class="tracker-stage ${stage.status}">
                    <div class="stage-icon"><i class="fas ${stage.icon}"></i></div>
                    <div class="stage-name">${stage.name}</div>
                    <div class="stage-status">${stage.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}</div>
                </div>
                ${stage.step < stages.length ? '<div class="tracker-connector"></div>' : ''}
            `).join('')}
        </div>
    `;
    
    // Set the HTML content
    trackerContainer.innerHTML = trackerHTML;
}

// Setup circle selection functionality
function setupCircleSelection() {
    const circleSelect = document.getElementById('currentCircle');
    const circleCards = document.querySelectorAll('.circle-card');
    
    if (!circleSelect) return;
    
    // Setup circle dropdown change events
    circleSelect.addEventListener('change', function() {
        // When circle changes, recalculate porting dates if plan end date is set
        const planEndDateInput = document.getElementById('currentPlan');
        if (planEndDateInput && planEndDateInput.value) {
            calculatePortingDates();
        }
    });
    
    // Setup circle cards if they exist (visual selection)
    if (circleCards.length) {
        circleCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove selected class from all cards
                circleCards.forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Add selected class to this card
                this.classList.add('selected');
                
                // Set dropdown value to match selected card
                const circle = this.getAttribute('data-circle');
                if (circleSelect) {
                    circleSelect.value = circle;
                    
                    // Trigger change event
                    const event = new Event('change');
                    circleSelect.dispatchEvent(event);
                }
            });
        });
    }
}

// Handle form submission
function submitForm(e) {
    e.preventDefault();
    
    // Validate the final step
    if (validateAllSteps()) {
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
        
        // Function to get auth token from localStorage
        const getAuthToken = () => localStorage.getItem('authToken') || '';
        
        // Send data to backend API
        fetch(`${API_BASE_URL}/porting/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
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
}

// Display success message
function displaySuccessMessage() {
    // Create success alert if it doesn't exist
    let successAlert = document.querySelector('.success-message');
    
    if (!successAlert) {
        successAlert = document.createElement('div');
        successAlert.className = 'success-message';
        
        const formContainer = document.querySelector('.schedule-form-container');
        if (formContainer) {
            formContainer.prepend(successAlert);
        } else {
            // Fallback to body
            document.body.prepend(successAlert);
        }
    }
    
    // Set message and show
    successAlert.innerHTML = `<i class="fas fa-check-circle"></i> Your porting request has been submitted successfully!`;
    successAlert.classList.add('show');
    
    // Scroll to success message
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Show confirmation step
    goToStep(5);
    updateProgressSteps(5);
}

// Display error message
function displayErrorMessage(message) {
    // Create error alert if it doesn't exist
    let errorAlert = document.querySelector('.form-error-alert');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.className = 'form-error-alert';
        
        const formContainer = document.querySelector('.schedule-form-container');
        if (formContainer) {
            formContainer.prepend(errorAlert);
        } else {
            // Fallback to body
            document.body.prepend(errorAlert);
        }
    }
    
    // Set message and show
    errorAlert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorAlert.classList.add('show');
    
    // Scroll to error
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.classList.remove('show');
    }, 5000);
}

// Check the eligibility of a number for porting
async function checkPortingEligibility(mobileNumber) {
    const statusDiv = document.getElementById('portingStatus');
    if (!statusDiv) return;
    
    // Show loading state
    statusDiv.innerHTML = '<p class="loading"><i class="fas fa-spinner fa-spin"></i> Checking eligibility...</p>';
    statusDiv.style.display = 'block';
    
    try {
        // Call API to check eligibility
        const response = await fetch(`${API_BASE_URL}/porting/check-eligibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobileNumber })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.data.eligible) {
                // Show eligible status
                statusDiv.innerHTML = `
                    <p class="eligible"><i class="fas fa-check-circle"></i> This number is eligible for porting!</p>
                    ${data.data.message ? `<p class="info">${data.data.message}</p>` : ''}
                `;
            } else {
                // Show ineligible status with reason
                statusDiv.innerHTML = `
                    <p class="ineligible"><i class="fas fa-times-circle"></i> This number is not eligible for porting.</p>
                    <p class="info">${data.data.reason || 'No specific reason provided.'}</p>
                `;
            }
        } else {
            // Show error
            statusDiv.innerHTML = `
                <p class="error"><i class="fas fa-exclamation-circle"></i> Error checking eligibility.</p>
                <p class="info">${data.error || 'Please try again later.'}</p>
            `;
        }
    } catch (error) {
        console.error('Error checking eligibility:', error);
        
        // Show error
        statusDiv.innerHTML = `
            <p class="error"><i class="fas fa-exclamation-circle"></i> Network error.</p>
            <p class="info">Please check your connection and try again.</p>
        `;
    }
}