/**
 * Mobile Number Helper
 * This module provides empty implementation as per requirement to not use Truecaller API
 * and not perform automatic detection of circle and operator
 */

/**
 * Map of operator names to IDs
 */
const operatorMap = {
    "Reliance Jio": "jio",
    "Jio": "jio",
    "Bharti Airtel": "airtel",
    "Airtel": "airtel",
    "Vodafone Idea": "vi",
    "Vi": "vi",
    "Vodafone": "vi",
    "Idea": "vi",
    "BSNL": "bsnl",
    "MTNL": "mtnl"
};

/**
 * Map of region names to circle IDs
 */
const circleMap = {
    "Delhi": "delhi",
    "Mumbai": "mumbai",
    "Maharashtra": "maharashtra",
    "Karnataka": "karnataka",
    "Tamil Nadu": "tamil-nadu",
    "Andhra Pradesh": "andhra-pradesh",
    "West Bengal": "west-bengal",
    "Gujarat": "gujarat",
    "Kolkata": "kolkata",
    "UP East": "up-east",
    "UP West": "up-west",
    "Kerala": "kerala",
    "Punjab": "punjab",
    "Haryana": "haryana",
    "Rajasthan": "rajasthan",
    "Madhya Pradesh": "madhya-pradesh",
    "Bihar": "bihar",
    "Orissa": "orissa",
    "Assam": "assam",
    "Northeast": "northeast",
    "Himachal Pradesh": "himachal",
    "Jammu & Kashmir": "jammu"
};

/**
 * Find the closest operator based on carrier name
 * @param {string} carrierName - The carrier name
 * @returns {string} - The operator ID
 */
function findClosestOperator(carrierName) {
    if (!carrierName) return null;
    
    // Exact match
    if (operatorMap[carrierName]) {
        return operatorMap[carrierName];
    }
    
    // Check if carrier name contains any of our known operators
    const lowerCarrier = carrierName.toLowerCase();
    if (lowerCarrier.includes('jio')) return 'jio';
    if (lowerCarrier.includes('airtel')) return 'airtel';
    if (lowerCarrier.includes('vodafone') || lowerCarrier.includes('idea') || lowerCarrier.includes('vi')) return 'vi';
    if (lowerCarrier.includes('bsnl')) return 'bsnl';
    if (lowerCarrier.includes('mtnl')) return 'mtnl';
    
    // Default fallback
    return null;
}

/**
 * Map region to internal circle ID
 * @param {string} region - The region name
 * @returns {string} - The circle ID
 */
function mapCircleFromRegion(region) {
    if (!region) return null;
    
    // Exact match
    if (circleMap[region]) {
        return circleMap[region];
    }
    
    // Try to find a partial match
    const lowerRegion = region.toLowerCase();
    for (const [key, value] of Object.entries(circleMap)) {
        if (lowerRegion.includes(key.toLowerCase())) {
            return value;
        }
    }
    
    // Default fallback
    return null;
}

/**
 * Look up phone number information - now returns null as automatic detection is removed
 * @param {string} phoneNumber - The phone number to look up
 * @returns {Promise<null>} - Always returns null as automatic detection is disabled
 */
async function lookupPhoneNumber(phoneNumber) {
    console.log("Automatic detection disabled, returning null for", phoneNumber);
    return null;
}

export { lookupPhoneNumber }; 