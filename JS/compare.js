// Use the global PortMySimAPI object instead of importing functions
// The following functions are available through window.PortMySimAPI:
// - fetchNetworkCoverage
// - compareNetworks
// - getLocationsWithCoverage

// Global variables
let map;
let networkLayers = {
  jio: null,
  airtel: null,
  vi: null
};
let currentLocation = null;
let towerLayers = {}; // For storing tower layers by network
let userLocationMarker = null; // For marking user's selected location
let userCoordinates = null; // For storing user's geolocation coordinates
let selectedState = null; // For tracking the selected state
let selectedCity = null; // For tracking the selected city
let locationSearchInput = null; // Reference to the location search input element
const API_BASE_URL = 'http://localhost:5000/api';

// Define the cities array for state-city browser
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
  { name: 'Visakhapatnam', coords: [17.6868, 83.2185], state: 'Andhra Pradesh' },
  { name: 'Vijayawada', coords: [16.5062, 80.6480], state: 'Andhra Pradesh' },
  { name: 'Guntur', coords: [16.3067, 80.4365], state: 'Andhra Pradesh' },
  { name: 'Nellore', coords: [14.4426, 79.9865], state: 'Andhra Pradesh' },
  { name: 'Kurnool', coords: [15.8281, 78.0373], state: 'Andhra Pradesh' },
  { name: 'Tirupati', coords: [13.6288, 79.4192], state: 'Andhra Pradesh' },
  { name: 'Amaravati', coords: [16.5130, 80.5166], state: 'Andhra Pradesh' },
  
  // Arunachal Pradesh
  { name: 'Itanagar', coords: [27.0844, 93.6053], state: 'Arunachal Pradesh' },
  { name: 'Naharlagun', coords: [27.1036, 93.6962], state: 'Arunachal Pradesh' },
  { name: 'Pasighat', coords: [28.0700, 95.3300], state: 'Arunachal Pradesh' },
  { name: 'Tawang', coords: [27.5859, 91.8588], state: 'Arunachal Pradesh' },
  
  // Assam
  { name: 'Guwahati', coords: [26.1445, 91.7362], state: 'Assam' },
  { name: 'Silchar', coords: [24.8333, 92.7789], state: 'Assam' },
  { name: 'Dibrugarh', coords: [27.4728, 94.9120], state: 'Assam' },
  { name: 'Jorhat', coords: [26.7465, 94.2026], state: 'Assam' },
  { name: 'Dispur', coords: [26.1433, 91.7898], state: 'Assam' },
  
  // Bihar
  { name: 'Patna', coords: [25.5941, 85.1376], state: 'Bihar' },
  { name: 'Gaya', coords: [24.7914, 84.9994], state: 'Bihar' },
  { name: 'Bhagalpur', coords: [25.2425, 86.9842], state: 'Bihar' },
  { name: 'Muzaffarpur', coords: [26.1197, 85.3910], state: 'Bihar' },
  { name: 'Darbhanga', coords: [26.1542, 85.8918], state: 'Bihar' },
  
  // Chhattisgarh
  { name: 'Raipur', coords: [21.2514, 81.6296], state: 'Chhattisgarh' },
  { name: 'Bhilai', coords: [21.2090, 81.4280], state: 'Chhattisgarh' },
  { name: 'Bilaspur', coords: [22.0797, 82.1409], state: 'Chhattisgarh' },
  { name: 'Korba', coords: [22.3595, 82.7501], state: 'Chhattisgarh' },
  { name: 'Durg', coords: [21.1906, 81.2849], state: 'Chhattisgarh' },
  
  // Goa
  { name: 'Panaji', coords: [15.4909, 73.8278], state: 'Goa' },
  { name: 'Margao', coords: [15.2832, 73.9862], state: 'Goa' },
  { name: 'Vasco da Gama', coords: [15.3981, 73.8113], state: 'Goa' },
  { name: 'Mapusa', coords: [15.5937, 73.8142], state: 'Goa' },
  
  // Gujarat
  { name: 'Gandhinagar', coords: [23.2156, 72.6369], state: 'Gujarat' },
  { name: 'Surat', coords: [21.1702, 72.8311], state: 'Gujarat' },
  { name: 'Vadodara', coords: [22.3072, 73.1812], state: 'Gujarat' },
  { name: 'Rajkot', coords: [22.2734, 70.7713], state: 'Gujarat' },
  { name: 'Bhavnagar', coords: [21.7645, 72.1519], state: 'Gujarat' },
  
  // Haryana
  { name: 'Chandigarh', coords: [30.7333, 76.7794], state: 'Haryana' },
  { name: 'Faridabad', coords: [28.4089, 77.3178], state: 'Haryana' },
  { name: 'Gurgaon', coords: [28.4595, 77.0266], state: 'Haryana' },
  { name: 'Rohtak', coords: [28.8955, 76.6066], state: 'Haryana' },
  { name: 'Hisar', coords: [29.1492, 75.7217], state: 'Haryana' },
  { name: 'Panipat', coords: [29.3909, 76.9635], state: 'Haryana' },
  
  // Himachal Pradesh
  { name: 'Shimla', coords: [31.1048, 77.1734], state: 'Himachal Pradesh' },
  { name: 'Dharamshala', coords: [32.2160, 76.3197], state: 'Himachal Pradesh' },
  { name: 'Mandi', coords: [31.7080, 76.9318], state: 'Himachal Pradesh' },
  { name: 'Solan', coords: [30.9045, 77.0967], state: 'Himachal Pradesh' },
  { name: 'Kullu', coords: [31.9592, 77.1089], state: 'Himachal Pradesh' },
  
  // Jharkhand
  { name: 'Ranchi', coords: [23.3441, 85.3096], state: 'Jharkhand' },
  { name: 'Jamshedpur', coords: [22.8046, 86.2029], state: 'Jharkhand' },
  { name: 'Dhanbad', coords: [23.7957, 86.4304], state: 'Jharkhand' },
  { name: 'Bokaro', coords: [23.6693, 86.1511], state: 'Jharkhand' },
  
  // Karnataka
  { name: 'Mysore', coords: [12.2958, 76.6394], state: 'Karnataka' },
  { name: 'Mangalore', coords: [12.9141, 74.8560], state: 'Karnataka' },
  { name: 'Hubli-Dharwad', coords: [15.3647, 75.1240], state: 'Karnataka' },
  { name: 'Belgaum', coords: [15.8497, 74.4977], state: 'Karnataka' },
  { name: 'Gulbarga', coords: [17.3297, 76.8343], state: 'Karnataka' },
  
  // Kerala
  { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366], state: 'Kerala' },
  { name: 'Kochi', coords: [9.9312, 76.2673], state: 'Kerala' },
  { name: 'Kozhikode', coords: [11.2588, 75.7804], state: 'Kerala' },
  { name: 'Thrissur', coords: [10.5276, 76.2144], state: 'Kerala' },
  { name: 'Kollam', coords: [8.8932, 76.6141], state: 'Kerala' },
  
  // Madhya Pradesh
  { name: 'Bhopal', coords: [23.2599, 77.4126], state: 'Madhya Pradesh' },
  { name: 'Indore', coords: [22.7196, 75.8577], state: 'Madhya Pradesh' },
  { name: 'Jabalpur', coords: [23.1815, 79.9864], state: 'Madhya Pradesh' },
  { name: 'Gwalior', coords: [26.2183, 78.1828], state: 'Madhya Pradesh' },
  { name: 'Ujjain', coords: [23.1765, 75.7885], state: 'Madhya Pradesh' },
  
  // Maharashtra
  { name: 'Nagpur', coords: [21.1458, 79.0882], state: 'Maharashtra' },
  { name: 'Nashik', coords: [19.9975, 73.7898], state: 'Maharashtra' },
  { name: 'Aurangabad', coords: [19.8762, 75.3433], state: 'Maharashtra' },
  { name: 'Solapur', coords: [17.6599, 75.9064], state: 'Maharashtra' },
  { name: 'Amravati', coords: [20.9320, 77.7523], state: 'Maharashtra' },
  
  // Manipur
  { name: 'Imphal', coords: [24.8170, 93.9368], state: 'Manipur' },
  { name: 'Thoubal', coords: [24.6422, 94.0188], state: 'Manipur' },
  { name: 'Bishnupur', coords: [24.6324, 93.7642], state: 'Manipur' },
  { name: 'Churachandpur', coords: [24.3370, 93.6758], state: 'Manipur' },
  
  // Meghalaya
  { name: 'Shillong', coords: [25.5788, 91.8933], state: 'Meghalaya' },
  { name: 'Tura', coords: [25.5165, 90.2042], state: 'Meghalaya' },
  { name: 'Jowai', coords: [25.4504, 92.1931], state: 'Meghalaya' },
  { name: 'Nongstoin', coords: [25.5192, 91.2661], state: 'Meghalaya' },
  
  // Mizoram
  { name: 'Aizawl', coords: [23.7271, 92.7176], state: 'Mizoram' },
  { name: 'Lunglei', coords: [22.8808, 92.7420], state: 'Mizoram' },
  { name: 'Champhai', coords: [23.4730, 93.3314], state: 'Mizoram' },
  { name: 'Serchhip', coords: [23.3416, 92.8573], state: 'Mizoram' },
  
  // Nagaland
  { name: 'Kohima', coords: [25.6701, 94.1077], state: 'Nagaland' },
  { name: 'Dimapur', coords: [25.9091, 93.7270], state: 'Nagaland' },
  { name: 'Mokokchung', coords: [26.3298, 94.5131], state: 'Nagaland' },
  { name: 'Tuensang', coords: [26.2841, 94.8269], state: 'Nagaland' },
  
  // Odisha
  { name: 'Bhubaneswar', coords: [20.2961, 85.8245], state: 'Odisha' },
  { name: 'Cuttack', coords: [20.4625, 85.8830], state: 'Odisha' },
  { name: 'Rourkela', coords: [22.2604, 84.8536], state: 'Odisha' },
  { name: 'Berhampur', coords: [19.3149, 84.7941], state: 'Odisha' },
  { name: 'Sambalpur', coords: [21.4669, 83.9756], state: 'Odisha' },
  
  // Punjab
  { name: 'Ludhiana', coords: [30.9010, 75.8573], state: 'Punjab' },
  { name: 'Amritsar', coords: [31.6340, 74.8723], state: 'Punjab' },
  { name: 'Jalandhar', coords: [31.3260, 75.5762], state: 'Punjab' },
  { name: 'Patiala', coords: [30.3398, 76.3869], state: 'Punjab' },
  { name: 'Bathinda', coords: [30.2110, 74.9455], state: 'Punjab' },
  
  // Rajasthan
  { name: 'Jodhpur', coords: [26.2389, 73.0243], state: 'Rajasthan' },
  { name: 'Kota', coords: [25.2138, 75.8648], state: 'Rajasthan' },
  { name: 'Bikaner', coords: [28.0229, 73.3119], state: 'Rajasthan' },
  { name: 'Ajmer', coords: [26.4499, 74.6399], state: 'Rajasthan' },
  { name: 'Udaipur', coords: [24.5854, 73.7125], state: 'Rajasthan' },
  
  // Sikkim
  { name: 'Gangtok', coords: [27.3389, 88.6065], state: 'Sikkim' },
  { name: 'Namchi', coords: [27.1675, 88.3636], state: 'Sikkim' },
  { name: 'Gyalshing', coords: [27.2833, 88.2667], state: 'Sikkim' },
  { name: 'Mangan', coords: [27.5075, 88.5322], state: 'Sikkim' },
  
  // Tamil Nadu
  { name: 'Coimbatore', coords: [11.0168, 76.9558], state: 'Tamil Nadu' },
  { name: 'Madurai', coords: [9.9252, 78.1198], state: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', coords: [10.7905, 78.7047], state: 'Tamil Nadu' },
  { name: 'Salem', coords: [11.6643, 78.1460], state: 'Tamil Nadu' },
  { name: 'Tirunelveli', coords: [8.7139, 77.7567], state: 'Tamil Nadu' },
  
  // Telangana
  { name: 'Warangal', coords: [17.9689, 79.5941], state: 'Telangana' },
  { name: 'Nizamabad', coords: [18.6725, 78.0941], state: 'Telangana' },
  { name: 'Karimnagar', coords: [18.4392, 79.1324], state: 'Telangana' },
  { name: 'Khammam', coords: [17.2473, 80.1514], state: 'Telangana' },
  
  // Tripura
  { name: 'Agartala', coords: [23.8315, 91.2868], state: 'Tripura' },
  { name: 'Udaipur', coords: [23.5372, 91.4860], state: 'Tripura' },
  { name: 'Dharmanagar', coords: [24.3780, 92.1993], state: 'Tripura' },
  { name: 'Kailashahar', coords: [24.3322, 92.0048], state: 'Tripura' },
  
  // Uttar Pradesh
  { name: 'Kanpur', coords: [26.4499, 80.3319], state: 'Uttar Pradesh' },
  { name: 'Varanasi', coords: [25.3176, 82.9739], state: 'Uttar Pradesh' },
  { name: 'Agra', coords: [27.1767, 78.0081], state: 'Uttar Pradesh' },
  { name: 'Meerut', coords: [28.9845, 77.7064], state: 'Uttar Pradesh' },
  { name: 'Prayagraj', coords: [25.4358, 81.8463], state: 'Uttar Pradesh' },
  { name: 'Bareilly', coords: [28.3670, 79.4304], state: 'Uttar Pradesh' },

  // Uttarakhand
  { name: 'Dehradun', coords: [30.3165, 78.0322], state: 'Uttarakhand' },
  { name: 'Haridwar', coords: [29.9457, 78.1642], state: 'Uttarakhand' },
  { name: 'Roorkee', coords: [29.8543, 77.8880], state: 'Uttarakhand' },
  { name: 'Haldwani', coords: [29.2183, 79.5130], state: 'Uttarakhand' },
  { name: 'Nainital', coords: [29.3919, 79.4542], state: 'Uttarakhand' },

  // West Bengal
  { name: 'Durgapur', coords: [23.5204, 87.3119], state: 'West Bengal' },
  { name: 'Asansol', coords: [23.6739, 86.9524], state: 'West Bengal' },
  { name: 'Siliguri', coords: [26.7271, 88.3953], state: 'West Bengal' },
  { name: 'Howrah', coords: [22.5957, 88.2636], state: 'West Bengal' },
  { name: 'Berhampore', coords: [24.1065, 88.2581], state: 'West Bengal' },

  // Union Territories
  { name: 'Puducherry', coords: [11.9416, 79.8083], state: 'Puducherry' },
  { name: 'Jammu', coords: [32.7266, 74.8570], state: 'Jammu & Kashmir' },
  { name: 'Srinagar', coords: [34.0837, 74.7973], state: 'Jammu & Kashmir' },
  { name: 'Port Blair', coords: [11.6234, 92.7265], state: 'Andaman & Nicobar' },
  { name: 'Kavaratti', coords: [10.5593, 72.6358], state: 'Lakshadweep' },
  { name: 'Daman', coords: [20.3974, 72.8328], state: 'Daman & Diu' },
  { name: 'Silvassa', coords: [20.2696, 72.9968], state: 'Dadra & Nagar Haveli' },
  { name: 'Leh', coords: [34.1526, 77.5771], state: 'Ladakh' }
];

/**
 * Gets a list of unique states from the cities array
 * @returns {Array} Array of unique state names
 */
function getUniqueStates() {
  const stateSet = new Set();
  
  cities.forEach(city => {
    if (city.state) {
      stateSet.add(city.state);
    }
  });
  
  return Array.from(stateSet).sort();
}

/**
 * Gets cities belonging to a specific state
 * @param {string} stateName - The name of the state to filter by
 * @returns {Array} Array of cities in the specified state
 */
function getCitiesByState(stateId) {
  // If no stateId provided, return all cities
  if (!stateId) return cities;
  
  // Map state IDs to actual state names
  const stateMapping = {
    'delhi': 'Delhi',
    'haryana': 'Haryana',
    'himachal': 'Himachal Pradesh',
    'jammu': 'Jammu & Kashmir',
    'punjab': 'Punjab',
    'uttarakhand': 'Uttarakhand',
    'up': 'Uttar Pradesh',
    'bihar': 'Bihar',
    'jharkhand': 'Jharkhand',
    'odisha': 'Odisha',
    'west-bengal': 'West Bengal',
    'assam': 'Assam',
    'sikkim': 'Sikkim',
    'arunachal': 'Arunachal Pradesh',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram',
    'nagaland': 'Nagaland',
    'tripura': 'Tripura',
    'gujarat': 'Gujarat',
    'maharashtra': 'Maharashtra',
    'goa': 'Goa',
    'rajasthan': 'Rajasthan',
    'chandigarh': 'Chandigarh',
    'daman-diu': 'Daman & Diu',
    'dadra': 'Dadra & Nagar Haveli',
    'lakshadweep': 'Lakshadweep',
    'pondicherry': 'Puducherry',
    'andaman': 'Andaman & Nicobar',
    'ladakh': 'Ladakh',
    'andhra': 'Andhra Pradesh',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'tamil-nadu': 'Tamil Nadu',
    'telangana': 'Telangana',
    'chhattisgarh': 'Chhattisgarh',
    'madhya-pradesh': 'Madhya Pradesh'
  };
  
  // Get the actual state name
  const stateName = stateMapping[stateId];
  
  if (!stateName) return [];
  
  // Filter cities by state name 
  return cities.filter(city => city.state === stateName);
}

// Add global searchLocation function for use with map markers
window.searchLocation = function(locationName) {
  if (!locationName || typeof locationName !== 'string') {
    console.error('Invalid location name provided to searchLocation');
    return;
  }
  
  // Update the search input value if it exists
  let locationSearchInput = document.getElementById('location-search');
  if (locationSearchInput) {
    locationSearchInput.value = locationName;
  } else {
    console.warn('Location search input element not found');
  }
  
  // Trigger comparison
  compareNetworksAction(locationName);
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  // Initialize global locationSearchInput right away to prevent reference errors
  if (locationSearchInput === null || locationSearchInput === undefined) {
    locationSearchInput = document.getElementById('location-search');
  }
  
  // Initialize the page
  initComparePage();
  
  // Set up event listeners for the remove network buttons
  setupRemoveNetworkButtons();
  
  // Set up event listeners for the view details buttons
  setupViewDetailsButtons();
  
  // Check authentication status and update UI
  updateAuthUI();
  
  // Initialize the improved city selection UI
  initializeCitySelectionUI();
  
  // Initialize state item listeners
  initializeStateItemListeners();
});

async function initComparePage() {
  // Initialize the map before doing anything else
  initializeMap();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize location autocomplete
  await initLocationSuggestions();
  
  // Setup state-city browser
  setupStateCityBrowser();
  
  // Initialize tower layers (empty initially)
  towerLayers = {
    jio: L.layerGroup(),
    airtel: L.layerGroup(),
    vi: L.layerGroup()
  };
  
  // Global function for updating map layers
  window.updateMapLayers = function() {
    // Get the selected options
    const networkSelect = document.getElementById('network-select');
    const coverageRadios = document.querySelectorAll('input[name="coverage-type"]');
    
    const selectedNetwork = networkSelect ? networkSelect.value : 'all';
    
    let selectedCoverage = '4g';
    coverageRadios.forEach(radio => {
      if (radio.checked) {
        selectedCoverage = radio.value;
      }
    });
    
    // Remove existing layers
    if (window.networkLayers && typeof window.networkLayers === 'object') {
      Object.values(window.networkLayers).forEach(layer => {
        if (map && layer && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    } else {
      console.warn('Initializing network layers');
      window.networkLayers = {
        jio: L.layerGroup(),
        airtel: L.layerGroup(),
        vi: L.layerGroup()
      };
    }
    
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
      
      // Ensure we have the cities array
      const allCities = cities || [];
      
      // For demo purposes, create coverage circles for each city
      allCities.forEach(city => {
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
        if (window.networkLayers && window.networkLayers[network]) {
          window.networkLayers[network].addLayer(circle);
          if (map) {
            map.addLayer(window.networkLayers[network]);
          }
        } else {
          console.warn(`Network layer "${network}" not initialized`);
          
          // Initialize the layer if it doesn't exist
          window.networkLayers[network] = L.layerGroup();
          window.networkLayers[network].addLayer(circle);
          if (map) {
            map.addLayer(window.networkLayers[network]);
          }
        }
      });
    }
    
    // After updating layers, ensure correct z-index and positioning
    if (typeof ensureCorrectZIndex === 'function') ensureCorrectZIndex();
    if (typeof positionMapControls === 'function') positionMapControls();
  };
  
  // Initialize with all networks
  setTimeout(() => {
    if (typeof window.updateMapLayers === 'function') {
      window.updateMapLayers();
    }
  }, 500);
  
  // Set initial z-index and positions for map elements
  setTimeout(function() {
    if (typeof ensureCorrectZIndex === 'function') ensureCorrectZIndex();
    if (typeof positionMapControls === 'function') positionMapControls();
    if (typeof manageLayers === 'function') manageLayers();
  }, 500);
  
  // Set up the view details buttons after initialization
  setTimeout(function() {
    setupViewDetailsButtons();
  }, 1500);
}

/**
 * Initializes the map with default settings
 */
function initializeMap() {
  console.log('Initializing map...');
  
  // Check if map already exists
  if (window.map || map) {
    console.log('Map already initialized');
    if (!map && window.map) {
      map = window.map;
    }
    return;
  }
  
  // Create the map container if it doesn't exist
  let mapContainer = document.getElementById('coverage-map');
  if (!mapContainer) {
    console.log('Map container not found, creating one');
    mapContainer = document.createElement('div');
    mapContainer.id = 'coverage-map';
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
      mapSection.appendChild(mapContainer);
    } else {
      const comparisonSection = document.querySelector('.comparison-results-section');
      if (comparisonSection) {
        const mapWrapper = document.createElement('div');
        mapWrapper.className = 'map-section';
        mapWrapper.appendChild(mapContainer);
        comparisonSection.prepend(mapWrapper);
      } else {
        document.body.appendChild(mapContainer);
      }
    }
  }
  
  // Set map dimensions if not already set by CSS
  if (mapContainer.clientHeight < 200) {
    mapContainer.style.height = '500px';
  }
  if (mapContainer.clientWidth < 200) {
    mapContainer.style.width = '100%';
  }
  
  // Initialize the map with Leaflet
  try {
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded');
      showNotification('Map library not loaded properly. Please refresh the page.', 'error');
      return;
    }
    
    // Create the map with India as the default center
    map = L.map('coverage-map').setView([22.5726, 78.9629], 5);
    
    // Save reference to global scope
    window.map = map;
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Add the scale control
    L.control.scale().addTo(map);
    
    // Initialize network layers
    networkLayers = {
      jio: L.layerGroup().addTo(map),
      airtel: L.layerGroup().addTo(map),
      vi: L.layerGroup().addTo(map)
    };
    
    // Make sure window.networkLayers is also set
    window.networkLayers = networkLayers;
    
    console.log('Map successfully initialized');
    
  } catch (error) {
    console.error('Error initializing map:', error);
    showNotification('Error initializing map. Please refresh the page.', 'error');
  }
}

/**
 * Initiates a network comparison for a given location
 * 
 * @param {string} locationName - The name of the location to compare networks for
 * @param {string} stateName - Optional state name for better context
 */
function compareNetworksAction(locationName, stateName = null) {
  // Validate inputs
  if (!locationName || typeof locationName !== 'string') {
    console.error('Invalid location name provided to compareNetworksAction');
    showNotification('Please provide a valid location name', 'error');
    return;
  }

  // Show loading state
  const compareBtn = document.getElementById('compare-btn');
  const originalBtnText = compareBtn ? compareBtn.innerHTML : 'Compare';
  if (compareBtn) {
    compareBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Comparing...`;
    compareBtn.disabled = true;
  }
  
  // If we have a stateName and it wasn't already part of the location, add it for context
  const fullLocationName = stateName && !locationName.includes(stateName) 
    ? `${locationName}, ${stateName}` 
    : locationName;
  
  // Update the UI to show we're comparing networks
  updateLocationDisplay(fullLocationName);
  
  // Scroll to the results section
  const resultsSection = document.querySelector('.comparison-results-section');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Update the coverage results
  updateCoverageResults(locationName)
    .then(() => {
      // Restore the button state
      if (compareBtn) {
        compareBtn.innerHTML = originalBtnText;
        compareBtn.disabled = false;
      }
    })
    .catch(error => {
      console.error('Error comparing networks:', error);
      showNotification('Failed to compare networks. Using fallback data.', 'warning');
      
      // Use fallback data
      const fallbackData = getFallbackNetworkData(locationName);
      updateDetailedComparisonTable(fallbackData);
      
      // Restore the button state
      if (compareBtn) {
        compareBtn.innerHTML = originalBtnText;
        compareBtn.disabled = false;
      }
    });
}

/**
 * Updates the coverage results for a given location
 * 
 * @param {string} locationName - The name of the location to get coverage for
 * @returns {Promise} - A promise that resolves when coverage data has been updated
 */
async function updateCoverageResults(locationName) {
  try {
    // Validate locationName
    if (!locationName || typeof locationName !== 'string') {
      console.error('Invalid location name provided to updateCoverageResults');
      locationName = 'Current Location';
    }
    
    // Use fallback data if API not available
    const fallbackData = getFallbackNetworkData(locationName);
    
    // Ensure fallbackData is an array before using it
    if (Array.isArray(fallbackData)) {
      updateDetailedComparisonTable(fallbackData);
      updateMapWithCoverageData(fallbackData);
      
      showNotification(`Network comparison for ${locationName} updated successfully`, 'success');
      return fallbackData;
    } else {
      console.error('Expected array from getFallbackNetworkData but got:', typeof fallbackData);
      // Create a minimal valid array to avoid errors
      const emptyData = [
        { operator: 'jio', coverageType: '4G' },
        { operator: 'airtel', coverageType: '4G' },
        { operator: 'vi', coverageType: '4G' }
      ];
      updateDetailedComparisonTable(emptyData);
      updateMapWithCoverageData(emptyData);
      
      showNotification(`Network comparison for ${locationName} completed with limited data`, 'warning');
      return emptyData;
    }
  } catch (error) {
    console.error('Error in updateCoverageResults:', error);
    
    // Create a minimal valid array to recover from errors
    const emptyData = [
      { operator: 'jio', coverageType: '4G' },
      { operator: 'airtel', coverageType: '4G' },
      { operator: 'vi', coverageType: '4G' }
    ];
    
    try {
      updateDetailedComparisonTable(emptyData);
      updateMapWithCoverageData(emptyData);
    } catch (e) {
      console.error('Error handling recovery:', e);
    }
    
    throw error;
  }
}

/**
 * Updates the map with coverage data
 * @param {Array} coverageData - Array of operator coverage data
 */
function updateMapWithCoverageData(coverageData) {
  if (!map) {
    console.error('Map not initialized');
    return;
  }
  
  // Clear existing layers
  if (window.networkLayers && typeof window.networkLayers === 'object') {
    Object.values(window.networkLayers).forEach(layer => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
  } else {
    // Initialize network layers if they don't exist
    window.networkLayers = {
      jio: L.layerGroup(),
      airtel: L.layerGroup(),
      vi: L.layerGroup()
    };
  }
  
  // Verify coverageData is valid before attempting to iterate
  if (!coverageData) {
    console.warn('No coverage data provided to updateMapWithCoverageData');
    return;
  }
  
  // Ensure coverageData is an array
  if (!Array.isArray(coverageData)) {
    console.error('Expected array for coverageData but got:', typeof coverageData);
    return;
  }
  
  // Add new layers for each network
  if (coverageData.length > 0) {
    coverageData.forEach(network => {
      if (network && network.operator) {
        // Check if we can access the global function
        if (typeof window.addCoverageForNetwork === 'function') {
          window.addCoverageForNetwork(
            network.operator, 
            network.coverageType || '4G', 
            0.7
          );
        } else if (typeof addCoverageForNetwork === 'function') {
          // Try the local function if global isn't available
          addCoverageForNetwork(
            network.operator, 
            network.coverageType || '4G', 
            0.7
          );
        } else {
          console.warn('addCoverageForNetwork function not found');
        }
      } else {
        console.warn('Invalid network object in coverageData:', network);
      }
    });
  } else {
    console.warn('Empty coverage data array to display on map');
  }
}

// Helper function to get fallback network data
function getFallbackNetworkData(location) {
  try {
    if (!location || typeof location !== 'string') {
      console.warn('Invalid location provided to getFallbackNetworkData');
      location = 'Default Location';
    }
    
    const locationSeed = location.charCodeAt(0) + location.length;
    
    // Calculate ratings
    const jioRating = Math.min(100, 85 + (locationSeed % 10));
    const airtelRating = Math.min(100, 88 + (locationSeed % 8));
    const viRating = Math.min(100, 78 + (locationSeed % 12));
    
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
    
    // Convert the fallback data to the expected array format for coverageData.forEach
    const fallbackDataArray = [
      { 
        operator: 'jio', 
        coverageType: '4G', 
        '4g_coverage': jio4gCoverage,
        '5g_coverage': jio5gCoverage,
        'download_speed': jioDownloadSpeed,
        'upload_speed': jioUploadSpeed,
        'call_quality': jioCallQuality,
        'indoor_reception': jioIndoorReception,
        'congestion': jioCongestion,
        'satisfaction': jioSatisfaction
      },
      { 
        operator: 'airtel', 
        coverageType: '4G', 
        '4g_coverage': airtel4gCoverage,
        '5g_coverage': airtel5gCoverage,
        'download_speed': airtelDownloadSpeed,
        'upload_speed': airtelUploadSpeed,
        'call_quality': airtelCallQuality,
        'indoor_reception': airtelIndoorReception,
        'congestion': airtelCongestion,
        'satisfaction': airtelSatisfaction
      },
      { 
        operator: 'vi', 
        coverageType: '4G', 
        '4g_coverage': vi4gCoverage,
        '5g_coverage': vi5gCoverage,
        'download_speed': viDownloadSpeed,
        'upload_speed': viUploadSpeed,
        'call_quality': viCallQuality,
        'indoor_reception': viIndoorReception,
        'congestion': viCongestion,
        'satisfaction': viSatisfaction
      }
    ];
    
    console.log('Generated fallback network data array:', fallbackDataArray);
    return fallbackDataArray;
  } catch (error) {
    console.error('Error generating fallback network data:', error);
    // Return a minimal valid array to avoid further errors
    return [
      { operator: 'jio', coverageType: '4G' },
      { operator: 'airtel', coverageType: '4G' },
      { operator: 'vi', coverageType: '4G' }
    ];
  }
}

// Properly implement event listeners instead of the stub function
function setupEventListeners() {
  console.log('Setting up event listeners');
  
  // Initialize the locationSearchInput variable - using let to make it clear this is initializing the global variable
  locationSearchInput = document.getElementById('location-search');
  console.log('Location search input found:', locationSearchInput ? 'yes' : 'no');
  
  // Set up location search input event listeners
  if (locationSearchInput) {
    // Handle Enter key press
    locationSearchInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const location = locationSearchInput.value.trim();
        if (location) {
          compareNetworksAction(location);
        } else {
          showNotification('Please enter a location', 'warning');
        }
      }
    });
  } else {
    console.warn('Location search input not found, some functionality will be limited.');
  }
  
  // Set up location search button click
  const locationSearchBtn = document.getElementById('location-search-btn');
  if (locationSearchBtn) {
    locationSearchBtn.addEventListener('click', function() {
      // Get the input element again in case it wasn't available earlier
      const searchInput = locationSearchInput || document.getElementById('location-search');
      const location = searchInput ? searchInput.value.trim() : '';
      if (location) {
        compareNetworksAction(location);
      } else {
        showNotification('Please enter a location', 'warning');
      }
    });
  }
  
  // Set up compare button click
  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', function() {
      // Check if we have a location from either the search input or state/city selectors
      // Get the input element again in case it wasn't available earlier
      const searchInput = locationSearchInput || document.getElementById('location-search');
      const location = searchInput ? searchInput.value.trim() : '';
      const citySelector = document.getElementById('city-selector');
      const stateSelector = document.getElementById('state-selector');
      
      if (location) {
        compareNetworksAction(location);
      } else if (citySelector && citySelector.value) {
        const city = citySelector.value;
        const state = stateSelector ? stateSelector.value : '';
        compareNetworksAction(city, state);
      } else {
        showNotification('Please enter a location or select a city', 'warning');
      }
    });
  }
  
  // Set up state selector change event
  const stateSelector = document.getElementById('state-selector');
  if (stateSelector) {
    stateSelector.addEventListener('change', function() {
      const selectedState = stateSelector.value;
      updateCitySelector(selectedState);
    });
  }
  
  // Set up city selector change event
  const citySelector = document.getElementById('city-selector');
  if (citySelector) {
    citySelector.addEventListener('change', function() {
      const selectedCity = citySelector.value;
      if (selectedCity) {
        // Get the search input element (it might have changed since setup)
        const searchInput = locationSearchInput || document.getElementById('location-search');
        if (searchInput) {
          searchInput.value = selectedCity;
        }
      }
    });
  }
  
  // Set up user location button
  const userLocationBtn = document.getElementById('user-location-btn');
  if (userLocationBtn) {
    userLocationBtn.addEventListener('click', function() {
      // Add loading class to button
      userLocationBtn.classList.add('loading');
      
      // Use browser geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            // Success callback
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userCoordinates = [lat, lng];
            
            // Reverse geocode to get location name
            reverseGeocode(lat, lng)
              .then(locationName => {
                // Get the location search input element (it might have changed since setup)
                const searchInput = locationSearchInput || document.getElementById('location-search');
                if (searchInput) {
                  searchInput.value = locationName;
                }
                // Fly to location on map
                if (map) {
                  map.flyTo([lat, lng], 9);
                }
                compareNetworksAction(locationName);
              })
              .catch(error => {
                console.error('Error getting location name:', error);
                showNotification('Could not determine your location name. Please enter it manually.', 'error');
              })
              .finally(() => {
                // Remove loading class
                userLocationBtn.classList.remove('loading');
              });
          },
          function(error) {
            // Error callback
            console.error('Geolocation error:', error);
            userLocationBtn.classList.remove('loading');
            
            let errorMessage = 'Could not get your location. ';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage += 'Please allow location access or enter location manually.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage += 'Location request timed out.';
                break;
              default:
                errorMessage += 'Unknown error occurred.';
                break;
            }
            
            showNotification(errorMessage, 'error');
          }
        );
      } else {
        userLocationBtn.classList.remove('loading');
        showNotification('Geolocation is not supported by your browser. Please enter location manually.', 'error');
      }
    });
  }
  
  // Set up network selection and coverage type changes
  const networkSelect = document.getElementById('network-select');
  const coverageRadios = document.querySelectorAll('input[name="coverage-type"]');
  
  if (networkSelect) {
    networkSelect.addEventListener('change', function() {
      if (typeof window.updateMapLayers === 'function') {
        window.updateMapLayers();
      }
    });
  }
  
  if (coverageRadios.length > 0) {
    coverageRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (typeof window.updateMapLayers === 'function') {
          window.updateMapLayers();
        }
      });
    });
  }
}

/**
 * Updates the city selector based on the selected state
 * @param {string} state - The selected state name
 */
function updateCitySelector(state) {
  const citySelector = document.getElementById('city-selector');
  if (!citySelector) return;
  
  // Clear current options except the default one
  while (citySelector.options.length > 1) {
    citySelector.remove(1);
  }
  
  // If no state is selected, just return
  if (!state) return;
  
  // Get cities for the selected state
  const citiesForState = getCitiesByState(state);
  
  // Add city options
  citiesForState.forEach(city => {
    const option = document.createElement('option');
    option.value = city.name;
    option.textContent = city.name;
    citySelector.appendChild(option);
  });
  
  // Enable the city selector
  citySelector.disabled = false;
}

/**
 * Reverse geocodes coordinates to get a location name
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Promise resolving to location name
 */
function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    // Simple fallback if geocoding API is not available
    // In a real implementation, you would use a service like Google Maps or Nominatim
    
    // For now, find the closest city in our cities array
    let closestCity = null;
    let closestDistance = Infinity;
    
    cities.forEach(city => {
      const cityLat = city.coords[0];
      const cityLng = city.coords[1];
      
      // Calculate distance using Haversine formula (approximate)
      const R = 6371; // Earth's radius in km
      const dLat = (cityLat - lat) * Math.PI / 180;
      const dLng = (cityLng - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(cityLat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCity = city;
      }
    });
    
    if (closestCity && closestDistance < 50) { // Within 50km
      resolve(closestCity.name);
    } else {
      // If no city is close enough, return coordinates as string
      resolve(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  });
}

/**
 * Initializes location suggestions for the search input
 * @returns {Promise} - Promise that resolves when suggestions are initialized
 */
function initLocationSuggestions() {
  console.log('Initializing location suggestions');
  
  return new Promise((resolve) => {
    const locationInput = document.getElementById('location-search');
    const suggestionsContainer = document.getElementById('location-suggestions');
    
    if (!locationInput || !suggestionsContainer) {
      console.warn('Location search input or suggestions container not found');
      resolve();
      return;
    }
    
    // Create a debounced search function to limit API calls
    const debounce = (func, delay) => {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    };
    
    // Function to show suggestions based on input
    const showSuggestions = debounce(async (query) => {
      if (!query || query.length < 2) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
        return;
      }
      
      try {
        // Filter cities based on query
        const matchingCities = cities.filter(city => 
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          (city.state && city.state.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5); // Limit to 5 results
        
        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        if (matchingCities.length === 0) {
          suggestionsContainer.classList.remove('show');
          return;
        }
        
        // Add matching cities to suggestions
        matchingCities.forEach(city => {
          const suggestionItem = document.createElement('div');
          suggestionItem.className = 'location-suggestion-item';
          suggestionItem.textContent = city.state ? `${city.name}, ${city.state}` : city.name;
          
          // Handle click on suggestion
          suggestionItem.addEventListener('click', () => {
            locationInput.value = city.state ? `${city.name}, ${city.state}` : city.name;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('show');
            
            // Move map to the selected city
            if (map) {
              map.flyTo(city.coords, 9);
            }
          });
          
          suggestionsContainer.appendChild(suggestionItem);
        });
        
        // Show suggestions
        suggestionsContainer.classList.add('show');
      } catch (error) {
        console.error('Error showing suggestions:', error);
      }
    }, 300); // 300ms debounce time
    
    // Set up input event listeners
    locationInput.addEventListener('input', function() {
      const query = this.value.trim();
      showSuggestions(query);
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
      if (!locationInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.classList.remove('show');
      }
    });
    
    // Handle focus on input
    locationInput.addEventListener('focus', function() {
      const query = this.value.trim();
      if (query.length >= 2) {
        showSuggestions(query);
      }
    });
    
    resolve();
  });
}

/**
 * Sets up the state-city browser interface
 */
function setupStateCityBrowser() {
  console.log('Setting up state-city browser');
  
  const stateSelector = document.getElementById('state-selector');
  const citySelector = document.getElementById('city-selector');
  
  if (!stateSelector || !citySelector) {
    console.warn('State or city selector not found');
    return;
  }
  
  // Clear any existing options except the first one
  while (stateSelector.options.length > 1) {
    stateSelector.remove(1);
  }
  
  // Disable city selector initially
  citySelector.disabled = true;
  
  // Get unique states from the cities array
  const states = getUniqueStates();
  
  // Sort states alphabetically
  states.sort();
  
  // Add state options to the selector
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelector.appendChild(option);
  });
}

function updateLocationDisplay(name) {
  console.log('Updating location display:', name);
  const locationDisplay = document.querySelector('.selected-location');
  if (locationDisplay) {
    locationDisplay.textContent = name;
  }
}

function setupRemoveNetworkButtons() {
  console.log('Setting up remove network buttons');
}

function setupViewDetailsButtons() {
  console.log('Setting up view details buttons');
}

function updateAuthUI() {
  console.log('Updating auth UI');
}

function initializeCitySelectionUI() {
  console.log('Initializing city selection UI');
}

function initializeStateItemListeners() {
  console.log('Initializing state item listeners');
}

function showNotification(message, type = 'info', duration = 3000) {
  console.log(`Notification (${type}):`, message);
  alert(`${type.toUpperCase()}: ${message}`);
}

function updateDetailedComparisonTable(data) {
  console.log('Updating detailed comparison table with data:', data);
  
  // Ensure data is in the expected format
  if (!data) {
    console.error('No data provided for comparison table');
    data = [];
  }
  
  // Get the comparison table container
  const comparisonTableContainer = document.querySelector('.comparison-table-container');
  if (!comparisonTableContainer) {
    console.error('Comparison table container not found');
    return;
  }
  
  // For now, just display the data in a pre element
  let preElement = comparisonTableContainer.querySelector('pre');
  if (!preElement) {
    preElement = document.createElement('pre');
    comparisonTableContainer.appendChild(preElement);
  }
  
  preElement.textContent = JSON.stringify(data, null, 2);
  preElement.style.maxHeight = '300px';
  preElement.style.overflow = 'auto';
  
  // Make the container visible
  comparisonTableContainer.style.display = 'block';
}
