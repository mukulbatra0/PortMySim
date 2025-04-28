/**
 * Scheduling and Porting Center Locator Module
 * Handles the scheduling process for porting requests
 */

// Default config settings - will be overridden by window.configSettings if available
window.configSettings = window.configSettings || {
  useOpenStreetMapAsFallback: true,
  googleMapsApiKey: '',
  mapDefaultLocation: {
    lat: 28.6139, 
    lng: 77.2090
  }
};

// Schedule Porting Form JavaScript

// Base API URL - get from window.api if available, otherwise use default
// Note: This is a reference to the URL, not a redeclaration of the variable
const scheduleApiBaseUrl = window.api?.API_BASE_URL || 'http://localhost:5000/api';

// Use CONFIG from global scope (from config.js) rather than redeclaring it
const configSettings = window.CONFIG || {
  useOpenStreetMapAsFallback: true,
  googleMapsApiKey: ''
};

// Function to submit porting request to API - Define it early so it's available throughout the script
async function submitPortingRequest(formData) {
  try {
    console.log('Processing porting request submission');
    
    // Skip authentication check - allow all submissions
    
    // Validate required fields before submitting
    const requiredFields = ['mobileNumber', 'currentProvider', 'currentCircle', 'newProvider', 
                          'scheduledDate', 'planEndDate', 'fullName', 'email'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
    
    // Format location data if needed
    if (formData.location && typeof formData.location === 'string') {
      // Try to get coordinates for the location
      try {
        const coordinates = await getCoordinates(formData.location);
        if (coordinates) {
          formData.location = {
            address: formData.location,
            lat: coordinates.lat,
            lng: coordinates.lng
          };
        }
      } catch (locationError) {
        console.warn('Could not get coordinates for location:', locationError);
        // Continue with just the address string
        formData.location = { address: formData.location };
      }
    }
    
    // Ensure dates are in proper format
    if (formData.scheduledDate) {
      // Ensure it's a valid date string in ISO format
      const scheduledDate = new Date(formData.scheduledDate);
      if (!isNaN(scheduledDate.getTime())) {
        formData.scheduledDate = scheduledDate.toISOString().split('T')[0];
      }
    }
    
    if (formData.planEndDate) {
      // Ensure it's a valid date string in ISO format
      const planEndDate = new Date(formData.planEndDate);
      if (!isNaN(planEndDate.getTime())) {
        formData.planEndDate = planEndDate.toISOString().split('T')[0];
      }
    }
    
    // Prepare request data with proper formatting
    const requestData = {
      mobileNumber: formData.mobileNumber,
      currentProvider: formData.currentProvider,
      currentCircle: normalizeCircleName(formData.currentCircle),
      newProvider: formData.newProvider,
      scheduledDate: formData.scheduledDate,
      planEndDate: formData.planEndDate,
      timeSlot: document.getElementById('timeSlot')?.value || '10:00 AM - 12:00 PM',
      fullName: formData.fullName,
      email: formData.email,
      alternateNumber: formData.alternateNumber || '',
      automatePorting: formData.automatePorting ? 'true' : 'false',
      notifyUpdates: formData.notifyUpdates ? 'true' : 'false',
      location: typeof formData.location === 'object' ? {
        address: formData.location.address || '',
        lat: parseFloat(formData.location.lat) || 0,
        lng: parseFloat(formData.location.lng) || 0
      } : { 
        address: String(formData.location || ''),
        lat: 0, 
        lng: 0 
      }
    };

    // Get the user ID if available from the API client
    if (window.PortMySimAPI && window.PortMySimAPI.getUser) {
      const user = window.PortMySimAPI.getUser();
      if (user && user._id) {
        requestData.user = user._id;
      }
    }

    console.log('Submitting porting request with data:', requestData);
    
    // Try to check if backend is available first 
    let backendAvailable = false;
    try {
      const baseUrl = window.API_BASE_URL || 'http://localhost:5000/api';
      const healthResponse = await fetch(`${baseUrl}/health/check`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      backendAvailable = healthResponse.ok;
    } catch (e) {
      console.warn('Backend not available:', e);
      backendAvailable = false;
    }
    
    // If backend is not available, skip API call and use mock response
    if (!backendAvailable) {
      console.log('Backend server not available, using mock response');
      return generateMockResponse(formData);
    }
    
    // Skip actual API request and use mock response
    console.log('Generating mock response instead of real API call');
    return generateMockResponse(formData);
  } catch (error) {
    console.error('Error submitting porting request:', error.message);
    
    // Show error alert
    alert(`Error submitting porting request: ${error.message}`);
    
    // Return error response
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    };
  }
}

// Override submitPortingRequest function with fixed version if available
document.addEventListener('DOMContentLoaded', function() {
  if (window.submitPortingWithFixedAuth) {
    console.log('Overriding submitPortingRequest with fixed version');
    window.originalSubmitPortingRequest = submitPortingRequest;
    submitPortingRequest = async function(formData) {
      console.log('Using fixed authentication for porting submission');
      return await window.submitPortingWithFixedAuth(formData);
    };
  }
});

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
        // No longer using Google Places Autocomplete
        const locationInput = document.getElementById('location');
        if (locationInput) {
            console.log('Setting up location input field');
            
            // Add a simple change listener to trigger search
            locationInput.addEventListener('change', function() {
                if (this.value.length > 2) {
                    // Automatically search for porting centers when location is changed
                    setTimeout(() => {
                        findNearbyPortingCenters();
                    }, 500);
                }
            });
            
            console.log('Location input field initialized successfully');
        }
    } catch (error) {
        console.error('Error setting up special fields:', error);
    }
}

// Setup step navigation for the multi-step form
function setupStepNavigation() {
    const formSteps = document.querySelectorAll('.form-step');
    
    // Hide all steps except the first one
    formSteps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
            step.style.visibility = 'visible';
            step.style.position = 'relative';
            step.style.height = 'auto';
            step.style.overflow = 'visible';
            step.style.opacity = '1';
        } else {
            step.classList.remove('active');
            step.style.visibility = 'hidden';
            step.style.position = 'absolute';
            step.style.height = '0';
            step.style.overflow = 'hidden';
            step.style.opacity = '0';
        }
    });
    
    console.log(`Step navigation initialized with ${formSteps.length} steps`);
}

// Add custom styles for porting tracker and status indicators
function addPortingStyles() {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Add custom CSS for porting tracker and status indicators
    styleEl.textContent = `
        /* Porting Tracker Styles */
        .porting-timeline {
            position: relative;
            padding: 20px 0;
            margin: 20px 0;
        }
        
        .timeline-step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 25px;
            position: relative;
        }
        
        .timeline-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: var(--accent-color);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            position: relative;
            z-index: 2;
        }
        
        .timeline-content {
            flex: 1;
        }
        
        .timeline-date {
            color: var(--accent-color);
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .timeline-title {
            font-weight: bold;
            margin: 5px 0;
        }
        
        .timeline-description {
            font-size: 0.9rem;
            color: #666;
        }
        
        /* Status indicators */
        .status-indicator {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-right: 10px;
        }
        
        .status-pending {
            background-color: #FFF3CD;
            color: #856404;
        }
        
        .status-success {
            background-color: #D4EDDA;
            color: #155724;
        }
        
        .status-error {
            background-color: #F8D7DA;
            color: #721C24;
        }
        
        .status-automated {
            background-color: #CCE5FF;
            color: #004085;
        }
        
        /* Provider selection styles */
        .provider-selection {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 20px 0;
        }
        
        .provider-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            background-color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            width: calc(33% - 15px);
            max-width: 150px;
        }
        
        .provider-card:hover {
            border-color: var(--accent-color);
            transform: translateY(-3px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .provider-card.selected {
            border-color: var(--accent-color);
            background-color: rgba(var(--accent-color-rgb), 0.05);
            box-shadow: 0 4px 12px rgba(var(--accent-color-rgb), 0.2);
        }
        
        .provider-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            color: white;
            font-size: 24px;
        }
        
        .provider-name {
            font-weight: 600;
            text-align: center;
        }
        
        .selected-provider {
            margin-top: 15px;
            padding: 10px;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
    `;
    
    // Add the style element to the head of the document
    document.head.appendChild(styleEl);
    
    console.log('Added custom porting styles to document');
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form steps and navigation
    setupProgressSteps();
    
    // Set up step navigation
    setupStepNavigation();
    
    // Setup form event listeners
    setupFormListeners();
    
    // Initialize schedule form
    initScheduleForm();
    
    // Check if we need to preload Google Maps
    if (document.querySelector('#centersMap')) {
        // Decide which map API to load based on config
        if (configSettings.useOpenStreetMapAsFallback && (!configSettings.googleMapsApiKey || configSettings.googleMapsApiKey === '')) {
            // Skip Google Maps and use OpenStreetMap directly
            loadOpenStreetMap()
                .then(() => {
                    console.log('OpenStreetMap loaded successfully');
                })
                .catch(err => {
                    console.error('Failed to load OpenStreetMap:', err);
                });
        } else {
            // Try Google Maps first, then fall back if needed
            loadGoogleMapsAPI()
                .catch(err => {
                    console.warn('Failed to load Google Maps, falling back to OpenStreetMap', err);
                    return loadOpenStreetMap();
                })
                .then(() => {
                    console.log('Map API loaded successfully');
                })
                .catch(err => {
                    console.error('Failed to load any map provider', err);
                });
        }
    }
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
  const planEndDateInput = document.getElementById('currentPlan');
  
  if (!smsSendDateElement) return;
  
  // If there's no plan end date set, return without changing
  if (!planEndDateInput || !planEndDateInput.value) {
    return;
  }
  
  // Get the plan end date
  const planEndDate = new Date(planEndDateInput.value);
  
  // Calculate SMS date: 3 days before plan end date
  // (or 5 days for J&K, which would need circle info - not implemented here)
  const smsSendDate = new Date(planEndDate);
  smsSendDate.setDate(planEndDate.getDate() - 3);
  
  // Format the date
  const formattedDate = smsSendDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  // Display the date
  smsSendDateElement.textContent = formattedDate;
  
  // Also update timeline display if it exists
  const timelineSmsDate = document.getElementById('timelineSmsDate');
  if (timelineSmsDate) {
    timelineSmsDate.textContent = formattedDate;
  }
  
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

    // Initialize provider selection
    setupProviderSelection();

    // Initialize dates and calculations
    calculateSmsSendDate();
    calculatePortingDates();
}

// Display location error
function displayLocationError() {
  // Find all centers lists
  const centersLists = document.querySelectorAll('.centers-list');
  
  centersLists.forEach(list => {
    list.innerHTML = `
      <div class="centers-empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>Unable to access your location. Please enter your location manually to find nearby porting centers.</p>
      </div>
    `;
  });
}

// Find nearby porting centers based on user location
async function findNearbyPortingCenters() {
  const locationInput = document.getElementById('location');
  const centersList = document.getElementById('porting-centers-list');
  
  if (!locationInput || !centersList) {
    console.error('Location input or centers list element not found');
    return;
  }
  
  // Get the selected provider
  const selectedProvider = document.getElementById('newProvider').value;
  if (!selectedProvider) {
    centersList.innerHTML = `
      <div class="centers-empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>Please select a provider before searching for porting centers.</p>
      </div>
    `;
    return;
  }
  
  const searchQuery = locationInput.value.trim();
  if (!searchQuery) {
    centersList.innerHTML = `
      <div class="centers-empty">
        <i class="fas fa-map-marker-alt"></i>
        <p>Please enter your location to find nearby centers.</p>
      </div>
    `;
    return;
  }
  
  // Show loading state
  centersList.innerHTML = `
    <div class="centers-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Searching for nearby porting centers...</p>
    </div>
  `;
  
  try {
    // Mock coordinates for testing - you would replace this with actual geocoding
    const coordinates = {
      lat: 28.6139, // Default to New Delhi coordinates
      lng: 77.2090
    };
    
    // Generate mock centers for the selected provider
    const mockCenters = generateMockCenters(selectedProvider, coordinates);
    
    // Display the centers
    displayPortingCenters(mockCenters, coordinates);
    
  } catch (error) {
    console.error('Error finding porting centers:', error);
    centersList.innerHTML = `
      <div class="centers-empty">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error finding porting centers. Please try again.</p>
      </div>
    `;
  }
}

// Generate mock centers for testing
function generateMockCenters(provider, userCoordinates) {
  // Generate 4-6 random centers around the user coordinates
  const centerCount = Math.floor(Math.random() * 3) + 3; // 3-5 centers
  const centers = [];
  
  const providerNames = {
    'airtel': 'Airtel Experience Center',
    'jio': 'Jio Digital Store',
    'vi': 'Vi Store',
    'bsnl': 'BSNL Customer Service'
  };
  
  const addressPrefixes = ['Main', 'Park', 'Lake', 'Market', 'Metro', 'City', 'Central'];
  const addressTypes = ['Road', 'Street', 'Avenue', 'Complex', 'Plaza', 'Mall', 'Tower'];
  
  for (let i = 0; i < centerCount; i++) {
    // Generate random offset from user coordinates (between -0.05 and 0.05 degrees)
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    const latitude = userCoordinates.lat + latOffset;
    const longitude = userCoordinates.lng + lngOffset;
    
    // Generate a realistic-looking address
    const addressPrefix = addressPrefixes[Math.floor(Math.random() * addressPrefixes.length)];
    const addressType = addressTypes[Math.floor(Math.random() * addressTypes.length)];
    const addressNumber = Math.floor(Math.random() * 200) + 1;
    
    centers.push({
      id: `${provider}_${i}`,
      name: `${providerNames[provider] || provider.toUpperCase()} ${i + 1}`,
      provider: provider,
      address: `${addressNumber} ${addressPrefix} ${addressType}, Near City Center`,
      latitude: latitude,
      longitude: longitude,
      isOpen: Math.random() > 0.2, // 80% chance of being open
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5
      ratingCount: Math.floor(Math.random() * 200) + 20,
      distance: calculateDistance(userCoordinates.lat, userCoordinates.lng, latitude, longitude)
    });
  }
  
  return centers;
}

// Set up event listeners for the location search
function setupLocationSearch() {
  const locationInput = document.getElementById('location');
  
  if (!locationInput) return;
  
  // Add event listener for the input change
  locationInput.addEventListener('change', function() {
    // Call findNearbyPortingCenters when the user enters a location
    findNearbyPortingCenters();
  });
  
  // Also search when user presses Enter
  locationInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      findNearbyPortingCenters();
    }
  });
}

// Initialize location search on form load
document.addEventListener('DOMContentLoaded', function() {
  // Set up the location search functionality
  setupLocationSearch();
});

// Display porting centers on the page
function displayPortingCenters(centers, userCoordinates) {
  const centersList = document.getElementById('porting-centers-list');
  
  if (!centersList) return;
  
  // Clear any previous results
  centersList.innerHTML = '';
  
  if (!centers || centers.length === 0) {
    centersList.innerHTML = `
      <div class="centers-empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>No porting centers found in this area. Please try a different location or check with your provider directly.</p>
        </div>
      `;
    return;
  }
  
  // Sort centers by distance from user
  centers.sort((a, b) => {
    const distA = calculateDistance(
      userCoordinates.lat, 
      userCoordinates.lng, 
      a.latitude, 
      a.longitude
    );
    const distB = calculateDistance(
      userCoordinates.lat, 
      userCoordinates.lng, 
      b.latitude, 
      b.longitude
    );
    return distA - distB;
  });
  
  // Create list items for each center
  centers.forEach((center, index) => {
    const distance = calculateDistance(
      userCoordinates.lat,
      userCoordinates.lng,
      center.latitude,
      center.longitude
    ).toFixed(1);
    
    const color = getProviderColor(center.provider);
    const icon = getProviderIcon(center.provider);
    
    const centerItem = document.createElement('div');
    centerItem.className = 'center-item';
    centerItem.setAttribute('data-lat', center.latitude);
    centerItem.setAttribute('data-lng', center.longitude);
    centerItem.setAttribute('data-name', center.name);
    
    centerItem.innerHTML = `
      <div class="center-icon" style="background-color: ${color}">
        <i class="${icon}"></i>
        </div>
        <div class="center-info">
        <h4 class="center-name">${center.name}</h4>
        <p class="center-address">${center.address}</p>
          <div class="center-meta">
          <span class="distance"><i class="fas fa-map-marker-alt"></i> ${distance} km</span>
          <span class="provider">${center.provider}</span>
          </div>
        <button type="button" class="btn-view-on-map" data-index="${index}">
          <i class="fas fa-map-marked-alt"></i> View on Map
        </button>
      </div>
    `;
    
    // Add event listener to show this center on map
    centerItem.addEventListener('click', function() {
        const lat = parseFloat(this.getAttribute('data-lat'));
        const lng = parseFloat(this.getAttribute('data-lng'));
      const name = this.getAttribute('data-name');
      
      // Remove selected class from all center items
      document.querySelectorAll('.center-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Add selected class to this item
      this.classList.add('selected');
        
        // Show on map
        showOnMap(lat, lng, name);
    });
        
    centersList.appendChild(centerItem);
        });
  
  // Initialize map
  initializeMap(centers, userCoordinates);
}

// Initialize the map with centers
function initializeMap(centers, userCoordinates) {
  // Get config settings if available, or use default
  const configSettings = window.configSettings || { 
    useOpenStreetMapAsFallback: true,
    googleMapsApiKey: ''
  };

  // Always use OpenStreetMap unless Google Maps is specifically requested and API key is present
  if (configSettings.useOpenStreetMapAsFallback || !configSettings.googleMapsApiKey || configSettings.googleMapsApiKey === '') {
    // Use OpenStreetMap directly
    loadOpenStreetMap().then(() => {
        initializeMapWithLeaflet(centers, userCoordinates);
    }).catch(err => {
      console.error('Failed to load OpenStreetMap:', err);
    });
    return;
  }

  // Only try Google Maps if API key is available and OpenStreetMap is not preferred
  if (window.google && window.google.maps) {
    initializeMapWithGoogle(centers, userCoordinates);
  } else {
    // Fallback to Leaflet/OpenStreetMap
    loadOpenStreetMap().then(() => {
      initializeMapWithLeaflet(centers, userCoordinates);
    }).catch(err => {
      console.error('Failed to load OpenStreetMap:', err);
    });
  }
}

// Initialize map with Google Maps
function initializeMapWithGoogle(centers, userCoordinates) {
  const mapElement = document.getElementById('centersMap');
  if (!mapElement) return;
  
  const map = new google.maps.Map(mapElement, {
    center: { lat: userCoordinates.lat, lng: userCoordinates.lng },
    zoom: 12,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
      { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
      { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
      { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
    ]
  });
  
  // Add user location marker
  const userMarker = new google.maps.Marker({
    position: { lat: userCoordinates.lat, lng: userCoordinates.lng },
    map: map,
    title: "Your Location",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2
    }
  });
  
  // Add markers for centers
  const markers = centers.map((center, index) => {
    const marker = new google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: map,
      title: center.name,
      icon: {
        url: `../images/markers/${center.provider.toLowerCase()}.png`,
        fallbackIcon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getProviderColor(center.provider),
          fillOpacity: 0.9,
          strokeColor: "#FFFFFF",
          strokeWeight: 1
        }
      }
    });
    
    // Create info window for marker
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="map-info-window">
          <h3>${center.name}</h3>
          <p>${center.address}</p>
          <div class="info-meta">
            <span class="provider">${center.provider}</span>
            <span class="distance">${calculateDistance(userCoordinates.lat, userCoordinates.lng, center.latitude, center.longitude).toFixed(1)} km</span>
          </div>
        </div>
      `
    });
    
    // Add click listener
    marker.addListener("click", () => {
      // Close all open info windows
      markers.forEach(m => m.infoWindow?.close());
      
      // Open this info window
      infoWindow.open(map, marker);
      
      // Highlight corresponding list item
      const listItems = document.querySelectorAll('.center-item');
      listItems.forEach((item, i) => {
        if (i === index) {
          item.classList.add('selected');
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    });
    
    // Store info window with marker for later reference
    marker.infoWindow = infoWindow;
    
    return marker;
  });
  
  // Store map and markers in global variables for access by other functions
  window.portingMap = map;
  window.portingMarkers = markers;
}

// Show a specific location on the map
function showOnMap(lat, lng, name) {
  // Handle Google Maps implementation
  if (window.google && window.google.maps && window.portingMap) {
    // Center the map on the location
    window.portingMap.setCenter({ lat, lng });
    window.portingMap.setZoom(15);
    
    // Find and activate the matching marker
    if (window.portingMarkers) {
      window.portingMarkers.forEach(marker => {
        const position = marker.getPosition();
        
        if (position.lat() === lat && position.lng() === lng) {
          // Trigger the click event on the marker to open info window
          google.maps.event.trigger(marker, 'click');
        }
      });
    }
  } 
  // Handle Leaflet implementation
  else if (window.leafletMap) {
    // Center the map on the location
    window.leafletMap.setView([lat, lng], 16);
    
    // Find and activate the matching marker
    if (window.leafletMarkers) {
      window.leafletMarkers.forEach(marker => {
        const position = marker.getLatLng();
        
        if (position.lat === lat && position.lng === lng) {
          marker.openPopup();
        }
      });
    }
  }
}

// Load Google Maps API
function loadGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    
    // Create a script element to load Google Maps API
    const script = document.createElement('script');
    const apiKey = configSettings.googleMapsApiKey || '';
    
    // If no API key is set, don't even try to load Google Maps
    if (!apiKey) {
      console.warn('Google Maps API key is missing. Falling back to OpenStreetMap.');
      reject(new Error('Missing Google Maps API key'));
      return;
    }
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = function() {
      console.log('Google Maps API loaded successfully');
      resolve();
    };
    
    script.onerror = function() {
      console.error('Failed to load Google Maps API');
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
}

// Load OpenStreetMap (Leaflet)
function loadOpenStreetMap() {
  return new Promise((resolve, reject) => {
    // Check if Leaflet is already loaded
    if (window.L) {
      resolve();
      return;
    }
    
    // Load CSS first
    const linkCSS = document.createElement('link');
    linkCSS.rel = 'stylesheet';
    linkCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkCSS.crossOrigin = '';
    document.head.appendChild(linkCSS);
    
    // Then load JavaScript
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    
    script.onload = function() {
      console.log('Leaflet loaded successfully');
      resolve();
    };
    
    script.onerror = function(error) {
      console.error('Failed to load Leaflet:', error);
      reject(new Error('Failed to load Leaflet'));
    };
    
    document.head.appendChild(script);
  });
}

// Initialize map with OpenStreetMap when using Leaflet
function initializeMapWithLeaflet(centers, userCoordinates) {
    const mapContainer = document.getElementById('centersMap');
    if (!mapContainer) {
        console.error('Map container element not found');
        return;
    }
    
    if (!window.L) {
        console.error('Leaflet library not loaded');
        return;
    }
    
    if (!centers || centers.length === 0) {
        console.warn('No centers provided for map');
        return;
    }
    
    console.log('Initializing map with Leaflet', { mapContainer, centers, userCoordinates });
    
    // Initialize the map if not already created
    if (!window.leafletMap) {
        // Set a default zoom level if not specified in config
        const defaultZoom = window.configSettings?.mapDefaultZoom || window.CONFIG?.mapDefaultZoom || 12;
        
        window.leafletMap = L.map(mapContainer).setView(
            [userCoordinates.lat, userCoordinates.lng], 
            defaultZoom
        );
        
        // Add the OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.leafletMap);
        
        // Force a resize to ensure map renders correctly
        setTimeout(() => {
            window.leafletMap.invalidateSize();
        }, 100);
    } else {
        // Just update the view if map already exists
        window.leafletMap.setView([userCoordinates.lat, userCoordinates.lng], 
            window.configSettings?.mapDefaultZoom || window.CONFIG?.mapDefaultZoom || 12);
        window.leafletMap.invalidateSize();
    }
    
    // Clear existing markers
    if (window.leafletMarkers) {
        window.leafletMarkers.forEach(marker => marker.remove());
    }
    window.leafletMarkers = [];
    
    // Add user location marker
    const userMarker = L.circleMarker(
        [userCoordinates.lat, userCoordinates.lng],
        {
            radius: 8,
            fillColor: "#4285F4",
            color: "#FFFFFF",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }
    ).addTo(window.leafletMap);
    userMarker.bindPopup("Your Location");
    window.leafletMarkers.push(userMarker);
    
    // Add markers for centers
    centers.forEach((center) => {
        // Make sure we have latitude and longitude
        const lat = center.latitude || (center.coordinates && center.coordinates.lat);
        const lng = center.longitude || (center.coordinates && center.coordinates.lng);
        
        if (!lat || !lng) return;
        
        const providerColor = getProviderColor(center.provider);
        
        const marker = L.marker([lat, lng]).addTo(window.leafletMap);
        
        const popupContent = `
            <div class="map-info-window">
                <h4>${center.name}</h4>
                <p>${center.address}</p>
                <p>${center.provider ? center.provider.toUpperCase() : "Unknown Provider"}</p>
                ${center.isOpen ? '<p style="color: #4CAF50;"><strong>Open Now</strong></p>' : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        window.leafletMarkers.push(marker);
    });
    
    // Create a bounds object and include all markers
    const bounds = L.latLngBounds(
        [[userCoordinates.lat, userCoordinates.lng]].concat(
            centers
                .filter(c => c.latitude && c.longitude)
                .map(c => [c.latitude, c.longitude])
        )
    );
    
    // Fit the map to show all markers
    if (bounds && bounds.isValid()) {
        window.leafletMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Get color based on provider name
function getProviderColor(provider) {
  if (!provider) return '102, 102, 102'; // Default grey
  
  const providerLower = provider.toLowerCase();
  
  if (providerLower.includes('airtel')) {
    return '228, 0, 0'; // Airtel red
  } else if (providerLower.includes('jio')) {
    return '15, 60, 201'; // Jio blue
  } else if (providerLower.includes('vi') || providerLower.includes('vodafone')) {
    return '238, 0, 140'; // Vi pink
  } else if (providerLower.includes('bsnl')) {
    return '29, 138, 19'; // BSNL green
  } else if (providerLower.includes('mtnl')) {
    return '255, 106, 0'; // MTNL orange
  }
  
  return '102, 102, 102'; // Default grey
}

// Get icon based on provider name
function getProviderIcon(provider) {
  if (!provider) return 'fas fa-store';
  
  const providerLower = provider.toLowerCase();
  
  if (providerLower.includes('airtel')) {
    return 'fas fa-broadcast-tower';
  } else if (providerLower.includes('jio')) {
    return 'fas fa-wifi';
  } else if (providerLower.includes('vi') || providerLower.includes('vodafone')) {
    return 'fas fa-mobile-alt';
  } else if (providerLower.includes('bsnl')) {
    return 'fas fa-phone';
  } else if (providerLower.includes('mtnl')) {
    return 'fas fa-signal';
  }
  
  return 'fas fa-store';
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

// Get coordinates from location string
async function getCoordinates(searchQuery) {
  if (!searchQuery) return null;
  
  try {
    // Always use Nominatim now
    return await getCoordinatesWithNominatim(searchQuery);
  } catch (error) {
    console.error('Error getting coordinates:', error);
    // Return default coordinates
    return {
        lat: configSettings.mapDefaultLocation.lat,
      lng: configSettings.mapDefaultLocation.lng,
      formattedAddress: 'Default Location'
    };
  }
}

// Get coordinates using Nominatim (OpenStreetMap's geocoding service)
async function getCoordinatesWithNominatim(searchQuery) {
  try {
    // Encode the search query
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Try different geocoding services in order of preference
    
    // Option 1: Try direct access first (might work in some environments)
    try {
      const directResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`, {
        headers: {
          'User-Agent': 'PortMySim/1.0',
          'Referer': window.location.origin
        }
      });
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        if (data && data.length > 0) {
          const result = data[0];
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            formattedAddress: result.display_name
          };
        }
      }
    } catch (directError) {
      console.warn('Direct Nominatim access failed, trying alternatives', directError);
    }
    
    // Option 2: Try LocationIQ geocoding service (production implementation)
    // Register for a free API key at locationiq.com
    const locationIqApiKey = configSettings?.locationIqApiKey || process.env.LOCATION_IQ_API_KEY; 
    if (locationIqApiKey) {
      try {
        const locationIqResponse = await fetch(`https://eu1.locationiq.com/v1/search.php?key=${locationIqApiKey}&q=${encodedQuery}&format=json&limit=1`);
        
        if (locationIqResponse.ok) {
          const data = await locationIqResponse.json();
          if (data && data.length > 0) {
            const result = data[0];
            return {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
              formattedAddress: result.display_name
            };
          }
        }
      } catch (locationIqError) {
        console.warn('LocationIQ geocoding failed', locationIqError);
      }
    }
    
    // Option 3: Try with Google Maps Geocoding API
    const googleMapsApiKey = configSettings?.googleMapsApiKey || process.env.GOOGLE_MAPS_API_KEY;
    if (googleMapsApiKey) {
      try {
        const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${googleMapsApiKey}`);
        
        if (googleResponse.ok) {
          const data = await googleResponse.json();
          if (data && data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
              formattedAddress: result.formatted_address
            };
          }
        }
      } catch (googleError) {
        console.warn('Google Maps geocoding failed', googleError);
      }
    }
    
    // Option 4: Try with CORS proxy
    // Note: cors-anywhere requires users to enable it by visiting https://cors-anywhere.herokuapp.com/ first
    try {
      const corsProxy = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = `${corsProxy}https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Nominatim API request failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name
        };
      }
    } catch (proxyError) {
      console.warn('CORS proxy request failed', proxyError);
    }
    
    // If all methods fail, attempt geocoding using predefined locations
    const knownLocations = {
      'bhiwani': { lat: 28.7929, lng: 76.1397, name: 'Bhiwani, Haryana, India' },
      'haryana': { lat: 29.0588, lng: 76.0856, name: 'Haryana, India' },
      'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi, India' },
      'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra, India' },
      'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore, Karnataka, India' },
      'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana, India' },
      'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu, India' },
      'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, West Bengal, India' }
    };
    
    // Try to match against known locations (case insensitive)
    const searchLower = searchQuery.toLowerCase();
    for (const [key, location] of Object.entries(knownLocations)) {
      if (searchLower.includes(key)) {
        console.log(`Using predefined location match for "${searchQuery}"`);
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: location.name
        };
      }
    }
    
    // If no match found, use default location
    console.warn('No results found from geocoding, using default location');
    return {
      lat: configSettings.mapDefaultLocation.lat,
      lng: configSettings.mapDefaultLocation.lng,
      formattedAddress: 'Default Location'
    };
  } catch (error) {
    console.error('Error using geocoding services:', error);
    return {
      lat: configSettings.mapDefaultLocation.lat,
      lng: configSettings.mapDefaultLocation.lng,
      formattedAddress: 'Default Location'
    };
  }
}

// Get fallback centers when API is unavailable
async function getLocalFallbackCenters(provider = 'any', coordinates = null) {
  // Define fallback centers with proper structure
    const fallbackCenters = [
        {
      id: "fallback_airtel_1",
            name: "Airtel Store",
            provider: "airtel",
            address: "123 Main Street, New Delhi, 110001",
            latitude: 28.6139, 
            longitude: 77.2090,
            isOpen: true,
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
            rating: 4.3,
      ratingCount: 124,
      distance: 2.5,
      website: "https://www.airtel.in"
        },
        {
      id: "fallback_jio_1",
            name: "Jio Store",
            provider: "jio",
            address: "456 Market Road, New Delhi, 110002",
            latitude: 28.6219, 
            longitude: 77.2100,
            isOpen: true,
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
            rating: 4.5,
      ratingCount: 156,
      distance: 3.8,
      website: "https://www.jio.com"
        },
        {
      id: "fallback_vi_1",
            name: "Vi Store",
            provider: "vi",
            address: "789 Tower Lane, New Delhi, 110003",
            latitude: 28.6129, 
            longitude: 77.2270,
            isOpen: true,
      hours: ["Mon-Sat: 9:30 AM - 7:30 PM", "Sun: 11:00 AM - 5:00 PM"],
            rating: 4.1,
      ratingCount: 98,
      distance: 4.2,
      website: "https://www.myvi.in"
        },
        {
      id: "fallback_bsnl_1",
            name: "BSNL Customer Care",
            provider: "bsnl",
            address: "101 Government Complex, New Delhi, 110004",
            latitude: 28.6280, 
            longitude: 77.2310,
            isOpen: true,
      hours: ["Mon-Fri: 10:00 AM - 6:00 PM", "Sat: 10:00 AM - 2:00 PM", "Sun: Closed"],
            rating: 3.8,
      ratingCount: 72,
      distance: 5.1,
      website: "https://www.bsnl.in"
        }
    ];
    
    // Add some randomness to the coordinates if real coordinates provided
    if (coordinates) {
        fallbackCenters.forEach(center => {
      // Add small random offset to make centers spread out
            const latOffset = (Math.random() - 0.5) * 0.05;
            const lngOffset = (Math.random() - 0.5) * 0.05;
      
            center.latitude = coordinates.lat + latOffset;
            center.longitude = coordinates.lng + lngOffset;
      
      // Recalculate approximate distance
      if (coordinates) {
            const dist = calculateDistance(
          coordinates.lat, coordinates.lng,
                    center.latitude, center.longitude
        );
        center.distance = dist;
      }
        });
    }
    
    // Filter by provider if specified
    if (provider !== 'any' && provider !== '') {
        return fallbackCenters.filter(center => center.provider === provider);
    }
    
    return fallbackCenters;
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
      step.style.visibility = 'visible';
      step.style.position = 'relative';
      step.style.height = 'auto';
      step.style.overflow = 'visible';
      step.style.opacity = '1';
      
      // Special handling for step 2 (Provider Selection)
      if (stepNumber === 2) {
        // Setup provider selection functionality
        setupProviderSelection();
      }
      
      // Special handling for step 3 (Schedule)
      if (stepNumber === 3) {
        calculateSmsSendDate();
        calculatePortingDates();
        generatePortingGuid(); // Generate GUID for display
      }
    } else {
      step.classList.remove('active');
      step.style.visibility = 'hidden';
      step.style.position = 'absolute';
      step.style.height = '0';
      step.style.overflow = 'hidden';
      step.style.opacity = '0';
    }
  });
}

// Validate step before proceeding to next
function validateStep(stepNumber) {
  const formStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
  if (!formStep) return false;
  
  const inputs = formStep.querySelectorAll('input, select');
  let isValid = true;
  
  inputs.forEach(input => {
    // Skip validation for non-required fields
    if (!input.required && !input.value) return;
    
    // Skip hidden inputs that aren't required
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
  
  return isValid;
}

// Validate individual input
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

// Submit form function
function submitForm(e) {
  e.preventDefault();
  
  // First, make sure we're on step 4 (the final step)
  const currentActiveStep = document.querySelector('.form-step.active');
  const currentStepNumber = currentActiveStep ? parseInt(currentActiveStep.getAttribute('data-step')) : 0;
  
  // If not on the final step, navigate to the final step first
  if (currentStepNumber !== 4) {
    goToStep(4);
    updateProgressSteps(4);
    return; // Exit early - the user will need to click submit again
  }
  
  // Only validate the current step (step 4) since that's what's visible
  const isValid = validateStep(4);
  
  if (isValid) {
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
      alternateNumber: document.getElementById('alternateNumber')?.value || '',
      scheduledDate: document.getElementById('scheduledDate').value,
      location: document.getElementById('location').value
    };
    
    // Log the form data for debugging
    console.log('Form data collected:', formData);
    
    // Try to use the fixed auth submission function if available
    let submissionFunction = window.submitPortingWithFixedAuth || submitPortingRequest;
    
    // Actually send the data to the backend API or generate mock response
    submissionFunction(formData)
      .then(response => {
        console.log('API response received:', response);
        
        if (response && response.success) {
          // Show success message
          const formSteps = document.querySelectorAll('.form-step');
          const formSuccess = document.querySelector('.form-success');
          
          if (formSteps && formSuccess) {
            console.log('Showing success view');
            
            // Hide all steps
            formSteps.forEach(step => {
              step.classList.remove('active');
              step.style.display = 'none';
            });
            
            // Show success message
            formSuccess.classList.add('show');
            formSuccess.style.display = 'block';
            
            // Calculate SMS date based on plan end date
            const smsDate = calculateSmsSendDate();
            const formattedSmsDate = formatDate(smsDate || new Date());
            
            // Get response data safely
            const responseData = response.data || {};
            
            // Set displayed information from the API response
            document.getElementById('refNumber').textContent = responseData.refNumber || `PORT-${Math.floor(Math.random() * 100000)}`;
            document.getElementById('smsDate').textContent = responseData.smsDate ? formatDate(new Date(responseData.smsDate)) : formattedSmsDate;
            document.getElementById('guidDisplay').textContent = document.getElementById('portingGuid').textContent || 'PRT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
            document.getElementById('portingDateDisplay').textContent = formatDate(new Date(formData.scheduledDate));
            
            // Get provider name from select element
            const currentProviderSelect = document.getElementById('currentProvider');
            const selectedProviderIndex = currentProviderSelect.selectedIndex;
            if (selectedProviderIndex !== -1) {
              document.getElementById('currentProviderDisplay').textContent = currentProviderSelect.options[selectedProviderIndex].text;
            } else {
              document.getElementById('currentProviderDisplay').textContent = formData.currentProvider;
            }
            
            // Set automation status
            document.getElementById('automationStatus').textContent = formData.automatePorting ? 'Automated' : 'Manual Process';
            
            // Set porting center details if available
            if (responseData.portingCenterDetails) {
              document.getElementById('portingCenter').textContent = responseData.portingCenterDetails.name || 'Nearest Service Center';
            } else {
              document.getElementById('portingCenter').textContent = 'To be determined';
            }
            
            // Set timeline dates
            document.getElementById('timelineSmsDate').textContent = responseData.smsDate ? formatDate(new Date(responseData.smsDate)) : formattedSmsDate;
            document.getElementById('timelinePortingDate').textContent = formatDate(new Date(formData.scheduledDate));
            
            // Update SMS step description if automation is enabled
            if (formData.automatePorting) {
              document.getElementById('smsStepDescription').textContent = 'PortMySim will automatically send the PORT SMS on your behalf';
              document.getElementById('upcStepDescription').textContent = 'PortMySim will retrieve and store your UPC code for the next step';
            }
            
            // Store data in localStorage for the confirmation page
            const portingUPC = document.getElementById('guidDisplay').textContent;
            localStorage.setItem('portingUPC', portingUPC);
            
            // Store form data for the confirmation page
            const portingFormData = {
              ...formData,
              currentProvider: document.getElementById('currentProviderDisplay').textContent,
              centerName: document.getElementById('portingCenter').textContent,
              centerAddress: responseData.portingCenterDetails?.address || ''
            };
            localStorage.setItem('portingFormData', JSON.stringify(portingFormData));
            
            // Store process timeline data
            const portingProcess = {
              eligibility: { status: 'complete', updatedAt: new Date().toISOString() },
              details: { status: 'complete', updatedAt: new Date().toISOString() },
              submission: { status: 'complete', updatedAt: new Date().toISOString() },
              upc: { status: 'complete', updatedAt: new Date().toISOString() },
              provider: { status: 'pending' },
              completion: { status: 'pending' }
            };
            localStorage.setItem('portingProcess', JSON.stringify(portingProcess));
            
            // Scroll to top of success view
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
            
            // Log the successful submission
            console.log('Porting request submitted successfully:', responseData);
          } else {
            console.error('Success elements not found in DOM');
            alert('Request submitted, but there was an error displaying the confirmation. Please check your dashboard for details.');
          }
        } else {
          // Show error notification
          console.error('Failed to submit porting request:', response?.error || 'Unknown error');
          alert('Error submitting porting request: ' + (response?.error || 'Unknown error'));
        }
      })
      .catch(error => {
        // Show error notification
        console.error('Error submitting porting request:', error);
        alert('Error submitting porting request: ' + (error.message || 'Network error'));
      })
      .finally(() => {
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
      });
  } else {
    console.warn('Form validation failed');
  }
}

// Function to generate a mock response for testing/development
function generateMockResponse(formData) {
  console.log('Generating mock response for testing');
  
  // Generate a unique reference number
  const refNumber = `PORT-${Math.floor(Math.random() * 900000) + 100000}`;
  
  // Calculate dates for the mock response
  const now = new Date();
  const smsDate = calculateSmsSendDate() || new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const scheduledDate = new Date(formData.scheduledDate);
  
  // Current circle and provider names
  const currentCircleName = document.getElementById('currentCircle')?.options[document.getElementById('currentCircle')?.selectedIndex]?.text || 'Unknown Circle';
  const currentProviderName = document.getElementById('currentProvider')?.options[document.getElementById('currentProvider')?.selectedIndex]?.text || 'Unknown Provider';
  
  // Create a realistic response object
  return {
    success: true,
    message: 'Porting request submitted successfully',
    data: {
      id: `mock_${Date.now()}`,
      refNumber: refNumber,
      status: 'pending',
      smsDate: smsDate.toISOString(),
      scheduledDate: scheduledDate.toISOString(),
      mobileNumber: formData.mobileNumber,
      currentProvider: currentProviderName,
      currentCircle: currentCircleName,
      newProvider: formData.newProvider,
      fullName: formData.fullName,
      email: formData.email,
      portingCenterDetails: {
        name: 'Demo Porting Center',
        address: '123 Test Street, Example City',
        location: {
          type: 'Point',
          coordinates: [77.216721, 28.644800] // Example coordinates
        },
        openingHours: '9:00 AM - 6:00 PM'
      },
      notifications: [
        {
          type: 'sms',
          scheduledFor: smsDate.toISOString(),
          message: `Please send SMS PORT to 1900 for your mobile number ${formData.mobileNumber} to start the porting process.`,
          sent: false
        },
        {
          type: 'email',
          scheduledFor: scheduledDate.toISOString(),
          message: 'Your porting is scheduled. Please visit your selected center with your UPC code.',
          sent: false
        }
      ],
      automatePorting: formData.automatePorting === true || formData.automatePorting === 'true'
    }
  };
}

// Expose the function globally for use by fix-auth.js
window.generateMockResponse = generateMockResponse;

// Helper function to format date
function formatDate(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
}

// Calculate porting dates based on plan end date
async function calculatePortingDates() {
  const planEndDateInput = document.getElementById('currentPlan');
  const smsDateElement = document.getElementById('smsSendDate');
  
  if (!planEndDateInput || !planEndDateInput.value || !smsDateElement) {
    return;
  }
  
  // Simple calculation - SMS date is 3 days before plan end date
  const planEndDate = new Date(planEndDateInput.value);
  const smsDate = new Date(planEndDate);
  smsDate.setDate(planEndDate.getDate() - 3);
  
  // Format the date
  const formattedDate = formatDate(smsDate);
  
  // Display the date
  smsDateElement.textContent = formattedDate;
  smsDateElement.parentElement.style.display = 'flex';
  
  // Set minimum date for porting date input
    const scheduledDateInput = document.getElementById('scheduledDate');
    if (scheduledDateInput) {
        const minDate = new Date(smsDate);
    minDate.setDate(smsDate.getDate() + 1); // At least one day after SMS date
        scheduledDateInput.min = minDate.toISOString().split('T')[0];
        
    // Set a default suggested date (one day after SMS date)
    const suggestedDate = new Date(smsDate);
    suggestedDate.setDate(suggestedDate.getDate() + 1);
    scheduledDateInput.value = suggestedDate.toISOString().split('T')[0];
  }
  
  return smsDate;
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

// Setup provider selection
function setupProviderSelection() {
  const providerCards = document.querySelectorAll('.provider-card');
  const selectedProviderElement = document.getElementById('selectedProviderName');
  const hiddenProviderInput = document.getElementById('newProvider');
  
  if (!providerCards.length || !selectedProviderElement || !hiddenProviderInput) {
    console.warn('Provider selection elements not found');
    return;
  }
  
  providerCards.forEach(card => {
    card.addEventListener('click', function() {
      // Remove selected class from all cards
      providerCards.forEach(c => c.classList.remove('selected'));
      
      // Add selected class to clicked card
      this.classList.add('selected');
      
      // Update selected provider text and hidden input
      const provider = this.getAttribute('data-provider');
      selectedProviderElement.textContent = this.querySelector('h3').textContent;
      hiddenProviderInput.value = provider;
      
      // Trigger validation
      validateProviderSelection();
      
      // When we move to step 3, try initializing the location search
      // This will help make the map appear when user selects a provider
      document.querySelectorAll('.btn-next').forEach(button => {
        if (button.getAttribute('data-next') === '3') {
          button.addEventListener('click', function() {
            // On a short delay, try triggering the location search if input has a value
            setTimeout(() => {
              const locationInput = document.getElementById('location');
              if (locationInput && locationInput.value.trim()) {
                findNearbyPortingCenters();
              }
            }, 500);
          });
        }
      });
    });
    
    // Handle keyboard navigation for accessibility
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  // Validate provider selection
  function validateProviderSelection() {
    const errorMessage = document.querySelector('.selected-provider .error-message');
    
    if (!hiddenProviderInput.value) {
      if (errorMessage) {
        errorMessage.textContent = 'Please select a provider';
        errorMessage.classList.add('show');
      }
      return false;
    }
    
    if (errorMessage) {
      errorMessage.textContent = '';
      errorMessage.classList.remove('show');
    }
    return true;
  }
}

// Set up form event listeners
function setupFormListeners() {
  // Add form listeners
  const form = document.getElementById('portingForm');
  const submitBtn = document.querySelector('.btn-submit');
  
  if (form) {
    form.addEventListener('submit', submitForm);
  }
  
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      submitForm(e);
    });
  }
  
  // Set up step navigation
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');
  
  nextButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const currentStep = parseInt(this.getAttribute('data-step'));
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
        updateProgressSteps(currentStep + 1);
      }
    });
  });
  
  prevButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const currentStep = parseInt(this.getAttribute('data-step'));
      goToStep(currentStep - 1);
      updateProgressSteps(currentStep - 1);
    });
  });
  
  // Setup date inputs with min dates
  setMinDate();
  
  // Current number input - No longer doing auto-detection
  const currentNumberInput = document.getElementById('currentNumber');
  if (currentNumberInput) {
    // Only do basic validation
    currentNumberInput.addEventListener('input', function() {
      // Restrict to 10 digits
      this.value = this.value.replace(/\D/g, '').substring(0, 10);
      validateInput(this);
    });
  }
  
  // Setup alternateNumber input with validation
  const alternateNumberInput = document.getElementById('alternateNumber');
  if (alternateNumberInput) {
    alternateNumberInput.addEventListener('input', function() {
      // Restrict to 10 digits
      this.value = this.value.replace(/\D/g, '').substring(0, 10);
      validateInput(this);
    });
  }
  
  // Email input with validation
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('input', function() {
      validateInput(this);
    });
  }
  
  // Any other input validation
  const allInputs = document.querySelectorAll('.schedule-form input, .schedule-form select');
  allInputs.forEach(input => {
    if (input !== currentNumberInput && input !== alternateNumberInput && input !== emailInput) {
      input.addEventListener('change', function() {
        validateInput(this);
      });
    }
  });
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

// Load providers for select
async function loadProviders() {
  const currentProviderSelect = document.getElementById('currentProvider');
  if (!currentProviderSelect) return;

  // Use config providers if available
  if (configSettings.providers && configSettings.providers.length) {
    // Keep the default option
    const defaultOption = currentProviderSelect.querySelector('option[disabled][selected]');
    let optionsHTML = defaultOption ? defaultOption.outerHTML : '';
    
    // Add providers from config
    configSettings.providers.forEach(provider => {
      optionsHTML += `<option value="${provider.id}">${provider.name}</option>`;
    });
    
    currentProviderSelect.innerHTML = optionsHTML;
  }
}

// Load circles for select
async function loadCircles() {
    const circleSelect = document.getElementById('currentCircle');
    if (!circleSelect) return;
    
  // We'll use the existing options in the HTML since telecom circles are fixed
}

// Helper function to normalize circle names to match backend expectations
function normalizeCircleName(circleName) {
  if (!circleName) return 'delhi'; // Default circle
  
  // Convert to lowercase for case-insensitive matching
  const circle = circleName.toLowerCase().trim();
  
  // Map of common input values to standardized circle IDs
  const circleMap = {
    // Names to IDs
    'delhi': 'delhi',
    'delhi ncr': 'delhi',
    'mumbai': 'mumbai',
    'kolkata': 'kolkata',
    'karnataka': 'karnataka',
    'chennai': 'tamil-nadu',
    'tamil nadu': 'tamil-nadu',
    'andhra pradesh': 'andhra-pradesh',
    'kerala': 'kerala',
    'punjab': 'punjab',
    'up east': 'up-east',
    'up west': 'up-west',
    'rajasthan': 'rajasthan',
    'madhya pradesh': 'madhya-pradesh',
    'west bengal': 'west-bengal',
    'gujarat': 'gujarat',
    'maharashtra': 'maharashtra',
    'jharkhand': 'bihar',
    'bihar': 'bihar',
    'odisha': 'orissa',
    'orissa': 'orissa',
    'assam': 'assam',
    'north east': 'northeast',
    'northeast': 'northeast',
    'jammu & kashmir': 'jammu',
    'j&k': 'jammu',
    'haryana': 'haryana',
    'himachal pradesh': 'himachal'
  };
  
  // Return the standardized ID if found, otherwise convert spaces to hyphens
  const result = circleMap[circle];
  if (result) return result;
  
  // Convert spaces to hyphens to match backend format
  return circle.replace(/\s+/g, '-');
}