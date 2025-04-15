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
let selectedState = null; // For tracking the selected state
let selectedCity = null; // For tracking the selected city
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

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
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

// Initialize all components of the compare page
async function initComparePage() {
  // Set up event listeners
  setupEventListeners();
  
  // The map is already initialized in the inline script
  // We'll just reference it from the global scope
  map = window.coverageMap;
  
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
  
  // Define the updateMapLayers function
  window.updateMapLayers = function() {
    const networkSelect = document.getElementById('network-select');
    const selectedNetwork = networkSelect ? networkSelect.value : 'all';
    
    const coverageTypeRadio = document.querySelector('input[name="coverage-type"]:checked');
    const selectedCoverage = coverageTypeRadio ? coverageTypeRadio.value : '4g';
    
    // Use the global cities variable or create an extended version if we need more cities
    const allCities = window.cities || [];
    
    // Additional cities for coverage if needed
    const additionalCities = [
      // State Capitals and Major Cities (one per state)
      { name: 'Amaravati', coords: [16.5130, 80.5166] },  // Andhra Pradesh
      { name: 'Itanagar', coords: [27.0844, 93.6053] },   // Arunachal Pradesh
      { name: 'Dispur', coords: [26.1433, 91.7898] },     // Assam
      { name: 'Patna', coords: [25.5941, 85.1376] },      // Bihar
      { name: 'Raipur', coords: [21.2514, 81.6296] },     // Chhattisgarh
      { name: 'Panaji', coords: [15.4909, 73.8278] },     // Goa
      { name: 'Gandhinagar', coords: [23.2156, 72.6369] }, // Gujarat
      { name: 'Chandigarh', coords: [30.7333, 76.7794] }, // Haryana & Punjab
      { name: 'Shimla', coords: [31.1048, 77.1734] },     // Himachal Pradesh
      { name: 'Ranchi', coords: [23.3441, 85.3096] },     // Jharkhand
      { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366] }, // Kerala
      { name: 'Bhopal', coords: [23.2599, 77.4126] },     // Madhya Pradesh
      { name: 'Imphal', coords: [24.8170, 93.9368] },     // Manipur
      { name: 'Shillong', coords: [25.5788, 91.8933] },   // Meghalaya
      { name: 'Aizawl', coords: [23.7271, 92.7176] },     // Mizoram
      { name: 'Kohima', coords: [25.6701, 94.1077] },     // Nagaland
      { name: 'Bhubaneswar', coords: [20.2961, 85.8245] }, // Odisha
      { name: 'Gangtok', coords: [27.3389, 88.6065] },    // Sikkim
      { name: 'Agartala', coords: [23.8315, 91.2868] },   // Tripura
      { name: 'Dehradun', coords: [30.3165, 78.0322] },   // Uttarakhand
      
      // Union Territories
      { name: 'Port Blair', coords: [11.6234, 92.7265] }, // Andaman & Nicobar
      { name: 'Daman', coords: [20.3974, 72.8328] },      // Daman & Diu
      { name: 'Silvassa', coords: [20.2696, 72.9968] },   // Dadra & Nagar Haveli
      { name: 'Kavaratti', coords: [10.5593, 72.6358] },  // Lakshadweep
      { name: 'Puducherry', coords: [11.9416, 79.8083] }, // Puducherry
      { name: 'Jammu', coords: [32.7266, 74.8570] },      // Jammu
      { name: 'Srinagar', coords: [34.0837, 74.7973] },   // Kashmir
      { name: 'Leh', coords: [34.1526, 77.5771] }         // Ladakh
    ];
    
    // Merge the city lists if we have additional cities
    const cities = [...allCities, ...additionalCities];
    
    // Remove existing layers
    if (window.networkLayers) {
      Object.values(window.networkLayers).forEach(layer => {
        layer.clearLayers();
      });
    } else {
      console.warn('Network layers not initialized yet');
      return; // Exit the function if layers aren't initialized
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
        if (window.networkLayers && window.networkLayers[network]) {
          window.networkLayers[network].addLayer(circle);
        } else {
          console.warn(`Network layer "${network}" not initialized`);
        }
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

  // Initialize our new state and city selectors
  initializeStateAndCitySelectors();

  // Set up the compare button event
  setupCompareButtonEvent();
  
  // Set up the state-city browser
  setupStateCityBrowser();
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
      { name: 'Tirupati', coords: [13.6288, 79.4192] },
      { name: 'Amaravati', coords: [16.5130, 80.5166] }, // Capital of Andhra Pradesh
      
      // Arunachal Pradesh
      { name: 'Itanagar', coords: [27.0844, 93.6053] }, // Capital
      { name: 'Naharlagun', coords: [27.1036, 93.6962] },
      { name: 'Pasighat', coords: [28.0700, 95.3300] },
      { name: 'Tawang', coords: [27.5859, 91.8588] },
      
      // Assam
      { name: 'Guwahati', coords: [26.1445, 91.7362] },
      { name: 'Silchar', coords: [24.8333, 92.7789] },
      { name: 'Dibrugarh', coords: [27.4728, 94.9120] },
      { name: 'Jorhat', coords: [26.7465, 94.2026] },
      { name: 'Dispur', coords: [26.1433, 91.7898] }, // Capital
      
      // Bihar
      { name: 'Patna', coords: [25.5941, 85.1376] }, // Capital
      { name: 'Gaya', coords: [24.7914, 84.9994] },
      { name: 'Bhagalpur', coords: [25.2425, 86.9842] },
      { name: 'Muzaffarpur', coords: [26.1197, 85.3910] },
      { name: 'Darbhanga', coords: [26.1542, 85.8918] },
      
      // Chhattisgarh
      { name: 'Raipur', coords: [21.2514, 81.6296] }, // Capital
      { name: 'Bhilai', coords: [21.2090, 81.4280] },
      { name: 'Bilaspur', coords: [22.0797, 82.1409] },
      { name: 'Korba', coords: [22.3595, 82.7501] },
      { name: 'Durg', coords: [21.1906, 81.2849] },
      
      // Goa
      { name: 'Panaji', coords: [15.4909, 73.8278] }, // Capital
      { name: 'Margao', coords: [15.2832, 73.9862] },
      { name: 'Vasco da Gama', coords: [15.3981, 73.8113] },
      { name: 'Mapusa', coords: [15.5937, 73.8142] },
      
      // Gujarat
      { name: 'Gandhinagar', coords: [23.2156, 72.6369] }, // Capital
      { name: 'Surat', coords: [21.1702, 72.8311] },
      { name: 'Vadodara', coords: [22.3072, 73.1812] },
      { name: 'Rajkot', coords: [22.2734, 70.7713] },
      { name: 'Bhavnagar', coords: [21.7645, 72.1519] },
      
      // Haryana
      { name: 'Chandigarh', coords: [30.7333, 76.7794] }, // Capital (shared with Punjab)
      { name: 'Faridabad', coords: [28.4089, 77.3178] },
      { name: 'Gurgaon', coords: [28.4595, 77.0266] },
      { name: 'Rohtak', coords: [28.8955, 76.6066] },
      { name: 'Hisar', coords: [29.1492, 75.7217] },
      { name: 'Panipat', coords: [29.3909, 76.9635] },
      
      // Himachal Pradesh
      { name: 'Shimla', coords: [31.1048, 77.1734] }, // Capital
      { name: 'Dharamshala', coords: [32.2160, 76.3197] },
      { name: 'Mandi', coords: [31.7080, 76.9318] },
      { name: 'Solan', coords: [30.9045, 77.0967] },
      { name: 'Kullu', coords: [31.9592, 77.1089] },
      
      // Jharkhand
      { name: 'Ranchi', coords: [23.3441, 85.3096] }, // Capital
      { name: 'Jamshedpur', coords: [22.8046, 86.2029] },
      { name: 'Dhanbad', coords: [23.7957, 86.4304] },
      { name: 'Bokaro', coords: [23.6693, 86.1511] },
      
      // Karnataka
      { name: 'Mysore', coords: [12.2958, 76.6394] },
      { name: 'Mangalore', coords: [12.9141, 74.8560] },
      { name: 'Hubli-Dharwad', coords: [15.3647, 75.1240] },
      { name: 'Belgaum', coords: [15.8497, 74.4977] },
      { name: 'Gulbarga', coords: [17.3297, 76.8343] },
      
      // Kerala
      { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366] }, // Capital
      { name: 'Kochi', coords: [9.9312, 76.2673] },
      { name: 'Kozhikode', coords: [11.2588, 75.7804] },
      { name: 'Thrissur', coords: [10.5276, 76.2144] },
      { name: 'Kollam', coords: [8.8932, 76.6141] },
      
      // Madhya Pradesh
      { name: 'Bhopal', coords: [23.2599, 77.4126] }, // Capital
      { name: 'Indore', coords: [22.7196, 75.8577] },
      { name: 'Jabalpur', coords: [23.1815, 79.9864] },
      { name: 'Gwalior', coords: [26.2183, 78.1828] },
      { name: 'Ujjain', coords: [23.1765, 75.7885] },
      
      // Maharashtra
      { name: 'Nagpur', coords: [21.1458, 79.0882] },
      { name: 'Nashik', coords: [19.9975, 73.7898] },
      { name: 'Aurangabad', coords: [19.8762, 75.3433] },
      { name: 'Solapur', coords: [17.6599, 75.9064] },
      { name: 'Amravati', coords: [20.9320, 77.7523] },
      
      // Manipur
      { name: 'Imphal', coords: [24.8170, 93.9368] }, // Capital
      { name: 'Thoubal', coords: [24.6422, 94.0188] },
      { name: 'Bishnupur', coords: [24.6324, 93.7642] },
      { name: 'Churachandpur', coords: [24.3370, 93.6758] },
      
      // Meghalaya
      { name: 'Shillong', coords: [25.5788, 91.8933] }, // Capital
      { name: 'Tura', coords: [25.5165, 90.2042] },
      { name: 'Jowai', coords: [25.4504, 92.1931] },
      { name: 'Nongstoin', coords: [25.5192, 91.2661] },
      
      // Mizoram
      { name: 'Aizawl', coords: [23.7271, 92.7176] }, // Capital
      { name: 'Lunglei', coords: [22.8808, 92.7420] },
      { name: 'Champhai', coords: [23.4730, 93.3314] },
      { name: 'Serchhip', coords: [23.3416, 92.8573] },
      
      // Nagaland
      { name: 'Kohima', coords: [25.6701, 94.1077] }, // Capital
      { name: 'Dimapur', coords: [25.9091, 93.7270] },
      { name: 'Mokokchung', coords: [26.3298, 94.5131] },
      { name: 'Tuensang', coords: [26.2841, 94.8269] },
      
      // Odisha
      { name: 'Bhubaneswar', coords: [20.2961, 85.8245] }, // Capital
      { name: 'Cuttack', coords: [20.4625, 85.8830] },
      { name: 'Rourkela', coords: [22.2604, 84.8536] },
      { name: 'Berhampur', coords: [19.3149, 84.7941] },
      { name: 'Sambalpur', coords: [21.4669, 83.9756] },
      
      // Punjab
      { name: 'Ludhiana', coords: [30.9010, 75.8573] },
      { name: 'Amritsar', coords: [31.6340, 74.8723] },
      { name: 'Jalandhar', coords: [31.3260, 75.5762] },
      { name: 'Patiala', coords: [30.3398, 76.3869] },
      { name: 'Bathinda', coords: [30.2110, 74.9455] },
      
      // Rajasthan
      { name: 'Jodhpur', coords: [26.2389, 73.0243] },
      { name: 'Kota', coords: [25.2138, 75.8648] },
      { name: 'Bikaner', coords: [28.0229, 73.3119] },
      { name: 'Ajmer', coords: [26.4499, 74.6399] },
      { name: 'Udaipur', coords: [24.5854, 73.7125] },
      
      // Sikkim
      { name: 'Gangtok', coords: [27.3389, 88.6065] }, // Capital
      { name: 'Namchi', coords: [27.1675, 88.3636] },
      { name: 'Gyalshing', coords: [27.2833, 88.2667] },
      { name: 'Mangan', coords: [27.5075, 88.5322] },
      
      // Tamil Nadu
      { name: 'Coimbatore', coords: [11.0168, 76.9558] },
      { name: 'Madurai', coords: [9.9252, 78.1198] },
      { name: 'Tiruchirappalli', coords: [10.7905, 78.7047] },
      { name: 'Salem', coords: [11.6643, 78.1460] },
      { name: 'Tirunelveli', coords: [8.7139, 77.7567] },
      
      // Telangana
      { name: 'Warangal', coords: [17.9689, 79.5941] },
      { name: 'Nizamabad', coords: [18.6725, 78.0941] },
      { name: 'Karimnagar', coords: [18.4392, 79.1324] },
      { name: 'Khammam', coords: [17.2473, 80.1514] },
      
      // Tripura
      { name: 'Agartala', coords: [23.8315, 91.2868] }, // Capital
      { name: 'Udaipur', coords: [23.5372, 91.4860] }, // Tripura Udaipur
      { name: 'Dharmanagar', coords: [24.3780, 92.1993] },
      { name: 'Kailashahar', coords: [24.3322, 92.0048] },
      
      // Uttar Pradesh
      { name: 'Kanpur', coords: [26.4499, 80.3319] },
      { name: 'Varanasi', coords: [25.3176, 82.9739] },
      { name: 'Agra', coords: [27.1767, 78.0081] },
      { name: 'Meerut', coords: [28.9845, 77.7064] },
      { name: 'Prayagraj', coords: [25.4358, 81.8463] },
      { name: 'Bareilly', coords: [28.3670, 79.4304] },

      // Uttarakhand
      { name: 'Dehradun', coords: [30.3165, 78.0322] },
      { name: 'Haridwar', coords: [29.9457, 78.1642] },
      { name: 'Roorkee', coords: [29.8543, 77.8880] },
      { name: 'Haldwani', coords: [29.2183, 79.5130] },
      { name: 'Nainital', coords: [29.3919, 79.4542] },

      // West Bengal
      { name: 'Durgapur', coords: [23.5204, 87.3119] },
      { name: 'Asansol', coords: [23.6739, 86.9524] },
      { name: 'Siliguri', coords: [26.7271, 88.3953] },
      { name: 'Howrah', coords: [22.5957, 88.2636] },
      { name: 'Berhampore', coords: [24.1065, 88.2581] },

      // Union Territories
      { name: 'Puducherry', coords: [11.9416, 79.8083] },
      { name: 'Jammu', coords: [32.7266, 74.8570] },
      { name: 'Srinagar', coords: [34.0837, 74.7973] },
      { name: 'Port Blair', coords: [11.6234, 92.7265] },
      { name: 'Kavaratti', coords: [10.5593, 72.6358] },
      { name: 'Daman', coords: [20.3974, 72.8328] },
      { name: 'Silvassa', coords: [20.2696, 72.9968] },
      { name: 'Leh', coords: [34.1526, 77.5771] }
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

/**
 * Action function triggered when the compare button is clicked
 * Updates the coverage results for the selected location
 * 
 * @param {string} locationName - The name of the location to compare networks for
 * @param {string} stateName - Optional state name for better context
 */
function compareNetworksAction(locationName, stateName = null) {
  // Show loading state
  const compareBtn = document.getElementById('compare-btn');
  const originalBtnText = compareBtn.innerHTML;
  compareBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Comparing...`;
  compareBtn.disabled = true;
  
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
      compareBtn.innerHTML = originalBtnText;
      compareBtn.disabled = false;
    })
    .catch(error => {
      console.error('Error comparing networks:', error);
      showNotification('Failed to compare networks. Please try again.', 'error');
      compareBtn.innerHTML = originalBtnText;
      compareBtn.disabled = false;
    });
}

/**
 * Updates the coverage results for a given location
 * 
 * @param {string} locationName - The name of the location to get coverage for
 * @returns {Promise} - A promise that resolves when coverage data has been updated
 */
function updateCoverageResults(locationName) {
  return new Promise(async (resolve, reject) => {
    try {
      const resultsContainer = document.querySelector('.coverage-results-section');
      if (!resultsContainer) {
        console.error('Results container not found');
        reject(new Error('Results container not found'));
        return;
      }
      
      resultsContainer.classList.add('loading');
      
      // Try to find the location in our data first
      const locationData = cities.find(city => city.name.toLowerCase() === locationName.toLowerCase());
      
      if (locationData) {
        // If we found it in our data, update the map
        if (map) {
          map.setView(locationData.coords, 10);
          updateLocationMarker(locationData.coords);
        }
        
        // Update query parameters in URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('location', locationName);
        
        // Replace current URL with updated parameters
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, '', newUrl);
      }
      
      // Fetch network coverage data from API
      try {
        const response = await fetch(`${API_BASE_URL}/coverage?location=${encodeURIComponent(locationName)}`);
        if (!response.ok) throw new Error('Failed to fetch coverage data');
        
        const coverageData = await response.json();
        
        // Update the comparison table with the coverage data
        updateDetailedComparisonTable(coverageData);
        
        // Visualize the networks on the map
        if (map) {
          // Clear existing layers
          Object.values(networkLayers).forEach(layer => {
            if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          });
          
          // Add new layers for each network
          coverageData.forEach(network => {
            addCoverageForNetwork(network.operator, network.coverageType, 0.7);
          });
          
          // Refresh tower visualization if enabled
          const showTowersCheckbox = document.getElementById('show-towers');
          if (showTowersCheckbox && showTowersCheckbox.checked) {
            await visualizeTowers();
          }
        }
        
        showNotification(`Network comparison for ${locationName} updated successfully`, 'success');
        resultsContainer.classList.remove('loading');
        resolve(coverageData);
      } catch (error) {
        console.error('Error fetching coverage data:', error);
        
        // Use fallback data if API request fails
        const fallbackData = getFallbackNetworkData(locationName);
        updateDetailedComparisonTable(fallbackData);
        
        showNotification('Using simulated data for comparison (API unavailable)', 'warning');
        resultsContainer.classList.remove('loading');
        resolve(fallbackData);
      }
    } catch (error) {
      console.error('Error updating coverage results:', error);
      reject(error);
    }
  });
}

// Function to visualize towers on the map
async function visualizeTowers() {
    // Check if map exists
    if (!map) {
        console.error("Map is not initialized");
        return;
    }
    
    // Clear existing tower layers if any
    if (window.towerLayer) {
        map.removeLayer(window.towerLayer);
    }
    
    // Create a new layer group for towers
    window.towerLayer = L.layerGroup();
    
    // Initialize towerLayers object if it doesn't exist
    if (!window.towerLayers) {
        window.towerLayers = {
            jio: L.layerGroup(),
            airtel: L.layerGroup(),
            vi: L.layerGroup()
        };
    }
    
    // Get values from UI elements
    const towerRadiusSlider = document.getElementById('tower-radius');
    const networkSelect = document.getElementById('network-select');
    const radius = towerRadiusSlider ? parseFloat(towerRadiusSlider.value) : 5;
    const provider = networkSelect ? networkSelect.value : 'jio';
    
    // Get current map center coordinates
    const mapCenter = map.getCenter();
    const lat = mapCenter.lat;
    const lng = mapCenter.lng;
    
    let usedFallback = false;
    let towerData = null;
    let notificationShown = false;
    
    try {
        // Check if we have a location from user input - simplified without citiesData
        const locationName = document.getElementById('location-search')?.value || 'Current Location';
        
        try {
            // Try to get real tower data from API
            towerData = await fetchTowerData(provider, lat, lng, radius);
            
            // If API returned null or empty array, use fallback data
            if (!towerData || towerData.length === 0) {
                console.warn("API returned no tower data, using fallback data");
                towerData = generateFallbackTowerData(lat, lng, radius, provider);
                usedFallback = true;
                
                // Notify user we're using simulated data
                if (!notificationShown) {
                    showNotification(`Using simulated tower data for ${locationName}`, 'warning');
                    notificationShown = true;
                }
            }
        } catch (err) {
            // If API call fails, use fallback data
            console.error("Error fetching tower data:", err);
            towerData = generateFallbackTowerData(lat, lng, radius, provider);
            usedFallback = true;
            
            // Notify user we're using simulated data
            if (!notificationShown) {
                showNotification(`Using simulated tower data for ${locationName}`, 'warning');
                notificationShown = true;
            }
        }
        
        // Create marker for each tower
        if (towerData && towerData.length > 0) {
            towerData.forEach(tower => {
                // Make sure we have valid lat/lng values
                if (!tower.lat || !tower.lng || isNaN(tower.lat) || isNaN(tower.lng)) {
                    // Use latitude/longitude if lat/lng not available
                    if (tower.latitude && tower.longitude) {
                        tower.lat = tower.latitude;
                        tower.lng = tower.longitude;
                    } else {
                        console.warn('Invalid tower coordinates, skipping marker', tower);
                        return; // Skip this tower
                    }
                }
                
                const towerIcon = L.divIcon({
                    html: `<div class="tower"></div>`,
                    className: `tower-icon ${provider.toLowerCase()} ${usedFallback ? 'fallback' : ''}`,
                    iconSize: [20, 20]
                });
                
                const marker = L.marker([tower.lat, tower.lng], { icon: towerIcon }).addTo(window.towerLayer);
                
                // Add popup with tower info
                let popupContent = `<div class="tower-popup">
                    <h4>${provider} Tower ${usedFallback ? '<span class="simulated-label">Simulated</span>' : ''}</h4>
                    <div class="tower-info">
                        <p><strong>ID:</strong> ${tower.id || 'Unknown'}</p>
                        <p><strong>Type:</strong> ${tower.type || 'Standard'}</p>
                        <p><strong>Signal Strength:</strong> ${tower.signal || 'Good'}</p>
                        <p><strong>Location:</strong> ${tower.lat.toFixed(6)}, ${tower.lng.toFixed(6)}</p>
                    </div>`;
                
                if (usedFallback) {
                    popupContent += `<div class="simulated-data-note">
                        This is simulated data based on typical tower distribution patterns.
                    </div>`;
                }
                
                popupContent += `</div>`;
                
                marker.bindPopup(popupContent);
            });
        }
        
        // Add tower layer to map
        window.towerLayer.addTo(map);
        
        // Update tower count
        updateTowerCount(provider, towerData.length, usedFallback);
        
    } catch (error) {
        console.error("Error visualizing towers:", error);
        
        // Even if we encounter an error, still try to show fallback data
        if (!towerData) {
            towerData = generateFallbackTowerData(lat, lng, radius, provider);
            usedFallback = true;
            
            // Create marker for each fallback tower
            towerData.forEach(tower => {
                // Make sure we have valid lat/lng values
                if (!tower.lat || !tower.lng || isNaN(tower.lat) || isNaN(tower.lng)) {
                    // Use latitude/longitude if lat/lng not available
                    if (tower.latitude && tower.longitude) {
                        tower.lat = tower.latitude;
                        tower.lng = tower.longitude;
                    } else {
                        console.warn('Invalid tower coordinates, skipping marker', tower);
                        return; // Skip this tower
                    }
                }
                
                const towerIcon = L.divIcon({
                    html: `<div class="tower"></div>`,
                    className: `tower-icon ${provider.toLowerCase()} fallback`,
                    iconSize: [20, 20]
                });
                
                const marker = L.marker([tower.lat, tower.lng], { icon: towerIcon }).addTo(window.towerLayer);
                
                // Add popup with tower info
                const popupContent = `<div class="tower-popup">
                    <h4>${provider} Tower <span class="simulated-label">Simulated</span></h4>
                    <div class="tower-info">
                        <p><strong>ID:</strong> ${tower.id || 'Unknown'}</p>
                        <p><strong>Type:</strong> ${tower.type || 'Standard'}</p>
                        <p><strong>Signal Strength:</strong> ${tower.signal || 'Good'}</p>
                        <p><strong>Location:</strong> ${tower.lat.toFixed(6)}, ${tower.lng.toFixed(6)}</p>
                    </div>
                    <div class="simulated-data-note">
                        This is simulated data based on typical tower distribution patterns.
                    </div>
                </div>`;
                
                marker.bindPopup(popupContent);
            });
            
            // Add tower layer to map
            window.towerLayer.addTo(map);
            
            // Update tower count with fallback indication
            updateTowerCount(provider, towerData.length, true);
            
            // Show notification about simulated data
            showNotification("Using simulated tower data due to an error", "warning");
        }
    }
}

function updateTowerCount(provider, count, isSimulated = false) {
    const countElement = document.getElementById(`${provider.toLowerCase()}-tower-count`);
    if (countElement) {
        countElement.textContent = count;
        
        // If using simulated data, add an indicator
        const labelElement = countElement.closest('.tower-count-item').querySelector('.label');
        if (labelElement) {
            if (isSimulated) {
                if (!labelElement.innerHTML.includes('(Simulated)')) {
                    labelElement.innerHTML = `${provider} Towers <small>(Simulated)</small>`;
                }
            } else {
                labelElement.textContent = `${provider} Towers`;
            }
        }
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
async function fetchTowerData(provider, lat, lng, radius) {
  // Check if API is available
  // Define API_BASE_URL if it's not already defined
  if (typeof API_BASE_URL === 'undefined' || !API_BASE_URL) {
    // Try to get it from window.PortMySimAPI if available
    if (window.PortMySimAPI && window.PortMySimAPI.apiBaseUrl) {
      API_BASE_URL = window.PortMySimAPI.apiBaseUrl;
    } else {
      // Fallback to default API URL
      API_BASE_URL = 'http://localhost:5000/api';
      console.log('API_BASE_URL was not defined, using default:', API_BASE_URL);
    }
  }
  
  // Validate input parameters
  if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    console.warn('Invalid coordinates for tower data request', { lat, lng });
    return null;
  }
  
  // Ensure radius is a valid number
  const validRadius = Number(radius) || 5;

  try {
    // First, try to get a location name using reverse geocoding
    let locationName = null;
    try {
      const locationInfo = await reverseGeocode(lat, lng);
      if (locationInfo && locationInfo.city) {
        locationName = locationInfo.city;
      } else if (locationInfo && locationInfo.address) {
        // Use the most specific locality available
        locationName = locationInfo.address.city || 
                      locationInfo.address.town || 
                      locationInfo.address.village || 
                      locationInfo.address.county ||
                      locationInfo.address.state;
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
    
    if (!locationName) {
      console.log('Could not determine location name, using fallback data.');
      return null; // Use fallback data if we can't get a location name
    }
    
    // Use the location name for the API request
    const url = `${API_BASE_URL}/network-coverage/tower-data?location=${encodeURIComponent(locationName)}&provider=${encodeURIComponent(provider)}`;
    console.log(`Fetching tower data by location: ${url}`);
    
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
function generateFallbackTowerData(lat, lng, radius, provider) {
  // Validate inputs to prevent errors
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.warn('Invalid coordinates for fallback tower data', { lat, lng });
    // Default to center of India if coordinates are invalid
    lat = 20.5937;
    lng = 78.9629;
  }
  
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
      // Store coordinates in both formats for compatibility
      latitude: lat + offsetLat,
      longitude: lng + offsetLng,
      // Add lat/lng properties that Leaflet uses
      lat: lat + offsetLat,
      lng: lng + offsetLng,
      operator: provider || ["Airtel", "Jio", "Vodafone", "BSNL"][Math.floor(Math.random() * 4)],
      towerType: ["Roof Top", "Ground Based", "COW"][Math.floor(Math.random() * 3)],
      technologySupported: [["4G"], ["5G"], ["3G", "4G"]][Math.floor(Math.random() * 3)],
      signalStrength: Math.floor(Math.random() * 40) + 60, // 60-100
      frequency: [700, 800, 900, 1800, 2100, 2300, 2500][Math.floor(Math.random() * 7)],
      signal: 'Good' // Add default signal for display
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
  try {
    // Remove the main tower layer group if it exists
    if (window.towerLayer && map) {
      map.removeLayer(window.towerLayer);
      window.towerLayer = null;
    }
    
    // Also remove any network-specific tower layers
    if (window.towerLayers) {
      Object.keys(window.towerLayers).forEach(network => {
        if (map && window.towerLayers[network]) {
          map.removeLayer(window.towerLayers[network]);
        }
      });
    }
    
    // Clear tower counts
    const operators = ['jio', 'airtel', 'vi'];
    operators.forEach(operator => {
      const countElement = document.getElementById(`${operator}-tower-count`);
      if (countElement) {
        countElement.textContent = '0';
        
        // Find the label element through the parent-child relationship
        const towerCountItem = countElement.closest('.tower-count-item');
        if (towerCountItem) {
          const labelElement = towerCountItem.querySelector('.label');
          if (labelElement) {
            labelElement.textContent = `${operator.charAt(0).toUpperCase() + operator.slice(1)} Towers`;
          }
        }
      }
    });
    
    console.log('All tower layers have been removed from the map');
  } catch (error) {
    console.error('Error removing tower layers:', error);
  }
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
  // Check if map is initialized
  if (!map) {
    console.error("Map is not initialized");
    return;
  }

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
    // Check if towerLayers exists
    if (!window.towerLayers) {
      console.warn("towerLayers is not initialized");
      return;
    }
    
    if (selectedNetwork !== 'all') {
      // When a specific network is selected, show only that network's towers prominently
      Object.keys(window.towerLayers).forEach(network => {
        if (network === selectedNetwork) {
          // Make the selected network tower layer fully visible
          if (window.towerLayers[network]) {
            window.towerLayers[network].eachLayer(layer => {
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
          if (window.towerLayers[network]) {
            window.towerLayers[network].eachLayer(layer => {
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
      Object.keys(window.towerLayers).forEach(network => {
        if (window.towerLayers[network]) {
          window.towerLayers[network].eachLayer(layer => {
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
    if (window.towerLayers) {
      Object.keys(window.towerLayers).forEach(network => {
        if (map.hasLayer(window.towerLayers[network])) {
          map.removeLayer(window.towerLayers[network]);
        }
      });
    }
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

/**
 * Sets up the state-city browser functionality
 */
function setupStateCityBrowser() {
  const browseToggle = document.getElementById('browse-toggle');
  const statesGrid = document.getElementById('states-grid');
  const citiesPanel = document.getElementById('cities-panel');
  const closeCitiesPanel = document.getElementById('close-cities-panel');
  
  // Since we removed these elements, just exit early if any are missing
  if (!browseToggle || !statesGrid || !citiesPanel) return;
  
  // Toggle states grid visibility
  browseToggle.addEventListener('click', function() {
    const isOpen = statesGrid.classList.contains('open');
    
    if (isOpen) {
      statesGrid.classList.remove('open');
      browseToggle.classList.remove('active');
    } else {
      statesGrid.classList.add('open');
      browseToggle.classList.add('active');
      
      // Close the cities panel if it's open
      citiesPanel.classList.remove('open');
    }
  });
  
  // Close cities panel button
  if (closeCitiesPanel) {
    closeCitiesPanel.addEventListener('click', function() {
      citiesPanel.classList.remove('open');
    });
  }
  
  // Initialize state item click listeners
  initializeStateItemListeners();
}

/**
 * Initializes the map and UI elements
 */
function initializeMap() {
    // ... existing code ...
    
    // Add state selector to the search container
    const searchContainer = document.querySelector('.search-container');
    const stateSelector = document.createElement('select');
    stateSelector.id = 'state-selector';
    stateSelector.className = 'form-control mb-2';
    
    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All States';
    stateSelector.appendChild(defaultOption);
    
    // Add state options
    const states = getUniqueStates();
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelector.appendChild(option);
    });
    
    // Insert state selector before the search input
    searchContainer.insertBefore(stateSelector, document.getElementById('search-input'));
    
    // Add event listener to state selector
    stateSelector.addEventListener('change', function(e) {
        const selectedState = e.target.value;
        populateCityDropdown(selectedState);
    });
    
    // Create city dropdown
    const cityDropdown = document.createElement('select');
    cityDropdown.id = 'city-dropdown';
    cityDropdown.className = 'form-control mb-2';
    
    // Add a default option for city dropdown
    const defaultCityOption = document.createElement('option');
    defaultCityOption.value = '';
    defaultCityOption.textContent = 'Select a City';
    cityDropdown.appendChild(defaultCityOption);
    
    // Add initial cities (all)
    populateCityDropdown('');
    
    // Insert city dropdown after state selector
    searchContainer.insertBefore(cityDropdown, document.getElementById('search-input'));
    
    // Add event listener to city dropdown
    cityDropdown.addEventListener('change', function(e) {
        const selectedCity = e.target.value;
        const city = cities.find(c => c.name === selectedCity);
        if (city) {
            // Set the search input value to the selected city
            document.getElementById('search-input').value = city.name;
            // Center map on selected city
            map.setView(city.coords, 12);
            // Set current location
            currentLocation = { name: city.name, coords: city.coords };
            // Update UI to show the selected location
            updateLocationDisplay(city.name);
            // Clear previous user location marker
            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }
            // Add marker for selected location
            userLocationMarker = L.marker(city.coords).addTo(map);
        }
    });
}

/**
 * Populates the city dropdown based on the selected state
 * @param {string} stateName - The name of the state to filter by
 */
function populateCityDropdown(stateName) {
    const cityDropdown = document.getElementById('city-dropdown');
    // Clear existing options except the default
    while (cityDropdown.options.length > 1) {
        cityDropdown.remove(1);
    }
    
    // Get cities for the selected state
    const filteredCities = getCitiesByState(stateName);
    
    // Add city options
    filteredCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = city.name;
        cityDropdown.appendChild(option);
    });
}

/**
 * Updates the UI to show the selected location
 * @param {string} locationName - The name of the selected location
 */
function updateLocationDisplay(locationName) {
    const locationDisplay = document.getElementById('selected-location');
    if (locationDisplay) {
        locationDisplay.textContent = locationName;
    } else {
        // Create location display element if it doesn't exist
        const compareContainer = document.querySelector('.compare-container');
        const locationDiv = document.createElement('div');
        locationDiv.className = 'selected-location-container mt-2';
        locationDiv.innerHTML = `<strong>Selected Location:</strong> <span id="selected-location">${locationName}</span>`;
        compareContainer.insertBefore(locationDiv, compareContainer.firstChild);
    }
}

/**
 * Initialize city selection UI components - now only handles the state-selector and city-selector in the main form
 */
function initializeCitySelectionUI() {
  // We're now using new elements in the comparison-filters section
  const stateSelector = document.getElementById('state-selector');
  const citySelector = document.getElementById('city-selector');
  
  // Exit early if essential elements don't exist
  if (!stateSelector || !citySelector) return;
  
  // The old state-dropdown and city-dropdown were removed with the Browse All States section
  const oldStateDropdown = document.getElementById('state-dropdown');
  const oldCitySelector = document.getElementById('city-selector');
  
  // If we find the old elements (which we shouldn't), just exit to avoid errors
  if (oldStateDropdown) return;
}

/**
 * Populate the city selector dropdown based on selected state
 * @param {string} stateId - The ID of the selected state
 */
function populateCitySelector(stateId) {
  const citySelector = document.getElementById('city-selector');
  
  // Clear existing options except the default one
  while (citySelector.options.length > 1) {
    citySelector.remove(1);
  }
  
  // Get filtered cities for the selected state
  const filteredCities = getCitiesByState(stateId);
  
  // Sort cities alphabetically
  filteredCities.sort((a, b) => a.name.localeCompare(b.name));
  
  // Add city options
  filteredCities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.name;
    option.textContent = city.name;
    citySelector.appendChild(option);
  });
}

/**
 * Update user location marker on the map
 * @param {Array} coords - Coordinates [lat, lng] for the marker
 */
function updateLocationMarker(coords) {
  // Remove existing marker if any
  if (userLocationMarker) {
    map.removeLayer(userLocationMarker);
  }
  
  // Add new marker
  userLocationMarker = L.marker(coords, {
    icon: L.divIcon({
      className: 'selected-location-marker',
      html: '<i class="fas fa-map-marker-alt"></i>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    })
  }).addTo(map);
}

/**
 * Convert a state name to a state ID for use in the UI
 * @param {string} stateName - The full state name
 * @returns {string} The state ID
 */
function getStateIdFromName(stateName) {
  // Define mapping of state names to IDs (inverse of stateMapping in getCitiesByState)
  const nameToId = {
    'Delhi': 'delhi',
    'Haryana': 'haryana',
    'Himachal Pradesh': 'himachal',
    'Jammu & Kashmir': 'jammu',
    'Punjab': 'punjab',
    'Uttarakhand': 'uttarakhand',
    'Uttar Pradesh': 'up',
    'Bihar': 'bihar',
    'Jharkhand': 'jharkhand',
    'Odisha': 'odisha',
    'West Bengal': 'west-bengal',
    'Assam': 'assam',
    'Sikkim': 'sikkim',
    'Arunachal Pradesh': 'arunachal',
    'Manipur': 'manipur',
    'Meghalaya': 'meghalaya',
    'Mizoram': 'mizoram',
    'Nagaland': 'nagaland',
    'Tripura': 'tripura',
    'Gujarat': 'gujarat',
    'Maharashtra': 'maharashtra',
    'Goa': 'goa',
    'Rajasthan': 'rajasthan',
    'Chandigarh': 'chandigarh',
    'Daman & Diu': 'daman-diu',
    'Dadra & Nagar Haveli': 'dadra',
    'Lakshadweep': 'lakshadweep',
    'Puducherry': 'pondicherry',
    'Andaman & Nicobar': 'andaman',
    'Ladakh': 'ladakh',
    'Andhra Pradesh': 'andhra',
    'Karnataka': 'karnataka',
    'Kerala': 'kerala',
    'Tamil Nadu': 'tamil-nadu',
    'Telangana': 'telangana',
    'Chhattisgarh': 'chhattisgarh',
    'Madhya Pradesh': 'madhya-pradesh'
  };
  
  return nameToId[stateName] || '';
}

/**
 * Show cities for a selected state
 * @param {string} stateId - The ID of the selected state
 */
function showCitiesForState(stateId) {
  const citiesPanel = document.getElementById('cities-panel');
  const citiesGrid = document.getElementById('cities-grid');
  const selectedStateElement = document.getElementById('selected-state-name');
  
  // Exit early if any required element doesn't exist
  if (!citiesPanel || !citiesGrid) return;
  
  // Clear existing city items
  citiesGrid.innerHTML = '';
  
  // Get cities for the selected state
  const filteredCities = getCitiesByState(stateId);
  
  // Get state name from ID for display
  const stateName = getStateNameFromId(stateId) || 'All States';
  if (selectedStateElement) {
    selectedStateElement.textContent = stateName;
  }
  
  // Show cities panel
  citiesPanel.classList.add('visible');
  
  // If cities found, display them
  if (filteredCities && filteredCities.length > 0) {
    // Sort cities alphabetically
    filteredCities.sort((a, b) => a.name.localeCompare(b.name));
    
    // Create city items
    filteredCities.forEach(city => {
      const cityItem = document.createElement('div');
      cityItem.className = 'city-item';
      cityItem.innerHTML = `
        <div class="city-name">${city.name}</div>
        <div class="city-state">${city.state || ''}</div>
      `;
      
      // Add click handler
      cityItem.addEventListener('click', function() {
        // Center map on selected city
        map.setView(city.coords, 12);
        // Set current location
        currentLocation = { name: city.name, coords: city.coords };
        // Update UI to show the selected location
        updateLocationDisplay(city.name);
        // Update location marker
        updateLocationMarker(city.coords);
        // Compare networks at this location
        compareNetworksAction(city.name);
      });
      
      citiesGrid.appendChild(cityItem);
    });
  } else {
    // Show message if no cities found
    const message = document.createElement('div');
    message.className = 'no-cities-message';
    message.textContent = `No major cities found for ${stateName}`;
    citiesGrid.appendChild(message);
  }
}

/**
 * Get state name from state ID
 * @param {string} stateId - The ID of the state
 * @returns {string} The state name
 */
function getStateNameFromId(stateId) {
  // Map of state IDs to state names (from the mapping in getCitiesByState)
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
  
  return stateMapping[stateId] || '';
}

/**
 * Initialize event listeners for state items in the state list
 */
function initializeStateItemListeners() {
  const stateItems = document.querySelectorAll('.state-item');
  const selectedStateName = document.getElementById('selected-state-name');
  const citiesPanel = document.getElementById('cities-panel');
  
  // Exit early if elements don't exist or if there are no state items
  if (!stateItems.length || !citiesPanel || !selectedStateName) return;
  
  stateItems.forEach(item => {
    item.addEventListener('click', function() {
      const stateId = this.getAttribute('data-state');
      const stateName = this.textContent.trim();
      
      // Update the selected state name display
      selectedStateName.textContent = stateName;
      
      // Show cities for the selected state
      showCitiesForState(stateId);
      
      // Open the cities panel
      citiesPanel.classList.add('open');
    });
  });
}

// Modify the document ready function to initialize our new UI
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  
  // Initialize the improved city selection UI
  initializeCitySelectionUI();
  
  // Initialize state item listeners
  initializeStateItemListeners();
  
  // ... existing code ...
});

// Define getUserLocation function if it doesn't exist
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (map) {
          map.setView([latitude, longitude], 12);
          updateLocationMarker([latitude, longitude]);
        }
        userCoordinates = [latitude, longitude];
        // Update display to show "Current Location"
        if (locationSearchInput) {
          locationSearchInput.value = 'My Current Location';
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
        showNotification('Could not access your location. Please check your browser permissions.', 'error');
      }
    );
  } else {
    showNotification('Geolocation is not supported by your browser.', 'error');
  }
}

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

// Initialize the state and city selectors
function initializeStateAndCitySelectors() {
  const stateSelector = document.getElementById('state-selector');
  const citySelector = document.getElementById('city-selector');
  
  if (!stateSelector || !citySelector) return;
  
  // Get unique states and sort them
  const states = getUniqueStates();
  
  // Populate the state dropdown
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = getStateIdFromName(state);
    option.textContent = state;
    stateSelector.appendChild(option);
  });
  
  // Add event listener for state selection change
  stateSelector.addEventListener('change', function() {
    selectedState = this.value;
    if (selectedState) {
      populateCityDropdown(getStateNameFromId(selectedState));
      // Reset city selection
      citySelector.value = '';
      selectedCity = null;
    } else {
      // Clear city dropdown if no state is selected
      citySelector.innerHTML = '<option value="">Choose a City</option>';
      selectedCity = null;
    }
  });
  
  // Add event listener for city selection change
  citySelector.addEventListener('change', function() {
    selectedCity = this.options[this.selectedIndex].text;
    if (selectedCity) {
      // Find the city in our data
      const cityData = findCityByNameAndState(selectedCity, getStateNameFromId(selectedState));
      if (cityData) {
        searchLocation(cityData.name);
        updateLocationDisplay(cityData.name);
      }
    }
  });
}

// Find a city by name and state in our data
function findCityByNameAndState(cityName, stateName) {
  return cities.find(city => city.name === cityName && city.state === stateName);
}

// Update the compare button event to handle the new selection interface
function setupCompareButtonEvent() {
  const compareBtn = document.getElementById('compare-btn');
  
  if (!compareBtn) return;
  
  compareBtn.addEventListener('click', function() {
    let locationName = '';
    let stateName = null;
    
    // Check if a city is selected from dropdowns
    if (selectedCity && selectedState) {
      locationName = selectedCity;
      stateName = getStateNameFromId(selectedState);
    } else {
      // Fall back to the search input
      const locationSearch = document.getElementById('location-search');
      locationName = locationSearch.value.trim();
    }
    
    if (locationName) {
      compareNetworksAction(locationName, stateName);
    } else {
      showNotification('Please select a location or enter a search term', 'error');
    }
  });
}

/**
 * Populates the city dropdown with cities from the selected state
 * @param {string} stateName - The name of the state to get cities for
 */
function populateCityDropdown(stateName) {
  const citySelector = document.getElementById('city-selector');
  
  if (!citySelector) return;
  
  // Clear existing options except the first one
  citySelector.innerHTML = '<option value="">Choose a City</option>';
  
  // Get cities for the selected state
  const stateCities = getCitiesByState(stateName);
  
  if (stateCities && stateCities.length > 0) {
    // Sort cities alphabetically
    stateCities.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add cities to the dropdown
    stateCities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.name;
      option.textContent = city.name;
      citySelector.appendChild(option);
    });
  }
}
