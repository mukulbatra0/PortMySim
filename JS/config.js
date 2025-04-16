// Configuration for PortMySim application

const CONFIG = {
    // API endpoints
    apiBaseUrl: 'http://localhost:5000/api',
    
    // Feature flags
    enableLiveSearch: true,
    enableAutoDetection: false,
    enableMapFeatures: true,
    
    // Authentication settings
    authTokenKey: 'portmysim_auth_token',
    userDataKey: 'portmysim_user',
    sessionExpiryHours: 24,
    
    // Mobile number validation
    mobileNumberPattern: /^[6-9]\d{9}$/,
    
    // Maps API settings
    mapDefaultZoom: 13,
    mapDefaultLocation: {
        lat: 28.6139,  // New Delhi
        lng: 77.2090
    },
    googleMapsApiKey: '', // Add your Google Maps API key here
    useOpenStreetMapAsFallback: true, // Use OpenStreetMap if Google Maps fails or API key is missing
    
    // Default providers
    providers: [
        { id: 'airtel', name: 'Airtel', color: '#e40000' },
        { id: 'jio', name: 'Jio', color: '#0f3cc9' },
        { id: 'vi', name: 'Vi', color: '#ee008c' },
        { id: 'bsnl', name: 'BSNL', color: '#1d8a13' },
        { id: 'mtnl', name: 'MTNL', color: '#ff6a00' }
    ],
    
    // App settings
    appName: 'PortMySim',
    appVersion: '1.0.0',
    
    // Default options
    defaultCircle: 'delhi',
    defaultProvider: 'jio'
};

// Make CONFIG available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
} 