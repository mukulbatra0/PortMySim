// Schedule Porting Form JavaScript

// Base API URL - using same URL from api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Import the mobile number database
import { getNearbyPortingCenters, getFallbackPortingCenters } from "./api.js";
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
        if (CONFIG.useOpenStreetMapAsFallback && (!CONFIG.googleMapsApiKey || CONFIG.googleMapsApiKey === '')) {
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
  const selectedProvider = document.getElementById('newProvider')?.value || '';
  const centersList = document.getElementById('porting-centers-list');
  
  if (!locationInput || !centersList) return;
  
  const searchQuery = locationInput.value.trim();
  
  if (!searchQuery) {
    centersList.innerHTML = `
        <div class="centers-empty">
          <i class="fas fa-map-marker-alt"></i>
        <p>Enter your location to find nearby porting centers</p>
        </div>
      `;
    return;
  }
  
  // Show loading state
  centersList.innerHTML = `
    <div class="centers-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Finding porting centers near ${searchQuery}...</p>
    </div>
  `;
  
  try {
    // Get coordinates from the location
    const coordinates = await getCoordinates(searchQuery);
    
    if (!coordinates) {
      displayLocationError();
      return;
    }
    
    // In a real app, this would be an API call to fetch centers based on coordinates
    // For this demo, we'll use mock data
    const centers = await getLocalFallbackCenters(selectedProvider, coordinates);
    
    // Display the porting centers
    displayPortingCenters(centers, coordinates);
    
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
  // If OpenStreetMap is preferred or Google Maps API key is missing
  if (CONFIG.useOpenStreetMapAsFallback && (!CONFIG.googleMapsApiKey || CONFIG.googleMapsApiKey === '')) {
    // Use OpenStreetMap directly
    loadOpenStreetMap().then(() => {
        initializeMapWithLeaflet(centers, userCoordinates);
    }).catch(err => {
      console.error('Failed to load OpenStreetMap:', err);
    });
    return;
  }

  // Try Google Maps first if API key is present
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
    const apiKey = CONFIG.googleMapsApiKey || '';
    
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
    
    // Load CSS
    const linkCSS = document.createElement('link');
    linkCSS.rel = 'stylesheet';
    linkCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(linkCSS);
    
    // Load JavaScript
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.async = true;
    
    script.onload = function() {
      console.log('Leaflet loaded successfully');
      resolve();
    };
    
    script.onerror = function() {
      console.error('Failed to load Leaflet');
      reject(new Error('Failed to load Leaflet'));
    };
    
    document.head.appendChild(script);
  });
}

// Initialize map with OpenStreetMap when using Leaflet
function initializeMapWithLeaflet(centers, userCoordinates) {
    const mapContainer = document.getElementById('centersMap');
    if (!mapContainer || !window.L || !centers || centers.length === 0) return;
    
    // Initialize the map if not already created
    if (!window.leafletMap) {
        window.leafletMap = L.map(mapContainer).setView(
            [userCoordinates.lat, userCoordinates.lng], 
            CONFIG.mapDefaultZoom
        );
        
        // Add the OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.leafletMap);
    } else {
        // Just update the view if map already exists
        window.leafletMap.setView([userCoordinates.lat, userCoordinates.lng], CONFIG.mapDefaultZoom);
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
    centers.forEach(center => {
        if (!center.coordinates) return;
        
        const providerColor = getProviderColor(center.provider);
        
        const marker = L.marker(
            [center.coordinates.lat, center.coordinates.lng]
        ).addTo(window.leafletMap);
        
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
    const bounds = L.latLngBounds([
        [userCoordinates.lat, userCoordinates.lng],
        ...centers.filter(c => c.coordinates).map(c => [c.coordinates.lat, c.coordinates.lng])
    ]);
    
    // Fit the map to show all markers
    window.leafletMap.fitBounds(bounds, { padding: [50, 50] });
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
        lat: CONFIG.mapDefaultLocation.lat,
      lng: CONFIG.mapDefaultLocation.lng,
      formattedAddress: 'Default Location'
    };
  }
}

// Get coordinates using Nominatim (OpenStreetMap's geocoding service)
async function getCoordinatesWithNominatim(searchQuery) {
  try {
    // Encode the search query
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Make request to Nominatim API
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`);
    
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
    } else {
      console.warn('No results found from Nominatim');
      return {
          lat: CONFIG.mapDefaultLocation.lat,
        lng: CONFIG.mapDefaultLocation.lng,
        formattedAddress: 'Default Location'
      };
    }
  } catch (error) {
    console.error('Error using Nominatim geocoding:', error);
    return {
        lat: CONFIG.mapDefaultLocation.lat,
      lng: CONFIG.mapDefaultLocation.lng,
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
        // Make sure provider cards are created
        const providerContainer = step.querySelector('.provider-selection');
        if (providerContainer && providerContainer.children.length === 0) {
          console.log('Provider container is empty, re-initializing provider selection');
          setupProviderSelection();
        }
      }
      
      // Special handling for step 3 (Schedule)
      if (stepNumber === 3) {
        calculateSmsSendDate();
        calculatePortingDates();
        generatePortingGuid(); // Generate GUID for display
        
        // Try to find nearby centers either from location or default
        const locationInput = document.getElementById('location');
        if (locationInput && locationInput.value.trim()) {
          // If location is already entered, find centers
        findNearbyPortingCenters();
        } else {
          // If no location set, use default centers with default location
          const defaultCoords = { 
            lat: CONFIG.mapDefaultLocation?.lat || 28.6139, 
            lng: CONFIG.mapDefaultLocation?.lng || 77.2090 
          };
          
          // Get selected provider if any
          const selectedProvider = document.getElementById('newProvider')?.value || '';
          
          // Show default centers
          getLocalFallbackCenters(selectedProvider, defaultCoords)
            .then(centers => {
              // Only display if we're still on step 3
              if (document.querySelector('.form-step[data-step="3"].active')) {
                displayPortingCenters(centers, defaultCoords);
              }
            })
            .catch(err => {
              console.error('Error loading default centers:', err);
            });
        }
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
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Reset button state
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
      
      // Show success message
      const formSteps = document.querySelectorAll('.form-step');
      const formSuccess = document.querySelector('.form-success');
      
      if (formSteps && formSuccess) {
        // Hide all steps
        formSteps.forEach(step => {
          step.classList.remove('active');
        });
        
        // Show success message
        formSuccess.classList.add('show');
        
        // Calculate SMS date based on plan end date
        const smsDate = calculateSmsSendDate();
        const formattedSmsDate = formatDate(smsDate || new Date());
        
        // Set displayed information
        document.getElementById('refNumber').textContent = `PORT-${Math.floor(Math.random() * 1000000)}`;
        document.getElementById('smsDate').textContent = formattedSmsDate;
        document.getElementById('guidDisplay').textContent = document.getElementById('portingGuid').textContent;
        document.getElementById('portingDateDisplay').textContent = formatDate(new Date(formData.scheduledDate));
        document.getElementById('currentProviderDisplay').textContent = formData.currentProvider;
        document.getElementById('automationStatus').textContent = formData.automatePorting ? 'Automated' : 'Manual Process';
        
        // Set timeline dates - use the calculated SMS date
        document.getElementById('timelineSmsDate').textContent = formattedSmsDate;
        document.getElementById('timelinePortingDate').textContent = formatDate(new Date(formData.scheduledDate));
        
        // Update SMS step description if automation is enabled
        if (formData.automatePorting) {
          document.getElementById('smsStepDescription').textContent = 'PortMySim will automatically send the PORT SMS on your behalf';
          document.getElementById('upcStepDescription').textContent = 'PortMySim will retrieve and store your UPC code for the next step';
        }
      }
    }, 2000);
  }
}

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
    const providerContainer = document.querySelector('.provider-options');
    const newProviderInput = document.getElementById('newProvider');
    
    if (!providerContainer || !newProviderInput) {
        console.warn('Provider container or input not found');
        return;
    }
    
    // Check if provider cards exist, if not, create them
    let providerCards = document.querySelectorAll('.provider-card');
    
    if (!providerCards.length && CONFIG.providers && CONFIG.providers.length) {
        // Create provider cards dynamically
        let cardsHTML = '';
        
        CONFIG.providers.forEach(provider => {
            cardsHTML += `
                <div class="provider-card" data-provider="${provider.id}" tabindex="0" role="button" aria-pressed="false">
                    <div class="provider-logo" style="background-color: rgba(${getProviderColor(provider.id)}, 0.1)">
                        <i class="${getProviderIcon(provider.id)}" style="color: rgb(${getProviderColor(provider.id)})"></i>
                    </div>
                    <h3>${provider.name}</h3>
                    <p>${provider.description || ''}</p>
                </div>
            `;
        });
        
        // Add cards to container
        providerContainer.innerHTML = cardsHTML;
        
        // Re-query for the newly created cards
        providerCards = document.querySelectorAll('.provider-card');
    }
    
    // Remove any existing event listeners (to prevent duplicates)
    providerCards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
    
    // Re-query for the newly cloned cards
    providerCards = document.querySelectorAll('.provider-card');
    
    // Function to select a provider card
    function selectProviderCard(card) {
        // Remove selected class from all cards
        const providerCards = document.querySelectorAll('.provider-card');
        providerCards.forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-pressed', 'false');
        });
        
        // Add selected class to this card
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        
        // Set hidden input value
        const provider = card.getAttribute('data-provider');
        const newProviderInput = document.getElementById('newProvider');
        if (newProviderInput) {
            newProviderInput.value = provider;
        }
        
        // Update the selected provider name display
        const selectedProviderName = document.getElementById('selectedProviderName');
        if (selectedProviderName) {
            const providerName = card.querySelector('h3').textContent;
            selectedProviderName.textContent = providerName;
            selectedProviderName.style.color = 'var(--accent-color)';
            selectedProviderName.style.fontWeight = 'bold';
        }
  
        // Clear error message
        const errorMessage = document.querySelector('.selected-provider .error-message');
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }
        
        // Find nearby centers if location is already entered
        const locationInput = document.getElementById('location');
        if (locationInput && locationInput.value) {
            findNearbyPortingCenters();
        }
        
        console.log(`Selected provider: ${provider}`);
    }
    
    // Setup click handlers for provider cards
    providerCards.forEach(card => {
        // Mouse click event
        card.addEventListener('click', function(e) {
            // Prevent any child elements from triggering multiple events
            e.stopPropagation();
            selectProviderCard(this);
        });
        
        // Keyboard event - handle Enter and Space keys
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectProviderCard(this);
            }
        });
    });
}

// Set up form event listeners
function setupFormListeners() {
  // Location field listener for finding porting centers
  const locationInput = document.getElementById('location');
  if (locationInput) {
    const debouncedSearch = debounce(findNearbyPortingCenters, 500);
    locationInput.addEventListener('input', debouncedSearch);
    locationInput.addEventListener('change', findNearbyPortingCenters);
  }
  
  // Current plan date input to calculate dates
  const planEndDateInput = document.getElementById('currentPlan');
  if (planEndDateInput) {
    planEndDateInput.addEventListener('change', calculatePortingDates);
  }
  
  // Automation option toggle
  const automatePortingInput = document.getElementById('automatePorting');
  if (automatePortingInput) {
    automatePortingInput.addEventListener('change', function() {
      const smsInfoElements = document.querySelectorAll('.sms-info');
      if (this.checked) {
        smsInfoElements.forEach(el => el.classList.add('automated'));
      } else {
        smsInfoElements.forEach(el => el.classList.remove('automated'));
      }
    });
  }
  
  // Add delegate event listener for "View on Map" buttons that may be added dynamically
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.classList.contains('btn-view-on-map') || 
        e.target.closest('.btn-view-on-map'))) {
      
      const button = e.target.classList.contains('btn-view-on-map') ? 
                    e.target : e.target.closest('.btn-view-on-map');
      
      // Find the parent center item
      const centerItem = button.closest('.center-item');
      if (centerItem) {
        const lat = parseFloat(centerItem.getAttribute('data-lat'));
        const lng = parseFloat(centerItem.getAttribute('data-lng'));
        const name = centerItem.getAttribute('data-name');
        
        // Remove selected class from all center items
        document.querySelectorAll('.center-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Add selected class to this item
        centerItem.classList.add('selected');
        
        // Show on map
        showOnMap(lat, lng, name);
      }
    }
  });
  
  // Provider selection in Step 2
  setupProviderSelection();
  
  // Form submission
  const form = document.querySelector('.schedule-form');
  if (form) {
    form.addEventListener('submit', submitForm);
  }
  
  // Set minimum date for date inputs
  setMinDate();
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
  if (CONFIG.providers && CONFIG.providers.length) {
    // Keep the default option
    const defaultOption = currentProviderSelect.querySelector('option[disabled][selected]');
    let optionsHTML = defaultOption ? defaultOption.outerHTML : '';
    
    // Add providers from config
    CONFIG.providers.forEach(provider => {
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