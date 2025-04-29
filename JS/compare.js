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

// Global initialization flag to prevent multiple inits
let hasInitialized = false;

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
  
  // Always get a fresh reference to the input element to avoid stale references
  const searchInput = document.getElementById('location-search');
  if (searchInput) {
    searchInput.value = locationName;
  } else {
    console.warn('Location search input element not found');
  }
  
  // Trigger comparison
  compareNetworksAction(locationName);
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  // Check if already initialized to prevent duplicate initialization
  if (hasInitialized) {
    console.log('Page already initialized, skipping initialization');
    return;
  }
  
  console.log('Starting page initialization');
  
  // Mark as initialized immediately to prevent any duplicate initialization attempts
  hasInitialized = true;
  
  try {
    // Initialize global locationSearchInput right away to prevent reference errors
    locationSearchInput = document.getElementById('location-search');
    
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
  } catch (error) {
    console.error('Error during page initialization:', error);
    showNotification('Error initializing page. Please refresh and try again.', 'error');
  }
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
  
  // Use existing tower layers or initialize if they don't exist
  if (!towerLayers) {
    towerLayers = {
      jio: L.layerGroup(),
      airtel: L.layerGroup(),
      vi: L.layerGroup()
    };
  }
  
  // Store the original updateMapLayers function from HTML if it exists
  const originalUpdateMapLayers = window.updateMapLayers;
  
  // Define our version of the function that works with the compare.js logic
  const ourUpdateMapLayers = function() {
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
    
    // Remove existing layers by clearing them rather than removing from map
    if (window.networkLayers && typeof window.networkLayers === 'object') {
      Object.values(window.networkLayers).forEach(layer => {
        if (map && layer) {
          layer.clearLayers();
        }
      });
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
      const allCities = window.cities || cities || [];
      
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
        }
      });
    }
    
    // Call the original function if it exists and is not our function
    if (typeof originalUpdateMapLayers === 'function' && originalUpdateMapLayers !== window.updateMapLayers) {
      try {
        originalUpdateMapLayers();
      } catch (e) {
        console.warn('Error calling original updateMapLayers function:', e);
      }
    }
  };
  
  // Register our function without overriding if it already exists
  if (!window.updateMapLayers) {
    window.updateMapLayers = ourUpdateMapLayers;
  } else {
    // If it exists, augment it to ensure our functionality works
    const existingFunction = window.updateMapLayers;
    window.updateMapLayers = function() {
      ourUpdateMapLayers();
      
      try {
        // Call the original HTML function if it's not our function
        if (existingFunction !== ourUpdateMapLayers) {
          existingFunction();
        }
      } catch (e) {
        console.warn('Error calling existing updateMapLayers function:', e);
      }
    };
  }
  
  // Initialize with all networks
  setTimeout(() => {
    if (typeof window.updateMapLayers === 'function') {
      window.updateMapLayers();
    }
  }, 500);
  
  // Set up the view details buttons after initialization
  setTimeout(function() {
    setupViewDetailsButtons();
  }, 1500);
}

/**
 * Initializes the map with default settings by linking to the map created in HTML
 */
function initializeMap() {
  console.log('Linking to the map initialized in HTML...');
  
  try {
    // Simply use the map that was already created in the HTML
    if (window.coverageMap) {
      console.log('Found existing coverageMap in window, using it');
      map = window.coverageMap;
      window.map = map; // For consistency with our code
      
      // Get the network layers that were already created in the HTML
      networkLayers = window.networkLayers;
      
      console.log('Successfully linked to map from HTML');
    } else {
      // If we can't find the map, log an error
      console.error('Could not find coverageMap created in HTML');
      showNotification('Map initialization issue detected. Please refresh the page.', 'error');
    }
  } catch (error) {
    console.error('Error during map initialization:', error);
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
  
  // Find coordinates for this location
  findLocationCoordinates(locationName)
    .then(coords => {
      // Store coordinates for tower visualization
      userCoordinates = coords;
      
      // Move the map to the location
      if (map) {
        map.flyTo(coords, 10);
        
        // Add a marker for the selected location if it doesn't exist yet
        if (userLocationMarker) {
          userLocationMarker.setLatLng(coords);
        } else {
          userLocationMarker = L.marker(coords, {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div class="location-pin"></div>',
              iconSize: [30, 30],
              iconAnchor: [15, 30]
            })
          }).addTo(map);
        }
      }
    })
    .catch(error => {
      console.error('Error finding coordinates for location:', error);
      
      // If we have the cities array, try to find the location there
      const city = (window.cities || cities || []).find(
        c => c.name.toLowerCase() === locationName.toLowerCase() ||
             (c.name.toLowerCase() + ', ' + c.state?.toLowerCase() === locationName.toLowerCase())
      );
      
      if (city && city.coords) {
        userCoordinates = city.coords;
        
        // Move the map to the location
        if (map) {
          map.flyTo(city.coords, 10);
          
          // Add a marker for the selected location if it doesn't exist yet
          if (userLocationMarker) {
            userLocationMarker.setLatLng(city.coords);
          } else {
            userLocationMarker = L.marker(city.coords, {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div class="location-pin"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              })
            }).addTo(map);
          }
        }
      } else {
        // Could not find coordinates
        showNotification('Could not find coordinates for this location. Network coverage may not be accurate.', 'warning');
      }
    });
  
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
 * Finds coordinates for a location by name
 * @param {string} locationName - The name of the location
 * @returns {Promise<Array>} - Promise resolving to [lat, lng] array
 */
async function findLocationCoordinates(locationName) {
  try {
    // First check if we have this location in our cities array
    const city = (window.cities || cities || []).find(
      c => c.name.toLowerCase() === locationName.toLowerCase() ||
           (c.name.toLowerCase() + ', ' + c.state?.toLowerCase() === locationName.toLowerCase())
    );
    
    if (city && city.coords) {
      return city.coords;
    }
    
    // If we have access to the API client, try to use its geolocation function
    if (window.PortMySimAPI && typeof window.PortMySimAPI.getCoordinates === 'function') {
      const coords = await window.PortMySimAPI.getCoordinates(locationName);
      if (coords && coords.lat && coords.lng) {
        return [coords.lat, coords.lng];
      }
    }
    
    // Fallback to a simple lookup for Indian cities
    // In a real app, you would use a geocoding service like Google Maps or Nominatim
    
    // Delhi
    if (/delhi|new delhi/i.test(locationName)) {
      return [28.7041, 77.1025];
    }
    // Mumbai
    else if (/mumbai|bombay/i.test(locationName)) {
      return [19.0760, 72.8777];
    }
    // Bangalore
    else if (/bangalore|bengaluru/i.test(locationName)) {
      return [12.9716, 77.5946];
    }
    // Chennai
    else if (/chennai|madras/i.test(locationName)) {
      return [13.0827, 80.2707];
    }
    // Kolkata
    else if (/kolkata|calcutta/i.test(locationName)) {
      return [22.5726, 88.3639];
    }
    // Hyderabad
    else if (/hyderabad/i.test(locationName)) {
      return [17.3850, 78.4867];
    }
    // Pune
    else if (/pune/i.test(locationName)) {
      return [18.5204, 73.8567];
    }
    // Default to center of India
    throw new Error('Location not found in database');
  } catch (error) {
    console.error('Error finding coordinates:', error);
    throw error;
  }
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
  // First, ensure we have the correct map instance
  if (!map && window.coverageMap) {
    map = window.coverageMap;
  }
  
  if (!map) {
    console.error('No valid map instance available');
    return;
  }
  
  // Ensure network layers are properly initialized
  if (!window.networkLayers) {
    window.networkLayers = {
      jio: L.layerGroup().addTo(map),
      airtel: L.layerGroup().addTo(map),
      vi: L.layerGroup().addTo(map)
    };
  }
  
  // Set local reference to the global layers
  networkLayers = window.networkLayers;
  
  // Clear existing layers
  Object.values(networkLayers).forEach(layer => {
    if (layer && map.hasLayer(layer)) {
      layer.clearLayers();
    }
  });
  
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
    const coverageColors = {
      jio: '#E53935',    // Bright red for Jio
      airtel: '#1E88E5', // Blue for Airtel
      vi: '#7B1FA2',     // Purple for Vi
    };
    
    // Local implementation of addCoverageForNetwork
    function addCoverageForNetwork(network, coverageType, opacity) {
      const color = coverageColors[network];
      if (!color) return;
      
      // Ensure we have the cities array
      const allCities = window.cities || cities || [];
      
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
        if (networkLayers[network]) {
          networkLayers[network].addLayer(circle);
        }
      });
    }
    
    // Process the coverage data
    coverageData.forEach(network => {
      if (network && network.operator) {
        addCoverageForNetwork(
          network.operator, 
          network.coverageType || '4G', 
          0.7
        );
      }
    });
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
  
  // Get a fresh reference to the search input element and update the global variable
  const searchInput = document.getElementById('location-search');
  locationSearchInput = searchInput; // Update global reference
  console.log('Location search input found:', searchInput ? 'yes' : 'no');
  
  // Set up location search input event listeners
  if (searchInput) {
    // Handle Enter key press
    searchInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const location = searchInput.value.trim();
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
      // Always get a fresh reference to the input element
      const currentSearchInput = document.getElementById('location-search');
      const location = currentSearchInput ? currentSearchInput.value.trim() : '';
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
      // Always get a fresh reference to the input element
      const currentSearchInput = document.getElementById('location-search');
      const location = currentSearchInput ? currentSearchInput.value.trim() : '';
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
  
  // Set up show towers checkbox
  const showTowersCheckbox = document.getElementById('show-towers');
  if (showTowersCheckbox) {
    showTowersCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      toggleTowerVisualization(isChecked);
    });
  }
  
  // Set up tower radius slider
  const towerRadiusSlider = document.getElementById('tower-radius');
  const radiusValueDisplay = document.getElementById('radius-value');
  
  if (towerRadiusSlider) {
    towerRadiusSlider.addEventListener('input', function() {
      const radius = this.value;
      if (radiusValueDisplay) {
        radiusValueDisplay.textContent = `${radius} km`;
      }
      
      // If towers are currently visible, update them with the new radius
      const showTowersCheckbox = document.getElementById('show-towers');
      if (showTowersCheckbox && showTowersCheckbox.checked) {
        toggleTowerVisualization(true, radius);
      }
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
    // Always get a fresh reference to the input element
    const locationInput = document.getElementById('location-search');
    locationSearchInput = locationInput; // Update global reference
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
  
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' :
                         type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close"><i class="fas fa-times"></i></button>
  `;
  
  // Apply styles
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.margin = '10px 0';
  toast.style.padding = '12px 16px';
  toast.style.backgroundColor = type === 'success' ? '#4CAF50' :
                               type === 'error' ? '#F44336' :
                               type === 'warning' ? '#FF9800' : '#2196F3';
  toast.style.color = '#fff';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  toast.style.cursor = 'default';
  
  // Style icon and message
  const toastIcon = toast.querySelector('.toast-icon');
  toastIcon.style.marginRight = '10px';
  
  const toastMessage = toast.querySelector('.toast-message');
  toastMessage.style.flex = '1';
  
  // Style close button
  const closeButton = toast.querySelector('.toast-close');
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = '#fff';
  closeButton.style.marginLeft = 'auto';
  closeButton.style.cursor = 'pointer';
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Show toast with animation
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Close button handler
  closeButton.addEventListener('click', () => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  });
  
  // Auto close after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }
  }, duration);
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
  
  // Get the table element
  const comparisonTable = comparisonTableContainer.querySelector('table');
  if (!comparisonTable) {
    console.error('Comparison table element not found');
    return;
  }
  
  // Get the table body where we'll update the rows
  const tableBody = comparisonTable.querySelector('tbody');
  if (!tableBody) {
    console.error('Table body not found');
    return;
  }
  
  // Clear any pre elements we might have added for debugging
  const preElement = comparisonTableContainer.querySelector('pre');
  if (preElement) {
    preElement.remove();
  }
  
  // Extract data for each operator
  const jioData = data.find(item => item.operator === 'jio') || {};
  const airtelData = data.find(item => item.operator === 'airtel') || {};
  const viData = data.find(item => item.operator === 'vi') || {};
  
  // Helper function to find the best value in a row and add 'best' class
  const markBestValue = (row, values) => {
    // Find the maximum value
    const maxValue = Math.max(...values.filter(v => !isNaN(parseFloat(v))));
    
    // Mark the cell with the max value
    values.forEach((value, index) => {
      const cell = row.children[index + 1]; // +1 to skip the first cell (feature name)
      if (cell && parseFloat(value) === maxValue) {
        cell.classList.add('best');
      } else if (cell) {
        cell.classList.remove('best');
      }
    });
  };
  
  // Update 4G Coverage row
  const fourGRow = tableBody.rows[0];
  if (fourGRow) {
    const jioValue = jioData['4g_coverage'] || 0;
    const airtelValue = airtelData['4g_coverage'] || 0;
    const viValue = viData['4g_coverage'] || 0;
    
    fourGRow.children[1].textContent = `${jioValue}%`;
    fourGRow.children[2].textContent = `${airtelValue}%`;
    fourGRow.children[3].textContent = `${viValue}%`;
    
    markBestValue(fourGRow, [jioValue, airtelValue, viValue]);
  }
  
  // Update 5G Coverage row
  const fiveGRow = tableBody.rows[1];
  if (fiveGRow) {
    const jioValue = jioData['5g_coverage'] || 0;
    const airtelValue = airtelData['5g_coverage'] || 0;
    const viValue = viData['5g_coverage'] || 0;
    
    fiveGRow.children[1].textContent = `${jioValue}%`;
    fiveGRow.children[2].textContent = `${airtelValue}%`;
    fiveGRow.children[3].textContent = `${viValue}%`;
    
    markBestValue(fiveGRow, [jioValue, airtelValue, viValue]);
  }
  
  // Update Download Speed row
  const downloadRow = tableBody.rows[2];
  if (downloadRow) {
    const jioValue = jioData['download_speed'] || 0;
    const airtelValue = airtelData['download_speed'] || 0;
    const viValue = viData['download_speed'] || 0;
    
    downloadRow.children[1].textContent = `${jioValue} Mbps`;
    downloadRow.children[2].textContent = `${airtelValue} Mbps`;
    downloadRow.children[3].textContent = `${viValue} Mbps`;
    
    markBestValue(downloadRow, [jioValue, airtelValue, viValue]);
  }
  
  // Update Upload Speed row
  const uploadRow = tableBody.rows[3];
  if (uploadRow) {
    const jioValue = jioData['upload_speed'] || 0;
    const airtelValue = airtelData['upload_speed'] || 0;
    const viValue = viData['upload_speed'] || 0;
    
    uploadRow.children[1].textContent = `${jioValue} Mbps`;
    uploadRow.children[2].textContent = `${airtelValue} Mbps`;
    uploadRow.children[3].textContent = `${viValue} Mbps`;
    
    markBestValue(uploadRow, [jioValue, airtelValue, viValue]);
  }
  
  // Update Call Quality row
  const callQualityRow = tableBody.rows[4];
  if (callQualityRow) {
    const jioValue = jioData['call_quality'] || 'Average';
    const airtelValue = airtelData['call_quality'] || 'Average';
    const viValue = viData['call_quality'] || 'Average';
    
    callQualityRow.children[1].textContent = jioValue;
    callQualityRow.children[2].textContent = airtelValue;
    callQualityRow.children[3].textContent = viValue;
    
    // For qualitative values, mark cells with 'Excellent' as best
    callQualityRow.children[1].classList.toggle('best', jioValue === 'Excellent');
    callQualityRow.children[2].classList.toggle('best', airtelValue === 'Excellent');
    callQualityRow.children[3].classList.toggle('best', viValue === 'Excellent');
  }
  
  // Update Indoor Reception row
  const indoorRow = tableBody.rows[5];
  if (indoorRow) {
    const jioValue = jioData['indoor_reception'] || 'Average';
    const airtelValue = airtelData['indoor_reception'] || 'Average';
    const viValue = viData['indoor_reception'] || 'Average';
    
    indoorRow.children[1].textContent = jioValue;
    indoorRow.children[2].textContent = airtelValue;
    indoorRow.children[3].textContent = viValue;
    
    // For qualitative values, mark cells with 'Excellent' as best
    indoorRow.children[1].classList.toggle('best', jioValue === 'Excellent');
    indoorRow.children[2].classList.toggle('best', airtelValue === 'Excellent');
    indoorRow.children[3].classList.toggle('best', viValue === 'Excellent');
  }
  
  // Update Congestion Handling row
  const congestionRow = tableBody.rows[6];
  if (congestionRow) {
    const jioValue = jioData['congestion'] || 'Average';
    const airtelValue = airtelData['congestion'] || 'Average';
    const viValue = viData['congestion'] || 'Average';
    
    congestionRow.children[1].textContent = jioValue;
    congestionRow.children[2].textContent = airtelValue;
    congestionRow.children[3].textContent = viValue;
    
    // For qualitative values, mark cells with 'Excellent' as best
    congestionRow.children[1].classList.toggle('best', jioValue === 'Excellent');
    congestionRow.children[2].classList.toggle('best', airtelValue === 'Excellent');
    congestionRow.children[3].classList.toggle('best', viValue === 'Excellent');
  }
  
  // Update Customer Satisfaction row
  const satisfactionRow = tableBody.rows[7];
  if (satisfactionRow) {
    const jioValue = jioData['satisfaction'] || '0.0';
    const airtelValue = airtelData['satisfaction'] || '0.0';
    const viValue = viData['satisfaction'] || '0.0';
    
    satisfactionRow.children[1].textContent = `${jioValue}/5`;
    satisfactionRow.children[2].textContent = `${airtelValue}/5`;
    satisfactionRow.children[3].textContent = `${viValue}/5`;
    
    markBestValue(satisfactionRow, [jioValue, airtelValue, viValue]);
  }
  
  // Also update the coverage metrics section
  updateCoverageMetrics(data);
  
  // Make the container visible
  comparisonTableContainer.style.display = 'block';
}

/**
 * Updates the coverage metrics in the lower section
 * @param {Array} data - Network data array
 */
function updateCoverageMetrics(data) {
  // Find the coverage metrics container
  const metricsContainer = document.querySelector('.coverage-metrics');
  if (!metricsContainer) {
    return;
  }
  
  // Extract data for each operator
  const jioData = data.find(item => item.operator === 'jio') || {};
  const airtelData = data.find(item => item.operator === 'airtel') || {};
  const viData = data.find(item => item.operator === 'vi') || {};
  
  // Update progress bars
  const metricItems = metricsContainer.querySelectorAll('.metric-item');
  if (metricItems.length >= 6) {
    // Jio 4G Coverage
    updateMetric(metricItems[0], jioData['4g_coverage'] || 0);
    
    // Airtel 4G Coverage
    updateMetric(metricItems[1], airtelData['4g_coverage'] || 0);
    
    // Vi 4G Coverage
    updateMetric(metricItems[2], viData['4g_coverage'] || 0);
    
    // Jio 5G Coverage
    updateMetric(metricItems[3], jioData['5g_coverage'] || 0);
    
    // Airtel 5G Coverage
    updateMetric(metricItems[4], airtelData['5g_coverage'] || 0);
    
    // Vi 5G Coverage
    updateMetric(metricItems[5], viData['5g_coverage'] || 0);
  }
  
  // Update network ranking
  updateNetworkRanking(data);
}

/**
 * Updates a single metric item
 * @param {Element} metricItem - The metric item element
 * @param {number} value - The value to display
 */
function updateMetric(metricItem, value) {
  const progressFill = metricItem.querySelector('.progress-fill');
  const metricValue = metricItem.querySelector('.metric-value');
  
  if (progressFill) {
    progressFill.style.width = `${value}%`;
  }
  
  if (metricValue) {
    metricValue.textContent = `${value}%`;
  }
}

/**
 * Updates the network ranking display
 * @param {Array} data - Network data array
 */
function updateNetworkRanking(data) {
  // Find the ranking container
  const rankingContainer = document.querySelector('.network-ranking');
  if (!rankingContainer) {
    return;
  }
  
  // Calculate overall scores
  const calculateScore = (networkData) => {
    if (!networkData) return 0;
    
    const coverage4g = networkData['4g_coverage'] || 0;
    const coverage5g = networkData['5g_coverage'] || 0;
    const downloadSpeed = networkData['download_speed'] || 0;
    
    // Calculate a weighted score
    return Math.round(
      (coverage4g * 0.3) +
      (coverage5g * 0.3) +
      (downloadSpeed * 1.5)
    );
  };
  
  const jioData = data.find(item => item.operator === 'jio') || {};
  const airtelData = data.find(item => item.operator === 'airtel') || {};
  const viData = data.find(item => item.operator === 'vi') || {};
  
  const jioScore = calculateScore(jioData);
  const airtelScore = calculateScore(airtelData);
  const viScore = calculateScore(viData);
  
  // Sort networks by score
  const rankings = [
    { operator: 'jio', score: jioScore },
    { operator: 'airtel', score: airtelScore },
    { operator: 'vi', score: viScore }
  ].sort((a, b) => b.score - a.score);
  
  // Get the ranking items
  const rankingItems = rankingContainer.querySelectorAll('.ranking-item');
  if (rankingItems.length >= 3) {
    // Update each ranking item
    for (let i = 0; i < 3; i++) {
      const rankItem = rankingItems[i];
      const networkData = rankings[i];
      
      const rankNumber = rankItem.querySelector('.rank-number');
      const rankNetwork = rankItem.querySelector('.rank-network img');
      const rankNetworkName = rankItem.querySelector('.rank-network span');
      const rankScore = rankItem.querySelector('.rank-score');
      
      if (rankNumber) rankNumber.textContent = i + 1;
      
      if (rankNetwork) {
        rankNetwork.src = `../images/${networkData.operator}.${networkData.operator === 'jio' ? 'jpeg' : 'png'}`;
        rankNetwork.alt = networkData.operator.charAt(0).toUpperCase() + networkData.operator.slice(1);
      }
      
      if (rankNetworkName) {
        rankNetworkName.textContent = networkData.operator.charAt(0).toUpperCase() + networkData.operator.slice(1);
      }
      
      if (rankScore) rankScore.textContent = `${networkData.score}/100`;
      
      // Mark the top rank
      rankItem.classList.toggle('top-rank', i === 0);
    }
  }
}

/**
 * Toggles the visibility of network towers on the map
 * @param {boolean} show - Whether to show or hide towers
 * @param {number} radius - Search radius in kilometers
 */
function toggleTowerVisualization(show, radius) {
  console.log('toggleTowerVisualization called:', show, radius);
  
  // Clear existing tower layers
  if (towerLayers) {
    Object.values(towerLayers).forEach(layer => {
      if (layer && typeof layer.clearLayers === 'function') {
        layer.clearLayers();
      }
    });
  }
  
  // If not showing, just return
  if (!show) {
    // Update tower counts to 0
    updateTowerCounts({ jio: 0, airtel: 0, vi: 0 });
    return;
  }
  
  // Ensure we have user coordinates or a selected location
  if (!userCoordinates) {
    showNotification('Please select a location first', 'warning');
    
    // Uncheck the show towers checkbox since we can't show towers yet
    const showTowersCheckbox = document.getElementById('show-towers');
    if (showTowersCheckbox) {
      showTowersCheckbox.checked = false;
    }
    return;
  }
  
  // Get radius from slider if not provided
  const actualRadius = radius || document.getElementById('tower-radius')?.value || 5;
  
  // Show loading state
  showNotification('Fetching nearby towers...', 'info');
  
  // Fetch tower data
  fetchTowerData(userCoordinates[0], userCoordinates[1], actualRadius)
    .then(data => {
      displayTowers(data);
    })
    .catch(error => {
      console.error('Error fetching tower data:', error);
      showNotification('Error fetching tower data. Using sample data.', 'warning');
      
      // Use fallback data
      const fallbackData = generateFallbackTowerData(userCoordinates[0], userCoordinates[1], actualRadius);
      displayTowers(fallbackData);
    });
}

/**
 * Fetches tower data from the API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in kilometers
 * @returns {Promise} - Promise resolving to tower data
 */
async function fetchTowerData(lat, lng, radius) {
  try {
    // If we have access to the API client, use it
    if (window.PortMySimAPI && typeof window.PortMySimAPI.findTowers === 'function') {
      return await window.PortMySimAPI.findTowers({ lat, lng, radius });
    }
    
    // Fall back to using fetch directly
    const response = await fetch(`${API_BASE_URL}/network-coverage/tower-data?lat=${lat}&lng=${lng}&radius=${radius}`);
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tower data:', error);
    throw error;
  }
}

/**
 * Generates fallback tower data when API calls fail
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in kilometers
 * @returns {object} - Fallback tower data
 */
function generateFallbackTowerData(lat, lng, radius) {
  const towers = [];
  const operators = ['jio', 'airtel', 'vi'];
  const towerTypes = ['macro', 'micro', 'small-cell'];
  
  // Generate random number of towers (5-20)
  const towerCount = 5 + Math.floor(Math.random() * 15);
  
  // Helper to get a random element from an array
  const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];
  
  // Helper to get a random coordinate within the radius
  const randomCoordinate = (centerLat, centerLng, radiusKm) => {
    // Earth's radius in kilometers
    const earthRadius = 6371;
    
    // Convert radius from kilometers to radians
    const radiusRadians = radiusKm / earthRadius;
    
    // Random angle
    const randomAngle = Math.random() * 2 * Math.PI;
    
    // Random distance within the radius
    const randomDistance = Math.random() * radiusRadians;
    
    // Calculate new position
    const lat1 = centerLat * (Math.PI / 180);
    const lng1 = centerLng * (Math.PI / 180);
    
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(randomDistance) + 
                 Math.cos(lat1) * Math.sin(randomDistance) * Math.cos(randomAngle));
    
    const lng2 = lng1 + Math.atan2(Math.sin(randomAngle) * Math.sin(randomDistance) * Math.cos(lat1), 
                    Math.cos(randomDistance) - Math.sin(lat1) * Math.sin(lat2));
    
    // Convert back to degrees
    return [lat2 * (180 / Math.PI), lng2 * (180 / Math.PI)];
  };
  
  // Generate towers
  for (let i = 0; i < towerCount; i++) {
    const operator = randomElement(operators);
    const position = randomCoordinate(lat, lng, radius);
    
    towers.push({
      id: `tower-${i}`,
      operator: operator,
      type: randomElement(towerTypes),
      position: position,
      signalStrength: 50 + Math.floor(Math.random() * 50) // 50-100
    });
  }
  
  return { towers };
}

/**
 * Displays towers on the map
 * @param {object} data - Tower data from API or fallback
 */
function displayTowers(data) {
  if (!data || !data.towers || !Array.isArray(data.towers)) {
    console.error('Invalid tower data:', data);
    showNotification('No valid tower data available', 'error');
    return;
  }
  
  // Initialize tower counts
  const towerCounts = {
    jio: 0,
    airtel: 0,
    vi: 0
  };
  
  // Ensure tower layers exist
  if (!towerLayers) {
    towerLayers = {
      jio: L.layerGroup(),
      airtel: L.layerGroup(),
      vi: L.layerGroup()
    };
  }
  
  // Add layer groups to map if they're not already added
  Object.values(towerLayers).forEach(layer => {
    if (map && !map.hasLayer(layer)) {
      map.addLayer(layer);
    }
  });
  
  // Tower colors
  const towerColors = {
    jio: '#E53935',
    airtel: '#1E88E5',
    vi: '#7B1FA2'
  };
  
  // Process each tower
  data.towers.forEach(tower => {
    const { operator, position, signalStrength } = tower;
    
    // Skip if invalid data
    if (!operator || !position || position.length !== 2) return;
    
    // Update tower count
    if (towerCounts.hasOwnProperty(operator)) {
      towerCounts[operator]++;
    }
    
    // Create marker
    const towerIcon = L.divIcon({
      className: `tower-icon ${operator}`,
      html: `<div class="tower ${operator}"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    // Create marker and add to appropriate layer
    const marker = L.marker(position, { icon: towerIcon })
      .bindPopup(`<strong>${operator.toUpperCase()} Tower</strong><br>Signal Strength: ${signalStrength || 'Unknown'}%`);
    
    if (towerLayers[operator]) {
      towerLayers[operator].addLayer(marker);
    }
  });
  
  // Update tower count display in UI
  updateTowerCounts(towerCounts);
  
  // Show success notification
  showNotification(`Displaying ${data.towers.length} nearby towers`, 'success');
}

/**
 * Updates the tower count display in the UI
 * @param {object} counts - Object with counts for each operator
 */
function updateTowerCounts(counts) {
  // Update count elements in the UI
  document.getElementById('jio-tower-count').textContent = counts.jio || 0;
  document.getElementById('airtel-tower-count').textContent = counts.airtel || 0;
  document.getElementById('vi-tower-count').textContent = counts.vi || 0;
}
