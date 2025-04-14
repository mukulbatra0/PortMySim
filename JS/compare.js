// Use the global PortMySimAPI object instead of importing functions
// The following functions are available through window.PortMySimAPI:
// - fetchNetworkCoverage
// - compareNetworks
// - getLocationsWithCoverage

// Global variables
let map;
let networkLayers = {};
let currentLocation = null;
let towerLayers = {}; // For storing tower layers by network
let userLocationMarker = null; // For marking user's selected location
let userCoordinates = null; // For storing user's geolocation coordinates
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  initComparePage();
  
  // Set up event listeners for the remove network buttons
  setupRemoveNetworkButtons();
  
  // Set up event listeners for the view details buttons
  setupViewDetailsButtons();
  
  // Check authentication status and update UI
  updateAuthUI();
});

// Update authentication UI based on login status
function updateAuthUI() {
  // If API client is loaded
  if (window.PortMySimAPI) {
    // Check if user is authenticated
    if (window.PortMySimAPI.isAuthenticated()) {
      const user = window.PortMySimAPI.getUser();
      
      // Update auth buttons in nav if they exist
      const authBtns = document.querySelector('.auth-btns');
      if (authBtns) {
        const firstLetter = user.name.charAt(0).toUpperCase();
        authBtns.innerHTML = `
          <div class="user-profile-dropdown">
            <div class="user-profile-circle" title="${user.name}">
              ${firstLetter}
            </div>
            <div class="dropdown-menu">
              <span class="user-greeting">Hello, ${user.name.split(' ')[0]}</span>
              <a href="/HTML/dashboard.html" class="dropdown-item">
                <i class="fas fa-tachometer-alt"></i> Dashboard
              </a>
              <a href="/HTML/schedule-porting.html" class="dropdown-item">
                <i class="fas fa-calendar-alt"></i> Schedule Porting
              </a>
              <button id="logoutBtn" class="dropdown-item">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        `;
        
        // Add event listener for logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', function() {
            window.PortMySimAPI.clearAuth();
            window.location.reload();
          });
        }
        
        // Add event listener for dropdown toggle
        const profileCircle = document.querySelector('.user-profile-circle');
        if (profileCircle) {
          profileCircle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.querySelector('.dropdown-menu');
            dropdown.classList.toggle('show');
          });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
          const dropdown = document.querySelector('.dropdown-menu');
          if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
          }
        });
      }
    }
  }
}

// Initialize all components of the compare page
async function initComparePage() {
  // Set up event listeners
  setupEventListeners();
  
  // The map is already initialized in the inline script
  // We'll just reference it from the global scope
  map = window.coverageMap;
  
  // Initialize location autocomplete
  await initLocationSuggestions();

  // Initialize tower layers (empty initially)
  towerLayers = {
    jio: L.layerGroup(),
    airtel: L.layerGroup(),
    vi: L.layerGroup()
  };
  
  // Define the updateMapLayers function
  window.updateMapLayers = function() {
    const selectedNetwork = document.getElementById('network-select').value;
    const selectedCoverage = document.querySelector('input[name="coverage-type"]:checked').value;
    
    // Sample city data
    const cities = [
      { name: 'Delhi', coords: [28.7041, 77.1025] },
      { name: 'Mumbai', coords: [19.0760, 72.8777] },
      { name: 'Chennai', coords: [13.0827, 80.2707] },
      { name: 'Kolkata', coords: [22.5726, 88.3639] },
      { name: 'Bangalore', coords: [12.9716, 77.5946] },
      { name: 'Hyderabad', coords: [17.3850, 78.4867] },
      { name: 'Pune', coords: [18.5204, 73.8567] },
      { name: 'Ahmedabad', coords: [23.0225, 72.5714] },
      { name: 'Jaipur', coords: [26.9124, 75.7873] },
      { name: 'Lucknow', coords: [26.8467, 80.9462] }
    ];
    
    // Remove existing layers
    Object.values(window.networkLayers).forEach(layer => {
      layer.clearLayers();
    });
    
    // For demonstration, we'll use simple circle overlays with different colors
    // In a real app, you would use GeoJSON data for accurate coverage areas
    const coverageColors = {
      jio: '#E53935',    // Bright red for Jio
      airtel: '#1E88E5', // Blue for Airtel
      vi: '#7B1FA2',     // Purple for Vi
    };
    
    // Add coverage based on selection
    if (selectedNetwork === 'all') {
      // Show all networks with different colors (semi-transparent)
      Object.keys(coverageColors).forEach(network => {
        addCoverageForNetwork(network, selectedCoverage, 0.25);
      });
    } else {
      // Show just the selected network
      addCoverageForNetwork(selectedNetwork, selectedCoverage, 0.5);
    }
    
    function addCoverageForNetwork(network, coverageType, opacity) {
      const color = coverageColors[network];
      if (!color) return;
      
      // For demo purposes, create coverage circles for each city
      cities.forEach(city => {
        // Calculate radius based on network and coverage type
        let radius;
        if (coverageType === '5g') {
          radius = network === 'jio' ? 30000 : 
                   network === 'airtel' ? 35000 : 25000;
        } else {
          radius = network === 'jio' ? 45000 : 
                   network === 'airtel' ? 50000 : 40000;
        }
        
        // Add circle
        const circle = L.circle(city.coords, {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 1,
          className: 'coverage-layer'
        });
        
        // Add to appropriate layer group
        window.networkLayers[network].addLayer(circle);
      });
    }
    
    // After updating layers, ensure correct z-index and positioning
    ensureCorrectZIndex();
    positionMapControls();
  };
  
  // Initialize with all networks
  window.updateMapLayers();
  
  // Set initial z-index and positions for map elements
  setTimeout(function() {
    ensureCorrectZIndex();
    positionMapControls();
    manageLayers();
  }, 500);
  
  // Set up the view details buttons after initialization
  setTimeout(function() {
    setupViewDetailsButtons();
  }, 1500);
}

// Initialize location suggestions from backend or use static data
async function initLocationSuggestions() {
  try {
    // Try to fetch locations from API
    const response = await fetch(`${API_BASE_URL}/network-coverage/locations`)
      .catch(() => null);
    
    if (response && response.ok) {
      const locations = await response.json();
      updateLocationSuggestions(locations);
    } else {
      // Use fallback data if API fails - comprehensive list of major cities and districts in India
      const fallbackLocations = [
        // Major Metros
        'New Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
        
        // Major cities by state
        // Andhra Pradesh
        'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Kadapa',
        
        // Arunachal Pradesh
        'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Along', 'Bomdila', 'Roing', 'Tezu', 'Khonsa',
        
        // Assam
        'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Diphu',
        
        // Bihar
        'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Arrah', 'Begusarai', 'Chhapra', 'Katihar', 'Munger',
        
        // Chhattisgarh
        'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Dhamtari',
        
        // Goa
        'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Cuncolim', 'Quepem', 'Sanguem',
        
        // Gujarat
        'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Bharuch',
        
        // Haryana
        'Faridabad', 'Gurgaon', 'Rohtak', 'Hisar', 'Panipat', 'Ambala', 'Karnal', 'Sonipat', 'Yamunanagar', 'Panchkula',
        
        // Himachal Pradesh
        'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Hamirpur', 'Nahan', 'Bilaspur', 'Chamba', 'Una',
        
        // Jharkhand
        'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Dumka', 'Phusro',
        
        // Karnataka
        'Mysore', 'Mangalore', 'Hubli-Dharwad', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur',
        
        // Kerala
        'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
        
        // Madhya Pradesh
        'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
        
        // Maharashtra
        'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Malegaon', 'Akola', 'Latur',
        
        // Manipur
        'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati', 'Chandel', 'Tamenglong', 'Jiribam',
        
        // Meghalaya
        'Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Resubelpara', 'Baghmara', 'Nongpoh', 'Khliehriat', 'Mawkyrwat',
        
        // Mizoram
        'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Saiha', 'Lawngtlai', 'Mamit', 'Khawzawl', 'Hnahthial',
        
        // Nagaland
        'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon', 'Kiphire', 'Longleng',
        
        // Odisha
        'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda',
        
        // Punjab
        'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga',
        
        // Rajasthan
        'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali',
        
        // Sikkim
        'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang', 'Naya Bazar', 'Rabong', 'Soreng',
        
        // Tamil Nadu
        'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
        
        // Telangana
        'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet',
        
        // Tripura
        'Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai', 'Ambassa', 'Santirbazar', 'Sabroom', 'Teliamura',
        
        // Uttar Pradesh
        'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur',
        
        // Uttarakhand
        'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Kotdwar', 'Pithoragarh', 'Almora',
        
        // West Bengal
        'Durgapur', 'Asansol', 'Siliguri', 'Berhampore', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia', 'Raiganj', 'Jalpaiguri',
        
        // Union Territories
        'Chandigarh', 'Puducherry', 'Port Blair', 'Daman', 'Diu', 'Kavaratti', 'Silvassa', 'Jammu', 'Srinagar', 'Leh'
      ];
      updateLocationSuggestions(fallbackLocations);
    }
  } catch (error) {
    console.error('Error initializing location suggestions:', error);
  }
}

// Update location suggestions in the DOM
function updateLocationSuggestions(locations) {
  const suggestionContainer = document.getElementById('location-suggestions');
  if (!suggestionContainer) return;
  
  // Clear existing suggestions
  suggestionContainer.innerHTML = '';
  
  // Add new suggestions
  locations.forEach(location => {
    const item = document.createElement('div');
    item.className = 'location-suggestion-item';
    item.textContent = location;
    suggestionContainer.appendChild(item);
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Get DOM elements
  const locationSearchInput = document.getElementById('location-search');
  const locationSearchBtn = document.getElementById('location-search-btn');
  const userLocationBtn = document.getElementById('user-location-btn');
  const compareBtn = document.getElementById('compare-btn');
  const showTowersCheckbox = document.getElementById('show-towers');
  const towerRadiusSlider = document.getElementById('tower-radius');
  const radiusValueDisplay = document.getElementById('radius-value');
  const coverageOpacitySlider = document.getElementById('coverage-opacity');
  
  // Location search button
  if (locationSearchBtn) {
    locationSearchBtn.addEventListener('click', () => {
      const location = locationSearchInput.value.trim();
      if (location) {
        compareNetworksAction(location);
      }
    });
  }
  
  // User location button
  if (userLocationBtn) {
    userLocationBtn.addEventListener('click', () => {
      getUserLocation();
    });
  }
  
  // Location search input
  if (locationSearchInput) {
    locationSearchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        const location = this.value.trim();
        if (location) {
          compareNetworksAction(location);
        }
      } else {
        filterLocationSuggestions(this.value);
      }
    });
    
    locationSearchInput.addEventListener('focus', () => {
      const suggestionContainer = document.getElementById('location-suggestions');
      if (suggestionContainer) {
        suggestionContainer.classList.add('show');
      }
    });
    
    locationSearchInput.addEventListener('blur', () => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => {
        const suggestionContainer = document.getElementById('location-suggestions');
        if (suggestionContainer) {
          suggestionContainer.classList.remove('show');
        }
      }, 200);
    });
  }
  
  // Compare button
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      const location = locationSearchInput.value.trim();
      if (location) {
        // Call the compareNetworks function directly
        compareNetworksAction(location);
      } else if (userCoordinates) {
        // If we have user coordinates but no location name entered, use "My Current Location"
        locationSearchInput.value = 'My Current Location';
        compareNetworksAction('My Current Location');
      } else {
        alert('Please enter a location to compare networks');
      }
    });
  }
  
  // Add event listeners for dynamic suggestion items
  const suggestionContainer = document.getElementById('location-suggestions');
  if (suggestionContainer) {
    suggestionContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('location-suggestion-item')) {
        if (locationSearchInput) {
          locationSearchInput.value = e.target.textContent;
        }
        this.classList.remove('show');
        compareNetworksAction(e.target.textContent);
      }
    });
  }

  // Network selector event handlers
  const networkSelect = document.getElementById('network-select');
  if (networkSelect) {
    networkSelect.addEventListener('change', function() {
      if (window.updateMapLayers) {
        window.updateMapLayers();
      }
    });
  }
  
  // Coverage type (4G/5G) event handlers
  const coverageTypeRadios = document.querySelectorAll('input[name="coverage-type"]');
  if (coverageTypeRadios.length) {
    coverageTypeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (window.updateMapLayers) {
          window.updateMapLayers();
        }
      });
    });
  }

  // Tower visualization controls
  if (showTowersCheckbox) {
    showTowersCheckbox.addEventListener('change', function() {
      if (this.checked) {
        visualizeTowers();
      } else {
        removeTowerLayers();
      }
    });
  }
  
  if (towerRadiusSlider) {
    towerRadiusSlider.addEventListener('input', function() {
      const value = this.value;
      if (radiusValueDisplay) {
        radiusValueDisplay.textContent = `${value} km`;
      }
    });
    
    towerRadiusSlider.addEventListener('change', function() {
      if (showTowersCheckbox && showTowersCheckbox.checked) {
        visualizeTowers();
      }
    });
  }
  
  // Coverage opacity slider
  if (coverageOpacitySlider) {
    coverageOpacitySlider.addEventListener('input', function() {
      const opacity = this.value / 100;
      const coverageLayers = document.querySelectorAll('.coverage-layer');
      
      coverageLayers.forEach(layer => {
        layer.style.opacity = opacity;
      });
      
      // Also adjust heatmap layers opacity if they exist in the Leaflet map
      if (map) {
        Object.values(towerLayers).forEach(layerGroup => {
          layerGroup.eachLayer(layer => {
            if (layer instanceof L.HeatLayer) {
              // Set opacity of heatmap
              layer.setOptions({ maxOpacity: opacity });
            }
          });
        });
      }
    });
  }

  // Zoom controls
  const zoomIn = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');
  
  if (zoomIn) {
    zoomIn.addEventListener('click', function() {
      if (map) map.zoomIn();
    });
  }
  
  if (zoomOut) {
    zoomOut.addEventListener('click', function() {
      if (map) map.zoomOut();
    });
  }

  // Setup layer management event listeners
  setupLayerManagement();
}

// Filter location suggestions based on input text
function filterLocationSuggestions(searchText) {
  const suggestionContainer = document.getElementById('location-suggestions');
  if (!suggestionContainer) return;
  
  const items = suggestionContainer.querySelectorAll('.location-suggestion-item');
  const searchLower = searchText.toLowerCase();
  let hasVisibleItems = false;
  let matchCount = 0;
  const MAX_VISIBLE_ITEMS = 50; // Limit to prevent performance issues
  
  // Clear the container first
  suggestionContainer.innerHTML = '';
  
  if (!searchText) {
    // If no search text, show a message to type more
    const promptElement = document.createElement('div');
    promptElement.className = 'location-no-results';
    promptElement.textContent = 'Start typing to search for locations...';
    suggestionContainer.appendChild(promptElement);
    
    // Show suggestions container
    suggestionContainer.classList.add('show');
    return;
  }
  
  // Get all location items (from the data we have)
  const allLocations = [];
  items.forEach(item => {
    allLocations.push(item.textContent);
  });
  
  // Add fallback locations if no items found (common case on first load)
  if (allLocations.length === 0) {
    // This array should match the one in initLocationSuggestions
    const fallbackLocations = [
      // Major Metros
      'New Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
      // ...and all the other cities from your comprehensive list
    ];
    fallbackLocations.forEach(location => allLocations.push(location));
  }
  
  // Filter and sort locations based on search text
  const filteredLocations = allLocations
    .filter(location => location.toLowerCase().includes(searchLower))
    .sort((a, b) => {
      // Sort exact matches to the top
      const aExact = a.toLowerCase() === searchLower;
      const bExact = b.toLowerCase() === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then sort by whether the location starts with the search text
      const aStarts = a.toLowerCase().startsWith(searchLower);
      const bStarts = b.toLowerCase().startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Finally sort alphabetically
      return a.localeCompare(b);
    });
  
  // Check if we have any matches
  if (filteredLocations.length === 0) {
    const noResultsElement = document.createElement('div');
    noResultsElement.className = 'location-no-results';
    noResultsElement.textContent = 'No locations found. Try a different search term.';
    suggestionContainer.appendChild(noResultsElement);
  } else {
    // Add the filtered items to the container
    filteredLocations.forEach((location, index) => {
      // Limit the number of items to prevent performance issues
      if (index < MAX_VISIBLE_ITEMS) {
        const item = document.createElement('div');
        item.className = 'location-suggestion-item';
        
        // Highlight the matching text
        const highlightedText = location.replace(
          new RegExp(searchLower, 'gi'),
          match => `<span class="highlight">${match}</span>`
        );
        item.innerHTML = highlightedText;
        
        suggestionContainer.appendChild(item);
        hasVisibleItems = true;
        matchCount++;
      }
    });
    
    // If we have more matches than our limit, show a message
    if (filteredLocations.length > MAX_VISIBLE_ITEMS) {
      const moreResultsElement = document.createElement('div');
      moreResultsElement.className = 'location-no-results';
      moreResultsElement.textContent = `Showing ${MAX_VISIBLE_ITEMS} of ${filteredLocations.length} matches. Keep typing to refine your search.`;
      suggestionContainer.appendChild(moreResultsElement);
    }
  }
  
  // Show suggestions container if we have matches or a message
  if (hasVisibleItems || suggestionContainer.querySelector('.location-no-results')) {
    suggestionContainer.classList.add('show');
  } else {
    suggestionContainer.classList.remove('show');
  }
  
  // Update event listeners for new items
  const newItems = suggestionContainer.querySelectorAll('.location-suggestion-item');
  newItems.forEach(item => {
    item.addEventListener('click', function() {
      const locationInput = document.getElementById('location-search');
      if (locationInput) {
        locationInput.value = this.textContent.replace(/(<([^>]+)>)/gi, ""); // Remove any HTML tags
        suggestionContainer.classList.remove('show');
        compareNetworksAction(locationInput.value);
      }
    });
  });
}

// Search for location and update UI
async function searchLocation(location) {
  if (!location) return;
  
  currentLocation = location;
  
  try {
    // Update selected location text
    const selectedLocationElement = document.getElementById('selected-location');
    if (selectedLocationElement) {
      selectedLocationElement.textContent = location;
    }
    
    // Hide suggestions
    const suggestionContainer = document.getElementById('location-suggestions');
    if (suggestionContainer) {
      suggestionContainer.classList.remove('show');
    }
    
    // Get city coordinates from our predefined list
    const cities = [
      // Major Metros
      { name: 'Delhi', coords: [28.7041, 77.1025] },
      { name: 'New Delhi', coords: [28.6139, 77.2090] },
      { name: 'Mumbai', coords: [19.0760, 72.8777] },
      { name: 'Chennai', coords: [13.0827, 80.2707] },
      { name: 'Kolkata', coords: [22.5726, 88.3639] },
      { name: 'Bangalore', coords: [12.9716, 77.5946] },
      { name: 'Hyderabad', coords: [17.3850, 78.4867] },
      { name: 'Pune', coords: [18.5204, 73.8567] },
      { name: 'Ahmedabad', coords: [23.0225, 72.5714] },
      { name: 'Jaipur', coords: [26.9124, 75.7873] },
      { name: 'Lucknow', coords: [26.8467, 80.9462] },
      
      // Andhra Pradesh
      { name: 'Visakhapatnam', coords: [17.6868, 83.2185] },
      { name: 'Vijayawada', coords: [16.5062, 80.6480] },
      { name: 'Guntur', coords: [16.3067, 80.4365] },
      { name: 'Nellore', coords: [14.4426, 79.9865] },
      { name: 'Kurnool', coords: [15.8281, 78.0373] },
      
      // Gujarat
      { name: 'Surat', coords: [21.1702, 72.8311] },
      { name: 'Vadodara', coords: [22.3072, 73.1812] },
      { name: 'Rajkot', coords: [22.2734, 70.7713] },
      
      // Maharashtra
      { name: 'Nagpur', coords: [21.1458, 79.0882] },
      { name: 'Nashik', coords: [19.9975, 73.7898] },
      { name: 'Aurangabad', coords: [19.8762, 75.3433] },
      
      // Tamil Nadu
      { name: 'Coimbatore', coords: [11.0168, 76.9558] },
      { name: 'Madurai', coords: [9.9252, 78.1198] },
      { name: 'Tiruchirappalli', coords: [10.7905, 78.7047] },
      
      // Karnataka
      { name: 'Mysore', coords: [12.2958, 76.6394] },
      { name: 'Mangalore', coords: [12.9141, 74.8560] },
      
      // Uttar Pradesh
      { name: 'Kanpur', coords: [26.4499, 80.3319] },
      { name: 'Varanasi', coords: [25.3176, 82.9739] },
      { name: 'Agra', coords: [27.1767, 78.0081] },
      
      // West Bengal
      { name: 'Durgapur', coords: [23.5204, 87.3119] },
      { name: 'Asansol', coords: [23.6739, 86.9524] },
      { name: 'Siliguri', coords: [26.7271, 88.3953] },
      
      // Kerala
      { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366] },
      { name: 'Kochi', coords: [9.9312, 76.2673] },
      { name: 'Kozhikode', coords: [11.2588, 75.7804] },
      
      // Madhya Pradesh
      { name: 'Indore', coords: [22.7196, 75.8577] },
      { name: 'Bhopal', coords: [23.2599, 77.4126] },
      { name: 'Jabalpur', coords: [23.1815, 79.9864] },
      
      // Rajasthan
      { name: 'Jodhpur', coords: [26.2389, 73.0243] },
      { name: 'Kota', coords: [25.2138, 75.8648] },
      { name: 'Bikaner', coords: [28.0229, 73.3119] },
      
      // Bihar
      { name: 'Patna', coords: [25.5941, 85.1376] },
      { name: 'Gaya', coords: [24.7914, 84.9994] },
      { name: 'Bhagalpur', coords: [25.2425, 86.9842] },
      
      // Punjab
      { name: 'Ludhiana', coords: [30.9010, 75.8573] },
      { name: 'Amritsar', coords: [31.6340, 74.8723] },
      { name: 'Jalandhar', coords: [31.3260, 75.5762] },
      
      // Haryana
      { name: 'Faridabad', coords: [28.4089, 77.3178] },
      { name: 'Gurgaon', coords: [28.4595, 77.0266] },
      { name: 'Rohtak', coords: [28.8955, 76.6066] },
      
      // Union Territories
      { name: 'Chandigarh', coords: [30.7333, 76.7794] },
      { name: 'Puducherry', coords: [11.9416, 79.8083] },
      { name: 'Jammu', coords: [32.7266, 74.8570] },
      { name: 'Srinagar', coords: [34.0837, 74.7973] }
    ];
    
    let coords;
    
    // Check if this is the user's current location
    if (location === 'My Current Location' && userCoordinates) {
      coords = [userCoordinates.lat, userCoordinates.lng];
    } else {
      // Find city in the list - use case-insensitive comparison
      const city = cities.find(c => 
        c.name.toLowerCase() === location.toLowerCase() ||
        c.name.toLowerCase().includes(location.toLowerCase()) || 
        location.toLowerCase().includes(c.name.toLowerCase())
      );
      
      if (city) {
        coords = city.coords;
      } else {
        // If exact match not found, use a fuzzy search algorithm to find the closest match
        let bestMatch = null;
        let bestScore = 0;
        
        cities.forEach(city => {
          // Simple fuzzy matching algorithm
          const cityNameLower = city.name.toLowerCase();
          const locationLower = location.toLowerCase();
          
          // Calculate similarity score (very basic)
          let score = 0;
          for (let i = 0; i < locationLower.length; i++) {
            if (cityNameLower.includes(locationLower[i])) {
              score++;
            }
          }
          
          // Normalize score
          score = score / locationLower.length;
          
          // If we have a better match, update
          if (score > bestScore) {
            bestScore = score;
            bestMatch = city;
          }
        });
        
        // Use best match if score is above threshold
        if (bestMatch && bestScore > 0.5) {
          console.log(`Using closest match: ${bestMatch.name} for: ${location}`);
          coords = bestMatch.coords;
        } else {
          // Show a user-friendly message and provide default coordinates for Delhi
          console.log('Location not found in our database, using default location');
          coords = [28.7041, 77.1025]; // Delhi coordinates as default
        }
      }
    }
    
    // Update map
    if (map && coords) {
      map.flyTo(coords, 9, {
        duration: 2,
        animate: true
      });
      
      // Add or update user location marker
      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }
      
      userLocationMarker = L.marker(coords, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div class="pulse-marker"><i class="fas fa-map-marker-alt"></i></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(map);

      // Show popup
      L.popup()
        .setLatLng(coords)
        .setContent(`<h3>${location}</h3><p>Showing network coverage comparison</p>`)
        .openOn(map);
        
      // If towers are enabled, update tower visualization
      const showTowersCheckbox = document.getElementById('show-towers');
      if (showTowersCheckbox && showTowersCheckbox.checked) {
        visualizeTowers();
      }
    }
    
    return coords;
  } catch (error) {
    console.log('Error in searchLocation, using default coordinates');
    return [28.7041, 77.1025]; // Delhi coordinates as fallback
  }
}

// Function to specifically handle network comparison
async function compareNetworksAction(location) {
  if (!location) return;
  
  try {
    // Update selected location text
    const selectedLocationElement = document.getElementById('selected-location');
    if (selectedLocationElement) {
      selectedLocationElement.textContent = location;
    }
    
    // First search for the location to update the map
    await searchLocation(location);
    
    // Then fetch network comparison data from API
    let lat = null;
    let lng = null;
    
    // If we have userCoordinates and the location is "My Current Location"
    if (userCoordinates && location === 'My Current Location') {
      lat = userCoordinates.lat;
      lng = userCoordinates.lng;
    }
    
    // Show loading state in UI
    showLoadingState();
    
    // Prepare parameters for API call
    const params = {
      location: location,
      lat: lat,
      lng: lng,
      operators: 'jio,airtel,vi',
      includeDistrict: true // Add flag to include district-level data
    };
    
    console.log('Fetching network comparison data for:', location);
    
    try {
      // Use the global PortMySimAPI object to call the API function
      const comparisonData = await window.PortMySimAPI.compareNetworks(location);
      
      // Hide loading state
      hideLoadingState();
      
      console.log('Received comparison data:', comparisonData);
      
      // If we got good data, update the UI
      if (comparisonData && comparisonData.bestNetwork) {
        updateBestNetworkUI(comparisonData);
        updateNetworkRankings(comparisonData.rankings);
        highlightBestNetwork(comparisonData.bestNetwork.operator);
        updateDetailedComparisonTable(comparisonData);
        
        // If district data is available, update district comparison
        if (comparisonData.districtData) {
          updateDistrictComparison(comparisonData.districtData);
        }
      } else {
        // Use fallback data without error message
        console.log('Using fallback network data for', location);
        const fallbackData = getFallbackNetworkData(location);
        console.log('Generated fallback data:', fallbackData);
        updateBestNetworkUI(fallbackData);
        updateNetworkRankings(fallbackData.rankings);
        highlightBestNetwork(fallbackData.bestNetwork.operator);
        updateDetailedComparisonTable(fallbackData);
        
        // Generate fallback district data if needed
        const fallbackDistrictData = generateFallbackDistrictData(location);
        updateDistrictComparison(fallbackDistrictData);
      }
    } catch (error) {
      // Hide loading state
      hideLoadingState();
      
      // Use fallback data if API call fails
      console.log('Using fallback network data due to API error');
      const fallbackData = getFallbackNetworkData(location);
      console.log('Generated fallback data after error:', fallbackData);
      updateBestNetworkUI(fallbackData);
      updateNetworkRankings(fallbackData.rankings);
      highlightBestNetwork(fallbackData.bestNetwork.operator);
      updateDetailedComparisonTable(fallbackData);
      
      // Generate fallback district data if needed
      const fallbackDistrictData = generateFallbackDistrictData(location);
      updateDistrictComparison(fallbackDistrictData);
    }
  } catch (error) {
    // Hide loading state
    hideLoadingState();
    
    console.log('Error in compareNetworksAction, using fallback data');
    // Generate fallback data even in case of general function errors
    const fallbackData = getFallbackNetworkData(location);
    console.log('Generated fallback data after general error:', fallbackData);
    updateBestNetworkUI(fallbackData);
    updateNetworkRankings(fallbackData.rankings);
    highlightBestNetwork(fallbackData.bestNetwork.operator);
    updateDetailedComparisonTable(fallbackData);
    
    // Generate fallback district data if needed
    const fallbackDistrictData = generateFallbackDistrictData(location);
    updateDistrictComparison(fallbackDistrictData);
  }
}

// Show loading state in UI
function showLoadingState() {
  // Create or update loading overlay
  let loadingOverlay = document.querySelector('.loading-overlay');
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-circle-notch fa-spin"></i>
      </div>
      <div class="loading-text">Analyzing network data...</div>
    `;
    document.body.appendChild(loadingOverlay);
  }
  
  // Show the loading overlay
  loadingOverlay.style.display = 'flex';
  
  // Update compare button to show loading state
  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    compareBtn.classList.add('loading');
    compareBtn.disabled = true;
  }
}

// Hide loading state in UI
function hideLoadingState() {
  // Hide loading overlay
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
  
  // Reset compare button state
  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    compareBtn.classList.remove('loading');
    compareBtn.disabled = false;
  }
}

// Generate fallback district data for a location
function generateFallbackDistrictData(location) {
  const locationSeed = location.charCodeAt(0) + location.length;
  
  // Create some nearby districts based on the location
  const districtCount = 3 + (locationSeed % 5); // 3-7 districts
  const districts = [];
  
  // Generate district names
  for (let i = 0; i < districtCount; i++) {
    const districtName = `${location} District ${i + 1}`;
    
    // Create district data with random scores for each operator
    const jioScore = 75 + (locationSeed + i) % 20;
    const airtelScore = 75 + (locationSeed + i + 3) % 20;
    const viScore = 70 + (locationSeed + i + 7) % 20;
    
    // Determine best operator
    let bestOperator = 'jio';
    let bestScore = jioScore;
    
    if (airtelScore > bestScore) {
      bestOperator = 'airtel';
      bestScore = airtelScore;
    }
    
    if (viScore > bestScore) {
      bestOperator = 'vi';
      bestScore = viScore;
    }
    
    // Create district object
    districts.push({
      name: districtName,
      operators: {
        jio: {
          score: jioScore,
          coverage4g: 85 + (locationSeed + i) % 15,
          coverage5g: 60 + (locationSeed + i) % 30,
          downloadSpeed: 18 + (locationSeed + i) % 15,
          signalStrength: 'Good'
        },
        airtel: {
          score: airtelScore,
          coverage4g: 88 + (locationSeed + i + 2) % 12,
          coverage5g: 65 + (locationSeed + i + 2) % 25,
          downloadSpeed: 22 + (locationSeed + i + 2) % 13,
          signalStrength: 'Excellent'
        },
        vi: {
          score: viScore,
          coverage4g: 80 + (locationSeed + i + 4) % 15,
          coverage5g: 50 + (locationSeed + i + 4) % 25,
          downloadSpeed: 15 + (locationSeed + i + 4) % 12,
          signalStrength: 'Average'
        }
      },
      bestOperator: bestOperator
    });
  }
  
  return {
    mainLocation: location,
    districts: districts
  };
}

// Update UI with district comparison data
function updateDistrictComparison(districtData) {
  // First, check if the district comparison section exists
  let districtSection = document.querySelector('.district-comparison-section');
  
  // If not, create it
  if (!districtSection) {
    districtSection = document.createElement('div');
    districtSection.className = 'district-comparison-section content-transition';
    districtSection.setAttribute('data-animation', 'fade-in');
    districtSection.setAttribute('data-delay', '1.0s');
    
    // Find where to insert it (after detailed comparison section)
    const comparisonTable = document.querySelector('.comparison-table-container');
    if (comparisonTable && comparisonTable.parentNode) {
      comparisonTable.parentNode.insertBefore(districtSection, comparisonTable.nextSibling);
    } else {
      // Fallback insertion point
      const networkComparisonSection = document.getElementById('network-comparison-section');
      if (networkComparisonSection) {
        networkComparisonSection.appendChild(districtSection);
      } else {
        console.error('Could not find a container to insert district comparison section');
        return;
      }
    }
  }
  
  // Create the content
  let districtHTML = `
    <div class="district-comparison-container">
      <h3>Network Comparison by District</h3>
      <p>Below is a comparison of network performance across districts near ${districtData.mainLocation}</p>
      
      <div class="district-cards">
  `;
  
  // Add cards for each district
  districtData.districts.forEach(district => {
    // Get operator display names and colors
    const operatorDisplayNames = {
      jio: 'Jio',
      airtel: 'Airtel',
      vi: 'Vi'
    };
    
    const operatorColors = {
      jio: '#E53935',
      airtel: '#1E88E5',
      vi: '#7B1FA2'
    };
    
    const bestOperatorDisplay = operatorDisplayNames[district.bestOperator] || district.bestOperator;
    const bestOperatorColor = operatorColors[district.bestOperator] || '#333';
    const bestOperatorImgSrc = `../images/${district.bestOperator}.${district.bestOperator === 'jio' ? 'jpeg' : 'png'}`;
    
    // Create the district card
    districtHTML += `
      <div class="district-card">
        <h4 class="district-name">${district.name}</h4>
        <div class="district-best-network" style="border-color: ${bestOperatorColor}">
          <div class="district-best-logo">
            <img src="${bestOperatorImgSrc}" alt="${bestOperatorDisplay}" />
          </div>
          <div class="district-best-details">
            <h5>Best Network: ${bestOperatorDisplay}</h5>
            <div class="district-score">Score: ${district.operators[district.bestOperator].score}/100</div>
          </div>
        </div>
        <div class="district-metrics">
          <div class="district-metric">
            <div class="metric-name">4G Coverage</div>
            <div class="mini-bars">
              <div class="mini-bar">
                <div class="mini-label">Jio</div>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${district.operators.jio.coverage4g}%; background-color: ${operatorColors.jio}"></div>
                </div>
                <div class="mini-value">${district.operators.jio.coverage4g}%</div>
              </div>
              <div class="mini-bar">
                <div class="mini-label">Airtel</div>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${district.operators.airtel.coverage4g}%; background-color: ${operatorColors.airtel}"></div>
                </div>
                <div class="mini-value">${district.operators.airtel.coverage4g}%</div>
              </div>
              <div class="mini-bar">
                <div class="mini-label">Vi</div>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${district.operators.vi.coverage4g}%; background-color: ${operatorColors.vi}"></div>
                </div>
                <div class="mini-value">${district.operators.vi.coverage4g}%</div>
              </div>
            </div>
          </div>
          <div class="district-metric">
            <div class="metric-name">Download Speed</div>
            <div class="mini-bars">
              <div class="mini-bar">
                <div class="mini-label">Jio</div>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${district.operators.jio.downloadSpeed * 2}%; background-color: ${operatorColors.jio}"></div>
                </div>
                <div class="mini-value">${district.operators.jio.downloadSpeed} Mbps</div>
              </div>
              <div class="mini-bar">
                <div class="mini-label">Airtel</div>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${district.operators.airtel.downloadSpeed * 2}%; background-color: ${operatorColors.airtel}"></div>
                </div>
                <div class="mini-value">${district.operators.airtel.downloadSpeed} Mbps</div>
              </div>
              <div class="mini-bar">
                <div class="mini-label">Vi</div>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${district.operators.vi.downloadSpeed * 2}%; background-color: ${operatorColors.vi}"></div>
                </div>
                <div class="mini-value">${district.operators.vi.downloadSpeed} Mbps</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  // Close the container
  districtHTML += `
      </div>
    </div>
  `;
  
  // Set the HTML
  districtSection.innerHTML = districtHTML;
  
  // Make sure the section is visible
  districtSection.style.display = 'block';
}

// Make functions accessible globally for HTML event handlers
window.searchLocation = searchLocation;
window.compareNetworksAction = compareNetworksAction;

// Enhance the updateBestNetworkUI function to create a more visually appealing section
function updateBestNetworkUI(data) {
  // Check if data is valid
  if (!data || !data.bestNetwork) {
    console.error('Invalid network data provided to updateBestNetworkUI:', data);
    return; // Exit early if data or bestNetwork is missing
  }

  console.log('Updating best network UI with data:', data);

  // Check if best network section already exists
  let bestNetworkSection = document.querySelector('.best-network-section');
  
  if (!bestNetworkSection) {
    // Create it if it doesn't exist
    console.log('Creating new best-network-section as it does not exist');
    bestNetworkSection = document.createElement('div');
    bestNetworkSection.className = 'best-network-section content-transition';
    bestNetworkSection.setAttribute('data-animation', 'fade-in');
    bestNetworkSection.setAttribute('data-delay', '0.5s');
    
    // Find where to insert it (after map container)
    const mapContainer = document.querySelector('.india-map-container');
    if (mapContainer && mapContainer.parentNode) {
      mapContainer.parentNode.insertBefore(bestNetworkSection, mapContainer.nextSibling);
    } else {
      console.error('Could not find .india-map-container to insert best network section after');
      // Try an alternative insertion point
      const comparisonSection = document.getElementById('network-comparison-section');
      if (comparisonSection) {
        comparisonSection.appendChild(bestNetworkSection);
      } else {
        console.error('Could not find any container to insert best network section');
        return;
      }
    }
  }
  
  // Get criteria display text
  let criteriaText = 'overall performance';
  switch (data.criteria) {
    case 'coverage': criteriaText = 'network coverage'; break;
    case 'speed': criteriaText = 'data speed'; break;
    case 'callQuality': criteriaText = 'call quality'; break;
    case 'indoorReception': criteriaText = 'indoor reception'; break;
  }
  
  // Make sure the operator value exists and is valid
  const operator = data.bestNetwork.operator || 'unknown';
  const operatorDisplay = operator.toUpperCase();
  const operatorImgSrc = `../images/${operator}.${operator === 'jio' ? 'jpeg' : 'png'}`;
  
  // Create badges for the top features of this network
  let featureBadges = '';
  
  // Add some feature badges based on the operator
  if (operator === 'jio') {
    featureBadges = `
      <div class="feature-badges">
        <span class="feature-badge"><i class="fas fa-wifi"></i> Wide 5G Coverage</span>
        <span class="feature-badge"><i class="fas fa-tachometer-alt"></i> Fast Data Speeds</span>
        <span class="feature-badge"><i class="fas fa-tags"></i> Affordable Plans</span>
      </div>
    `;
  } else if (operator === 'airtel') {
    featureBadges = `
      <div class="feature-badges">
        <span class="feature-badge"><i class="fas fa-phone-alt"></i> Best Call Quality</span>
        <span class="feature-badge"><i class="fas fa-signal"></i> Reliable Network</span>
        <span class="feature-badge"><i class="fas fa-map-marker-alt"></i> Rural Coverage</span>
      </div>
    `;
  } else if (operator === 'vi') {
    featureBadges = `
      <div class="feature-badges">
        <span class="feature-badge"><i class="fas fa-film"></i> Entertainment Bundles</span>
        <span class="feature-badge"><i class="fas fa-calendar-week"></i> Weekend Data Benefits</span>
        <span class="feature-badge"><i class="fas fa-rupee-sign"></i> Value Pricing</span>
      </div>
    `;
  }
  
  // Set the content with enhanced visual elements
  bestNetworkSection.innerHTML = `
    <div class="best-network-container">
      <h3>Best Network in <span class="location-highlight">${data.location || 'Selected Area'}</span></h3>
      <div class="best-network-card">
        <div class="network-logo">
          <img src="${operatorImgSrc}" alt="${operatorDisplay}">
        </div>
        <div class="best-network-details">
          <div class="network-header">
            <h4>${operatorDisplay}</h4>
            <div class="network-ranking-badge">
              <i class="fas fa-trophy"></i> #1 in your area
            </div>
          </div>
          <div class="network-score">Score: <span>${data.bestNetwork.score || 'N/A'}/100</span></div>
          <p>Based on ${criteriaText} in your selected area.</p>
          ${featureBadges}
        </div>
      </div>
      <div class="network-recommendation">
        <i class="fas fa-info-circle recommendation-icon"></i>
        <p>We analyzed network performance in <strong>${data.location || 'your area'}</strong> and found that <strong>${operatorDisplay}</strong> 
        provides the best ${criteriaText}. See the comparison table below for details.</p>
      </div>
    </div>
  `;
  
  // No need to add custom CSS here as it's now in the compare-networks.css file
  
  // Ensure the section is visible
  bestNetworkSection.style.display = 'block';
  console.log('Best network UI updated successfully');
  
  // Scroll to show this section
  setTimeout(() => {
    bestNetworkSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

// Enhanced function to update the network rankings with a better visual appearance
function updateNetworkRankings(rankings) {
  // Ensure rankings is valid and not empty
  if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
    console.warn('Invalid rankings data provided to updateNetworkRankings:', rankings);
    return;
  }

  console.log('Updating network rankings with data:', rankings);

  const rankingContainer = document.querySelector('.network-ranking');
  if (!rankingContainer) {
    console.error('network-ranking container not found in the DOM');
    return;
  }
  
  // Get all ranking items
  const rankingItems = rankingContainer.querySelectorAll('.ranking-item');
  if (!rankingItems || rankingItems.length === 0) {
    console.error('No ranking-item elements found in the network-ranking container');
    return;
  }
  
  // Update each item with data from rankings
  for (let i = 0; i < Math.min(rankingItems.length, rankings.length); i++) {
    const item = rankingItems[i];
    const ranking = rankings[i];
    
    // Skip invalid rankings
    if (!ranking || !ranking.operator) continue;
    
    // Update rank number if needed
    const rankNumber = item.querySelector('.rank-number');
    if (rankNumber) {
      rankNumber.textContent = i + 1;
    }
    
    // Update network image and name
    const networkElem = item.querySelector('.rank-network');
    if (networkElem) {
      const img = networkElem.querySelector('img');
      const span = networkElem.querySelector('span');
      
      if (img) {
        img.src = `../images/${ranking.operator}.${ranking.operator === 'jio' ? 'jpeg' : 'png'}`;
        img.alt = ranking.operator.toUpperCase();
      }
      
      if (span) {
        span.textContent = ranking.operator.toUpperCase();
      }
    }
    
    // Update score
    const scoreElem = item.querySelector('.rank-score');
    if (scoreElem) {
      // Remove any existing score indicators first
      const existingIndicator = scoreElem.querySelector('.score-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }
      
      // Set the score text
      scoreElem.textContent = `${ranking.score || 0}/100`;
      
      // Create a small circular progress indicator next to the score
      const progressIndicator = document.createElement('div');
      progressIndicator.className = 'score-indicator';
      
      // Now with more simplified styling since we've added proper CSS
      // Just set the background gradient dynamically
      progressIndicator.style.background = `conic-gradient(
        var(--success-color) ${(ranking.score || 0)}%, 
        var(--bg-dark-4) ${(ranking.score || 0)}% 100%
      )`;
      
      // Add the inner circle for the donut effect
      const innerCircle = document.createElement('div');
      innerCircle.className = 'score-indicator-inner';
      progressIndicator.appendChild(innerCircle);
      
      // Add the indicator next to the score
      scoreElem.appendChild(progressIndicator);
    }
    
    // Add top-rank class to first item, remove from others
    if (i === 0) {
      item.classList.add('top-rank');
    } else {
      item.classList.remove('top-rank');
    }
  }
  
  console.log('Network rankings updated successfully');
}

// Highlight the best network in the UI
function highlightBestNetwork(operator) {
  // If no operator is provided, exit early
  if (!operator) {
    console.warn('No operator provided to highlightBestNetwork');
    return;
  }

  console.log('Highlighting best network:', operator);

  // Network cards have been removed, so skip this section
  
  // Update comparison table highlights
  const comparisonTable = document.querySelector('.comparison-table table');
  if (!comparisonTable) {
    console.error('comparison-table table not found in the DOM');
  } else {
    const headerRow = comparisonTable.querySelector('thead tr');
    if (headerRow) {
      // Find which column corresponds to the best operator
      let bestColumnIndex = -1;
      const headers = headerRow.querySelectorAll('th');
      
      for (let i = 0; i < headers.length; i++) {
        const operatorDisplayNames = {
          jio: 'Jio',
          airtel: 'Airtel',
          vi: 'Vi',
          bsnl: 'BSNL',
          mtnl: 'MTNL'
        };
        const operatorDisplay = operatorDisplayNames[operator] || operator;
        
        if (headers[i].textContent.trim() === operatorDisplay) {
          bestColumnIndex = i;
          break;
        }
      }
      
      if (bestColumnIndex > 0) { // Skip first column (feature names)
        // Add a visual highlight to the header of the best operator
        headers.forEach((header, index) => {
          if (index === bestColumnIndex) {
            header.classList.add('best-operator');
          } else {
            header.classList.remove('best-operator');
          }
        });
        
        // Note: We don't override the feature-specific 'best' highlights
        // Those are handled by highlightBestValues() function
      } else {
        console.warn(`Could not find column for operator '${operator}' in comparison table`);
      }
    }
  }
  
  // Highlight in the selected networks section
  const selectedNetworks = document.querySelectorAll('.selected-network');
  if (selectedNetworks && selectedNetworks.length > 0) {
    selectedNetworks.forEach(network => {
      if (network.dataset.operator === operator) {
        network.classList.add('best-network');
      } else {
        network.classList.remove('best-network');
      }
    });
  }
  
  // Also update the metric items in the coverage metrics section
  updateCoverageMetrics(operator);
  
  console.log('Best network highlighting completed');
}

// Update coverage metrics section based on best operator
function updateCoverageMetrics(bestOperator) {
  const metricsContainer = document.querySelector('.coverage-metrics');
  if (!metricsContainer) {
    console.warn('coverage-metrics container not found in the DOM');
    return;
  }
  
  const metricItems = metricsContainer.querySelectorAll('.metric-item');
  metricItems.forEach(item => {
    const label = item.querySelector('.metric-label');
    if (label && label.textContent.toLowerCase().includes(bestOperator)) {
      item.classList.add('best-metric');
    } else {
      item.classList.remove('best-metric');
    }
  });
}

// Get user's current location using browser geolocation API
function getUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  
  const userLocationBtn = document.getElementById('user-location-btn');
  userLocationBtn.classList.add('loading');
  
  navigator.geolocation.getCurrentPosition(
    // Success handler
    function(position) {
      userLocationBtn.classList.remove('loading');
      
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      userCoordinates = { lat: latitude, lng: longitude };
      
      // Set a descriptive location name
      const locationInput = document.getElementById('location-search');
      locationInput.value = 'My Current Location';
      
      // Set current location to 'Current Location' for UI updates
      currentLocation = 'Current Location';
      
      // Update the selected location display
      const selectedLocationElement = document.getElementById('selected-location');
      if (selectedLocationElement) {
        selectedLocationElement.textContent = 'Your Current Location';
      }
      
      // Call compareNetworksAction to complete the comparison
      compareNetworksAction('My Current Location');
    },
    // Error handler
    function(error) {
      userLocationBtn.classList.remove('loading');
      let errorMessage;
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access was denied. Please allow location access or enter your location manually.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please enter your location manually.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again or enter your location manually.';
          break;
        default:
          errorMessage = 'An unknown error occurred. Please enter your location manually.';
          break;
      }
      
      alert(errorMessage);
    },
    // Options
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Attempt to get address from coordinates using reverse geocoding
async function reverseGeocode(latitude, longitude) {
  try {
    // Use a free geocoding service
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
    
    if (response.ok) {
      const data = await response.json();
      let locationName = '';
      
      if (data.address) {
        // Construct a readable location name
        const address = data.address;
        if (address.city) {
          locationName = address.city;
        } else if (address.town) {
          locationName = address.town;
        } else if (address.village) {
          locationName = address.village;
        } else if (address.suburb) {
          locationName = address.suburb;
        }
        
        if (address.state) {
          if (locationName) {
            locationName += `, ${address.state}`;
          } else {
            locationName = address.state;
          }
        }
      }
      
      if (locationName) {
        // Update the UI with a proper location name
        const locationInput = document.getElementById('location-search');
        const selectedLocationElement = document.getElementById('selected-location');
        
        if (locationInput) {
          locationInput.value = locationName;
        }
        
        if (selectedLocationElement) {
          selectedLocationElement.textContent = locationName;
        }
        
        currentLocation = locationName;
      }
    }
  } catch (error) {
    console.warn('Error with reverse geocoding:', error);
  }
}

// Function to visualize towers on the map
async function visualizeTowers() {
  // Clear existing tower layers
  removeTowerLayers();
  
  // Create a new combined tower layer for all towers
  let towerLayer = L.layerGroup().addTo(map);
  
  // Get center point and radius
  let centerLat, centerLng;
  
  // Sample city data - use the same data format as in other functions
  const cities = [
    { name: 'Delhi', coords: [28.7041, 77.1025] },
    { name: 'Mumbai', coords: [19.0760, 72.8777] },
    { name: 'Chennai', coords: [13.0827, 80.2707] },
    { name: 'Kolkata', coords: [22.5726, 88.3639] },
    { name: 'Bangalore', coords: [12.9716, 77.5946] },
    { name: 'Hyderabad', coords: [17.3850, 78.4867] },
    { name: 'Pune', coords: [18.5204, 73.8567] },
    { name: 'Ahmedabad', coords: [23.0225, 72.5714] },
    { name: 'Jaipur', coords: [26.9124, 75.7873] },
    { name: 'Lucknow', coords: [26.8467, 80.9462] }
  ];
  
  // Check if a user input location is selected
  const locationInputElement = document.getElementById('location-input');
  const locationInput = locationInputElement ? locationInputElement.value.trim() : '';
  
  // Find matching city
  const matchedCity = cities.find(city => city.name === locationInput);
  
  if (matchedCity) {
    // Use the coordinates from the matched city
    centerLat = matchedCity.coords[0];
    centerLng = matchedCity.coords[1];
  } else {
    // Use map center if no valid location is entered
    const center = map.getCenter();
    centerLat = center.lat;
    centerLng = center.lng;
  }
  
  // Get radius from slider
  const radiusSlider = document.getElementById('radius-slider');
  const radius = radiusSlider ? radiusSlider.value : 5; // Default to 5 if element not found
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  const towerCount = document.getElementById('tower-count');
  
  if (loadingIndicator) loadingIndicator.style.display = 'block';
  if (towerCount) towerCount.textContent = 'Loading...';
  
  try {
    // Try to fetch data from API
    let towerData = await fetchTowerData(centerLat, centerLng, radius);
    
    // If API failed or returned null, use fallback data
    if (!towerData) {
      console.log('Using fallback tower data generator');
      towerData = generateFallbackTowerData(centerLat, centerLng, radius);
      // Show warning to user
      showNotification('API unavailable - using simulated tower data', 'warning', 5000);
    }
    
    // Create tower markers
    towerData.forEach(tower => {
      // Get lat/lng values, checking both possible property names
      const lat = tower.lat || tower.latitude;
      const lng = tower.lng || tower.longitude;
      
      // Skip creating marker if coordinates are missing or invalid
      if (!lat || !lng) {
        console.warn('Skipping tower with invalid coordinates:', tower);
        return;
      }
      
      const towerIcon = L.divIcon({
        className: 'tower-icon',
        html: `<div class="tower ${tower.operator.toLowerCase()}"></div>`,
        iconSize: [20, 20]
      });
      
      const marker = L.marker([lat, lng], { icon: towerIcon }).addTo(towerLayer);
      
      // Create popup content
      const popupContent = `
        <div class="tower-popup">
          <h3>${tower.operator} Tower</h3>
          <p><strong>Type:</strong> ${tower.type || tower.towerType || 'Unknown'}</p>
          <p><strong>Technology:</strong> ${(tower.technology || tower.technologySupported || ['Unknown']).join(', ')}</p>
          <p><strong>Signal Strength:</strong> ${tower.signalStrength || 'N/A'} dBm</p>
          <p><strong>Frequency:</strong> ${tower.frequency || 'N/A'} MHz</p>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });
    
    // Update tower count
    if (towerCount) towerCount.textContent = `${towerData.length} towers found`;
    
  } catch (error) {
    console.error('Error in visualizeTowers:', error);
    if (towerCount) towerCount.textContent = 'Error loading tower data';
    showNotification('Error loading tower data. Please try again.', 'error', 5000);
  } finally {
    // Hide loading indicator
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}

// Helper function to show notifications
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.getElementById('notification') || createNotificationElement();
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, duration);
}

// Create notification element if it doesn't exist
function createNotificationElement() {
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.className = 'notification';
  document.body.appendChild(notification);
  return notification;
}

// Function to fetch tower data from the API
async function fetchTowerData(lat, lng, radius) {
  // Check if API is available
  if (!API_BASE_URL) {
    console.log('API is not available. Using fallback data.');
    return null;
  }
  
  // Validate input parameters
  if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    console.warn('Invalid coordinates for tower data request', { lat, lng });
    return null;
  }
  
  // Ensure radius is a valid number
  const validRadius = Number(radius) || 5;

  try {
    // Format parameters to ensure they are valid numbers with correct precision
    const formattedLat = parseFloat(lat).toFixed(6);
    const formattedLng = parseFloat(lng).toFixed(6);
    
    const url = `${API_BASE_URL}/network-coverage/tower-data?lat=${formattedLat}&lng=${formattedLng}&radius=${validRadius}`;
    console.log(`Fetching tower data from: ${url}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Log more details about the error
        console.warn(`API response error: ${response.status} ${response.statusText}`);
        throw new Error(`Error fetching tower data: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Check if this was an abort error (timeout)
      if (error.name === 'AbortError') {
        console.log('Fetch request timed out after 5 seconds');
      } else {
        console.error('API Error:', error);
      }
      // Always use fallback data instead of failing
      return null;
    }
  } catch (error) {
    console.error('Error fetching tower data:', error);
    return null;
  }
}

// Function to generate fallback tower data
function generateFallbackTowerData(lat, lng, radius) {
  const towerCount = Math.floor(Math.random() * 15) + 10; // 10-25 towers
  const towers = [];
  
  for (let i = 0; i < towerCount; i++) {
    // Generate random positions within the radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius * 0.8; // within 80% of radius
    
    // Convert polar to cartesian coordinates
    // 0.009 = roughly 1km in latitude/longitude
    const offsetLat = (distance * Math.cos(angle) * 0.009);
    const offsetLng = (distance * Math.sin(angle) * 0.009);
    
    const tower = {
      id: `fallback-${i}`,
      latitude: lat + offsetLat,
      longitude: lng + offsetLng,
      operator: ["Airtel", "Jio", "Vodafone", "BSNL"][Math.floor(Math.random() * 4)],
      towerType: ["Roof Top", "Ground Based", "COW"][Math.floor(Math.random() * 3)],
      technologySupported: ["4G", "5G", "3G/4G"][Math.floor(Math.random() * 3)],
      signalStrength: Math.floor(Math.random() * 40) + 60, // 60-100
      frequency: [700, 800, 900, 1800, 2100, 2300, 2500][Math.floor(Math.random() * 7)]
    };
    
    towers.push(tower);
  }
  
  return towers;
}

// Display towers on the map using the provided data
function displayTowers(data) {
  if (!map) return;
  
  const networks = ['jio', 'airtel', 'vi'];
  const towerCounts = { jio: 0, airtel: 0, vi: 0 };
  
  // Updated colors that match the coverage colors
  const networkColors = {
    jio: '#E53935',    // Bright red for Jio
    airtel: '#1E88E5', // Blue for Airtel
    vi: '#7B1FA2',     // Purple for Vi
  };
  
  networks.forEach(network => {
    // Get network-specific details
    const color = networkColors[network];
    let iconClass;
    if (network === 'jio') {
      iconClass = 'jio-tower';
    } else if (network === 'airtel') {
      iconClass = 'airtel-tower';
    } else { // Vi
      iconClass = 'vi-tower';
    }
    
    // Create a layer for this network's towers
    const towerLayer = L.layerGroup();
    
    // Check if we have data for this network
    if (data && data.towerData && data.towerData[network]) {
      const networkData = data.towerData[network];
      towerCounts[network] = networkData.count;
      
      // Add tower markers
      networkData.towers.forEach(tower => {
        // Use circular markers instead of icons for a cleaner look like nperf.com
        const towerMarker = L.circleMarker([tower.lat, tower.lng], {
          radius: 4,
          fillColor: color,
          color: '#ffffff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9
        });
        
        // Add popup with tower info
        towerMarker.bindPopup(`
          <div class="tower-popup">
            <h4>${network.toUpperCase()} Tower</h4>
            <p>Location: ${tower.lat.toFixed(4)}, ${tower.lng.toFixed(4)}</p>
            <p>Signal Strength: ${tower.strength}%</p>
            <p>Frequency: ${tower.frequency}</p>
          </div>
        `);
        
        // Add to layer group
        towerLayer.addLayer(towerMarker);
      });
      
      // Add signal strength heatmap for a more comprehensive visualization
      if (networkData.towers.length > 0) {
        const heatmapPoints = networkData.towers.map(tower => {
          // Convert signal strength to intensity (0-1)
          const intensity = tower.strength / 100;
          return [tower.lat, tower.lng, intensity * 0.4]; // Reduced intensity for better visualization
        });
        
        // Create heatmap layer if we have any points
        if (heatmapPoints.length > 0 && L.heatLayer) {
          try {
            // More transparent gradient for better layering
            const heatmap = L.heatLayer(heatmapPoints, {
              radius: 25,
              blur: 15,
              maxZoom: 10,
              minOpacity: 0.3,
              maxOpacity: 0.6,
              gradient: {
                0.2: color + '20', 
                0.5: color + '50', 
                0.8: color + '80',
                1.0: color
              }
            });
            towerLayer.addLayer(heatmap);
          } catch (e) {
            console.error('Error creating heatmap:', e);
          }
        }
      }
    }
    
    // Add tower layer to map and store reference
    towerLayer.addTo(map);
    towerLayers[network] = towerLayer;
  });
  
  // Update tower count display
  updateTowerCountDisplay(towerCounts);
  
  // Optimize canvas elements for heat maps
  optimizeHeatmapCanvas();

  // After displaying towers, manage layers to ensure proper visibility
  setTimeout(manageLayers, 200);
}

// Update tower count display in the UI
function updateTowerCountDisplay(towerCounts) {
  const jioCountElem = document.getElementById('jio-tower-count');
  const airtelCountElem = document.getElementById('airtel-tower-count');
  const viCountElem = document.getElementById('vi-tower-count');
  const towerInfoPanel = document.getElementById('tower-info-panel');
  
  if (jioCountElem) jioCountElem.textContent = towerCounts.jio;
  if (airtelCountElem) airtelCountElem.textContent = towerCounts.airtel;
  if (viCountElem) viCountElem.textContent = towerCounts.vi;
  
  // Show tower info panel
  if (towerInfoPanel) towerInfoPanel.style.display = 'block';
}

// Remove all tower layers from the map
function removeTowerLayers() {
  if (!map) return;
  
  Object.values(towerLayers).forEach(layer => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  
  // Reset tower count display
  const jioCountElem = document.getElementById('jio-tower-count');
  const airtelCountElem = document.getElementById('airtel-tower-count');
  const viCountElem = document.getElementById('vi-tower-count');
  const towerInfoPanel = document.getElementById('tower-info-panel');
  
  if (jioCountElem) jioCountElem.textContent = '0';
  if (airtelCountElem) airtelCountElem.textContent = '0';
  if (viCountElem) viCountElem.textContent = '0';
  
  // Hide tower info panel
  if (towerInfoPanel) towerInfoPanel.style.display = 'none';
}

// Helper function to get fallback network data
function getFallbackNetworkData(location) {
  const networks = ['jio', 'airtel', 'vi'];
  const locationSeed = location.charCodeAt(0) + location.length;
  
  // Calculate ratings
  const jioRating = Math.min(100, 85 + (locationSeed % 10));
  const airtelRating = Math.min(100, 88 + (locationSeed % 8));
  const viRating = Math.min(100, 78 + (locationSeed % 12));
  
  // Create rankings
  const rankings = [
    { operator: 'airtel', score: airtelRating },
    { operator: 'jio', score: jioRating },
    { operator: 'vi', score: viRating }
  ];
  
  // Sort by score
  rankings.sort((a, b) => b.score - a.score);
  
  // Generate detailed comparison data
  // Base values with some variability based on location seed
  const jio4gCoverage = 95 + (locationSeed % 4);
  const airtel4gCoverage = 96 + (locationSeed % 5);
  const vi4gCoverage = 90 + (locationSeed % 3);
  
  const jio5gCoverage = 80 + (locationSeed % 10);
  const airtel5gCoverage = 75 + (locationSeed % 10);
  const vi5gCoverage = 55 + (locationSeed % 10);
  
  const jioDownloadSpeed = 22 + (locationSeed % 8);
  const airtelDownloadSpeed = 27 + (locationSeed % 8);
  const viDownloadSpeed = 18 + (locationSeed % 5);
  
  const jioUploadSpeed = 8 + (locationSeed % 4);
  const airtelUploadSpeed = 10 + (locationSeed % 5);
  const viUploadSpeed = 7 + (locationSeed % 3);
  
  // Qualitative ratings based on score
  const getQualitativeRating = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Poor';
  };
  
  const jioCallQuality = getQualitativeRating(jioRating - 5);
  const airtelCallQuality = getQualitativeRating(airtelRating);
  const viCallQuality = getQualitativeRating(viRating);
  
  const jioIndoorReception = getQualitativeRating(jioRating - 10);
  const airtelIndoorReception = getQualitativeRating(airtelRating - 5);
  const viIndoorReception = getQualitativeRating(viRating - 15);
  
  const jioCongestion = getQualitativeRating(jioRating + 5);
  const airtelCongestion = getQualitativeRating(airtelRating - 5);
  const viCongestion = getQualitativeRating(viRating - 10);
  
  const jioSatisfaction = (jioRating / 20).toFixed(1);
  const airtelSatisfaction = (airtelRating / 20).toFixed(1);
  const viSatisfaction = (viRating / 20).toFixed(1);
  
  // Create detailed comparison data
  const comparisonData = {
    jio: {
      '4g_coverage': jio4gCoverage,
      '5g_coverage': jio5gCoverage,
      'download_speed': jioDownloadSpeed,
      'upload_speed': jioUploadSpeed,
      'call_quality': jioCallQuality,
      'indoor_reception': jioIndoorReception,
      'congestion': jioCongestion,
      'satisfaction': jioSatisfaction
    },
    airtel: {
      '4g_coverage': airtel4gCoverage,
      '5g_coverage': airtel5gCoverage,
      'download_speed': airtelDownloadSpeed,
      'upload_speed': airtelUploadSpeed,
      'call_quality': airtelCallQuality,
      'indoor_reception': airtelIndoorReception,
      'congestion': airtelCongestion,
      'satisfaction': airtelSatisfaction
    },
    vi: {
      '4g_coverage': vi4gCoverage,
      '5g_coverage': vi5gCoverage,
      'download_speed': viDownloadSpeed,
      'upload_speed': viUploadSpeed,
      'call_quality': viCallQuality,
      'indoor_reception': viIndoorReception,
      'congestion': viCongestion,
      'satisfaction': viSatisfaction
    }
  };
  
  // Create and return the data object
  const fallbackData = {
    location,
    bestNetwork: rankings[0],
    rankings,
    criteria: 'overall',
    comparison: comparisonData
  };
  
  console.log('Generated fallback network data:', fallbackData);
  return fallbackData;
}

// Add this helper function at the bottom of the file
function optimizeHeatmapCanvas() {
  // Find all canvas elements created by Leaflet heat plugin and set willReadFrequently attribute
  setTimeout(() => {
    const canvasElements = document.querySelectorAll('canvas.leaflet-heatmap-layer');
    canvasElements.forEach(canvas => {
      // Set the willReadFrequently attribute to true to optimize getImageData calls
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      console.log('Optimized heatmap canvas for better performance');
    });
  }, 100); // Small delay to ensure canvas elements are created
}

// Fix the issue with manageLayers for better control of map elements and avoid overlapping
function manageLayers() {
  const showTowersCheckbox = document.getElementById('show-towers');
  const networkSelect = document.getElementById('network-select');
  const coverageTypeRadios = document.querySelectorAll('input[name="coverage-type"]');
  
  // Get current state
  const showTowers = showTowersCheckbox && showTowersCheckbox.checked;
  const selectedNetwork = networkSelect ? networkSelect.value : 'all';
  
  // Get active coverage circles
  const coverageLayers = document.querySelectorAll('.coverage-layer');
  
  // Fix overlapping map elements by ensuring proper z-index application
  ensureCorrectZIndex();
  
  // Apply different layer management strategies based on what's being shown
  if (showTowers) {
    // When showing towers, reduce coverage opacity for better visibility of tower points and heatmaps
    coverageLayers.forEach(layer => {
      // Adjust base opacity based on whether all networks or just one is selected
      const baseOpacity = selectedNetwork === 'all' ? 0.2 : 0.25;
      
      // Make coverage layers slightly transparent when towers are shown
      if (layer.style && typeof layer.style.fillOpacity !== 'undefined') {
        layer.style.fillOpacity = baseOpacity.toString();
      }
    });
    
    // Handle tower layers visibility based on selected network
    if (selectedNetwork !== 'all') {
      // When a specific network is selected, show only that network's towers prominently
      Object.keys(towerLayers).forEach(network => {
        if (network === selectedNetwork) {
          // Make the selected network tower layer fully visible
          if (towerLayers[network]) {
            towerLayers[network].eachLayer(layer => {
              if (layer instanceof L.CircleMarker) {
                layer.setStyle({ 
                  opacity: 1, 
                  fillOpacity: 0.9
                });
              } else if (layer instanceof L.HeatLayer) {
                // For heatmaps, set options if available
                if (layer.setOptions) {
                  layer.setOptions({ 
                    maxOpacity: 0.7,
                    minOpacity: 0.3
                  });
                }
              }
            });
          }
        } else {
          // Fade other networks' tower layers
          if (towerLayers[network]) {
            towerLayers[network].eachLayer(layer => {
              if (layer instanceof L.CircleMarker) {
                layer.setStyle({ 
                  opacity: 0.3, 
                  fillOpacity: 0.3
                });
              } else if (layer instanceof L.HeatLayer) {
                // For heatmaps, set options if available
                if (layer.setOptions) {
                  layer.setOptions({ 
                    maxOpacity: 0.2,
                    minOpacity: 0.1
                  });
                }
              }
            });
          }
        }
      });
    } else {
      // When all networks are selected, show all tower layers with balanced visibility
      Object.keys(towerLayers).forEach(network => {
        if (towerLayers[network]) {
          towerLayers[network].eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
              layer.setStyle({ 
                opacity: 0.8, 
                fillOpacity: 0.8
              });
            } else if (layer instanceof L.HeatLayer) {
              // For heatmaps, set options if available
              if (layer.setOptions) {
                layer.setOptions({ 
                  maxOpacity: 0.5,
                  minOpacity: 0.2
                });
              }
            }
          });
        }
      });
    }
  } else {
    // When not showing towers, restore normal coverage layer visibility
    coverageLayers.forEach(layer => {
      if (layer.style && typeof layer.style.fillOpacity !== 'undefined') {
        // Set higher opacity when only showing coverage layers
        layer.style.fillOpacity = selectedNetwork === 'all' ? '0.35' : '0.5';
      }
    });
    
    // Hide tower layers or clean them up
    Object.keys(towerLayers).forEach(network => {
      if (map.hasLayer(towerLayers[network])) {
        map.removeLayer(towerLayers[network]);
      }
    });
  }
  
  // Update the legend to reflect current visibility
  updateLegendVisibility(showTowers, selectedNetwork);
  
  // Also update the map tooltip to show relevant information
  updateMapTooltip(showTowers, selectedNetwork);
  
  // Ensure proper positioning of UI elements
  positionMapControls();
}

// Add a new function to ensure correct z-index for map elements
function ensureCorrectZIndex() {
  // Get the map container
  const mapContainer = document.getElementById('coverage-map');
  if (!mapContainer) return;
  
  // Ensure canvas elements are properly layered
  const canvasElements = mapContainer.querySelectorAll('canvas.leaflet-heatmap-layer');
  canvasElements.forEach(canvas => {
    canvas.style.zIndex = '200';
  });
  
  // Ensure SVG paths (coverage areas) are below markers
  const svgElements = mapContainer.querySelectorAll('.leaflet-overlay-pane svg');
  svgElements.forEach(svg => {
    svg.style.zIndex = '100';
  });
  
  // Ensure marker pane is above other elements
  const markerPane = mapContainer.querySelector('.leaflet-marker-pane');
  if (markerPane) {
    markerPane.style.zIndex = '600';
  }
  
  // Ensure popup pane is at the top
  const popupPane = mapContainer.querySelector('.leaflet-popup-pane');
  if (popupPane) {
    popupPane.style.zIndex = '700';
  }
  
  // Fix map controls
  const controls = mapContainer.querySelector('.leaflet-control-container');
  if (controls) {
    controls.style.zIndex = '1000';
  }
}

// Add a function to properly position map controls and avoid overlaps
function positionMapControls() {
  // Get the main map controls
  const mapLegend = document.getElementById('map-legend');
  const layerOpacityControl = document.getElementById('layer-opacity-control');
  const mapInfoPanel = document.querySelector('.map-info-panel');
  const zoomControls = document.querySelector('.map-zoom-controls');
  
  // Check if we have all elements before proceeding
  if (!mapLegend || !layerOpacityControl) return;
  
  // Check viewport size to apply responsive positioning
  const isMobile = window.innerWidth <= 768;
  
  // Position layer opacity control
  layerOpacityControl.style.top = isMobile ? '10px' : '25px';
  layerOpacityControl.style.right = isMobile ? '10px' : '25px';
  
  // Position map zoom controls below layer opacity control
  if (zoomControls) {
    const opacityHeight = layerOpacityControl.offsetHeight;
    const topPosition = (isMobile ? 10 : 25) + opacityHeight + 15;
    zoomControls.style.top = `${topPosition}px`;
    zoomControls.style.right = isMobile ? '10px' : '25px';
  }
  
  // Position map legend
  mapLegend.style.bottom = isMobile ? '10px' : '25px';
  mapLegend.style.right = isMobile ? '10px' : '25px';
  
  // Position info panel if it exists
  if (mapInfoPanel) {
    mapInfoPanel.style.bottom = isMobile ? '10px' : '25px';
    mapInfoPanel.style.left = isMobile ? '10px' : '25px';
    
    // Adjust tower info panel positioning to prevent overflow
    const towerInfoPanel = document.getElementById('tower-info-panel');
    if (towerInfoPanel) {
      // Remove any fixed positioning that might cause overflow
      towerInfoPanel.style.position = 'relative';
      towerInfoPanel.style.top = 'auto';
      towerInfoPanel.style.left = 'auto';
    }
  }
}

// Call these functions when the window resizes to prevent overlapping
window.addEventListener('resize', function() {
  positionMapControls();
  ensureCorrectZIndex();
});

// Add event listeners to call manageLayers when relevant controls change
function setupLayerManagement() {
  const showTowersCheckbox = document.getElementById('show-towers');
  const networkSelect = document.getElementById('network-select');
  const coverageTypeRadios = document.querySelectorAll('input[name="coverage-type"]');
  
  if (showTowersCheckbox) {
    showTowersCheckbox.addEventListener('change', manageLayers);
  }
  
  if (networkSelect) {
    networkSelect.addEventListener('change', function() {
      if (window.updateMapLayers) {
        window.updateMapLayers();
      }
      manageLayers();
    });
  }
  
  if (coverageTypeRadios.length) {
    coverageTypeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (window.updateMapLayers) {
          window.updateMapLayers();
        }
        manageLayers();
      });
    });
  }
}

// Add a new function to update the map tooltip based on the current state
function updateMapTooltip(showTowers, selectedNetwork) {
  const tooltip = document.querySelector('.map-tooltip');
  if (!tooltip) return;
  
  // Prepare tooltip content based on what's being shown
  let headerText = 'Coverage Details';
  let contentHTML = '';
  
  if (showTowers) {
    headerText = selectedNetwork === 'all' ? 'Network Tower Coverage' : `${selectedNetwork.toUpperCase()} Tower Coverage`;
    
    // Create content for tower view
    const operatorName = selectedNetwork === 'all' ? 'All Networks' : selectedNetwork.toUpperCase();
    contentHTML = `
      <div class="tooltip-coverage">
        <span class="network-name">${operatorName}</span>
        <span class="coverage-level">Active</span>
      </div>
      <div class="tooltip-info">
        Click on tower markers to see details
      </div>
    `;
  } else {
    headerText = 'Network Coverage';
    
    // Create content for coverage view
    const operatorName = selectedNetwork === 'all' ? 'All Networks' : selectedNetwork.toUpperCase();
    const coverageType = document.querySelector('input[name="coverage-type"]:checked')?.value || '4g';
    contentHTML = `
      <div class="tooltip-coverage">
        <span class="network-name">${operatorName}</span>
        <span class="coverage-level">${coverageType.toUpperCase()}</span>
      </div>
      <div class="tooltip-info">
        Showing coverage areas in selected region
      </div>
    `;
  }
  
  // Update the tooltip
  const tooltipHeader = tooltip.querySelector('.tooltip-header h5');
  const tooltipContent = tooltip.querySelector('.tooltip-content');
  
  if (tooltipHeader) tooltipHeader.textContent = headerText;
  if (tooltipContent) tooltipContent.innerHTML = contentHTML;
  
  // Make tooltip visible
  tooltip.classList.add('visible');
  
  // Hide tooltip after 5 seconds
  setTimeout(() => {
    tooltip.classList.remove('visible');
  }, 5000);
}

// Update the legend visibility based on current map state
function updateLegendVisibility(showTowers, selectedNetwork) {
  const legend = document.getElementById('map-legend');
  if (!legend) return;
  
  // Show/hide appropriate legend sections
  const networkItems = legend.querySelectorAll('.legend-item');
  const signalStrengthSection = legend.querySelector('h4[style="margin-top: 10px;"]');
  
  // Fix: Check if the elements exist and properly get the items
  let signalStrengthItems = [];
  if (signalStrengthSection) {
    // Find all legend items that appear after the signal strength section
    // Instead of trying to access specific elements by chaining nextElementSibling
    const allLegendItems = legend.querySelectorAll('.legend-item');
    const signalStrengthSectionIndex = Array.from(legend.children).indexOf(signalStrengthSection);
    
    if (signalStrengthSectionIndex !== -1) {
      // Get items that appear after the signal strength section
      signalStrengthItems = Array.from(allLegendItems).filter((item, index) => {
        // Only include items that appear after the signal strength section and are not network items
        return index >= 3; // Skip the first 3 items which are network colors
      });
    }
  }
  
  // Always show the network coverage items
  networkItems.forEach((item, index) => {
    if (index < 3) { // First 3 items are network colors
      const networkSpan = item.querySelector('span');
      if (networkSpan) {
        const network = networkSpan.textContent.toLowerCase();
        if (selectedNetwork === 'all' || selectedNetwork === network) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      }
    }
  });
  
  // Show signal strength section only when showing towers
  if (signalStrengthSection) {
    signalStrengthSection.style.display = showTowers ? 'block' : 'none';
  }
  
  // Show signal strength items only when showing towers
  signalStrengthItems.forEach(item => {
    if (item) {
      item.style.display = showTowers ? 'flex' : 'none';
    }
  });
}

// Function to update the detailed comparison table with actual data
function updateDetailedComparisonTable(data) {
  console.log('Updating comparison table with data:', data);
  
  // Get the comparison table container
  const comparisonTableContainer = document.querySelector('.comparison-table-container');
  if (!comparisonTableContainer) {
    console.error('Comparison table container not found');
    return;
  }

  // Update the location in the subtitle if available
  const subtitle = comparisonTableContainer.querySelector('p');
  if (subtitle && data.location) {
    subtitle.textContent = `Below is a side-by-side comparison of network performance in ${data.location}`;
  }

  // Show previously hidden networks when we update with new data
  const selectedNetworks = comparisonTableContainer.querySelectorAll('.selected-network');
  selectedNetworks.forEach(network => {
    network.style.display = 'flex';
  });
  
  // Remove any "no networks" message
  const noNetworksMessage = comparisonTableContainer.querySelector('.no-networks-message');
  if (noNetworksMessage) {
    noNetworksMessage.remove();
  }

  // Get the comparison table
  const comparisonTable = comparisonTableContainer.querySelector('.comparison-table table');
  if (!comparisonTable) {
    console.error('Comparison table not found');
    return;
  }

  // Get the table body
  const tableBody = comparisonTable.querySelector('tbody');
  if (!tableBody) {
    console.error('Table body not found');
    return;
  }

  // Clear any existing rows in the table body
  tableBody.innerHTML = '';

  // Define rows to update based on the data structure we expect
  const rowsToUpdate = [
    { feature: '4G Coverage', keys: ['jio.4g_coverage', 'airtel.4g_coverage', 'vi.4g_coverage'], suffix: '%' },
    { feature: '5G Coverage', keys: ['jio.5g_coverage', 'airtel.5g_coverage', 'vi.5g_coverage'], suffix: '%' },
    { feature: 'Avg. Download Speed', keys: ['jio.download_speed', 'airtel.download_speed', 'vi.download_speed'], suffix: ' Mbps' },
    { feature: 'Avg. Upload Speed', keys: ['jio.upload_speed', 'airtel.upload_speed', 'vi.upload_speed'], suffix: ' Mbps' },
    { feature: 'Call Quality', keys: ['jio.call_quality', 'airtel.call_quality', 'vi.call_quality'], suffix: '' },
    { feature: 'Indoor Reception', keys: ['jio.indoor_reception', 'airtel.indoor_reception', 'vi.indoor_reception'], suffix: '' },
    { feature: 'Congestion Handling', keys: ['jio.congestion', 'airtel.congestion', 'vi.congestion'], suffix: '' },
    { feature: 'Customer Satisfaction', keys: ['jio.satisfaction', 'airtel.satisfaction', 'vi.satisfaction'], suffix: '/5' }
  ];

  // Create the table rows
  rowsToUpdate.forEach(rowData => {
    const row = document.createElement('tr');
    
    // Add feature name cell
    const featureCell = document.createElement('td');
    featureCell.className = 'feature-name';
    featureCell.textContent = rowData.feature;
    row.appendChild(featureCell);
    
    // Get values for this feature from the comparison data
    const values = [];
    
    rowData.keys.forEach(key => {
      // Parse the key path (e.g., 'jio.4g_coverage' -> ['jio', '4g_coverage'])
      const keyParts = key.split('.');
      
      // Get the operator
      const operator = keyParts[0];
      
      // Get the feature key
      const featureKey = keyParts[1];
      
      // Get the value from the nested data structure
      let value = null;
      
      // Make sure data.comparison and the operator exist
      if (data.comparison && data.comparison[operator] && data.comparison[operator][featureKey] !== undefined) {
        value = data.comparison[operator][featureKey];
      } else if (data[operator] && data[operator][featureKey] !== undefined) {
        // Alternative data structure
        value = data[operator][featureKey];
      }
      
      values.push({
        operator: operator,
        value: value
      });
    });
    
    // Find the best value (highest number or best text rating)
    let bestValue = null;
    let bestOperator = null;
    
    // Quality ratings for text values
    const qualityRatings = {
      'Excellent': 5,
      'Very Good': 4,
      'Good': 3,
      'Average': 2,
      'Poor': 1
    };
    
    values.forEach(item => {
      if (item.value !== null) {
        if (typeof item.value === 'number') {
          // For numeric values, higher is better
          if (bestValue === null || item.value > bestValue) {
            bestValue = item.value;
            bestOperator = item.operator;
          }
        } else if (typeof item.value === 'string') {
          // For text values, use quality ratings
          const rating = qualityRatings[item.value] || 0;
          const bestRating = bestValue ? (qualityRatings[bestValue] || 0) : 0;
          
          if (bestValue === null || rating > bestRating) {
            bestValue = item.value;
            bestOperator = item.operator;
          }
        }
      }
    });
    
    // Add cells for each operator's value
    values.forEach(item => {
      const valueCell = document.createElement('td');
      valueCell.className = 'feature-value';
      
      // Format the value with the suffix
      if (item.value !== null) {
        valueCell.textContent = item.value + rowData.suffix;
        
        // Highlight the best value
        if (item.operator === bestOperator) {
          valueCell.classList.add('best');
        }
      } else {
        valueCell.textContent = 'N/A';
      }
      
      row.appendChild(valueCell);
    });
    
    // Add the row to the table
    tableBody.appendChild(row);
  });
  
  // Make sure the comparison table container is visible
  comparisonTableContainer.style.display = 'block';
  
  // Set up event listeners for the remove buttons again (in case they were replaced)
  setupRemoveNetworkButtons();
}

// Function to set up event listeners for remove network buttons
function setupRemoveNetworkButtons() {
  const removeButtons = document.querySelectorAll('.remove-network-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const operator = this.getAttribute('data-operator');
      removeNetworkFromComparison(operator);
    });
  });
}

// Function to remove a network from the comparison
function removeNetworkFromComparison(operator) {
  console.log('Removing network from comparison:', operator);
  
  // Find and hide the selected network element
  const selectedNetworksContainer = document.querySelector('.selected-networks');
  const networkElement = selectedNetworksContainer.querySelector(`[data-operator="${operator}"]`);
  if (networkElement) {
    networkElement.style.display = 'none';
  }

  // Remove or hide the column from the comparison table
  const comparisonTable = document.querySelector('.comparison-table table');
  if (comparisonTable) {
    const operatorDisplayNames = {
      jio: 'Jio',
      airtel: 'Airtel',
      vi: 'Vi'
    };
    const operatorName = operatorDisplayNames[operator] || operator;

    // Find the index of the column to remove
    const headerRow = comparisonTable.querySelector('thead tr');
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th'));
      const columnIndex = headers.findIndex(th => th.textContent.trim() === operatorName);
      
      if (columnIndex > 0) { // Skip feature column (index 0)
        // Hide the column in each row
        const rows = comparisonTable.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('th, td');
          if (cells.length > columnIndex) {
            cells[columnIndex].style.display = 'none';
          }
        });
      }
    }
  }

  // Show a message if all networks are hidden
  let allHidden = true;
  const networks = selectedNetworksContainer.querySelectorAll('.selected-network');
  networks.forEach(network => {
    if (network.style.display !== 'none') {
      allHidden = false;
    }
  });
  
  if (allHidden) {
    const message = document.createElement('div');
    message.className = 'no-networks-message';
    message.textContent = 'No networks selected for comparison. Please search for a location to compare networks.';
    selectedNetworksContainer.appendChild(message);
  }
}

// Function to set up event listeners for view details buttons
function setupViewDetailsButtons() {
  console.log('Setting up view details button event listeners');
  
  // Network cards have been removed, so this function is now empty
  // Keeping the function for compatibility with any existing code
}