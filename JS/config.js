/**
 * Global Configuration for PortMySim
 * Contains application-wide settings
 */

// Create global CONFIG object with default settings
window.CONFIG = {
    // API settings
    API_BASE_URL: 'http://localhost:5000/api',
    
    // Map settings
    useOpenStreetMapAsFallback: true,
    googleMapsApiKey: '',
    mapDefaultLocation: {
        lat: 28.6139,  // New Delhi
        lng: 77.2090
    },
    mapDefaultZoom: 12,
    
    // Provider settings
    providers: [
        {
            id: 'airtel',
            name: 'Airtel',
            description: 'Bharti Airtel',
            logo: '../images/providers/airtel.png',
            color: '228, 0, 0'
        },
        {
            id: 'jio',
            name: 'Jio',
            description: 'Reliance Jio',
            logo: '../images/providers/jio.png',
            color: '15, 60, 201'
        },
        {
            id: 'vi',
            name: 'Vi',
            description: 'Vodafone Idea',
            logo: '../images/providers/vi.png', 
            color: '238, 0, 140'
        },
        {
            id: 'bsnl',
            name: 'BSNL',
            description: 'Bharat Sanchar Nigam Limited',
            logo: '../images/providers/bsnl.png',
            color: '29, 138, 19'
        }
    ],
    
    // Authentication settings
    authEnabled: true,
    authRedirect: 'login.html',
    
    // Feature flags
    features: {
        automatedPorting: true,
        notificationsEnabled: true,
        mapViewEnabled: true
    }
};

// Make CONFIG available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
} 