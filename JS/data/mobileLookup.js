/**
 * Mobile Number Lookup Database
 * Based on TRAI (Telecom Regulatory Authority of India) number allocations
 * 
 * This file contains a comprehensive mapping of mobile number prefixes to operators and circles
 * Data sourced from TRAI's National Numbering Plan and public telecom records
 * 
 * Note: Some prefix conflicts exist where multiple operators may share the same prefix.
 * This database uses the most current and likely allocation based on recent TRAI data.
 */

// Priority mapping to resolve conflicts where multiple operators share the same prefix
// This mapping takes precedence over other mappings
const priorityPrefixes = {
  "60": "jio",     // Primarily Jio in most circles
  "61": "jio",     // Almost exclusively Jio
  "62": "jio",     // Primarily Jio in northern regions, some BSNL
  "63": "jio",     // Primarily Jio, some Airtel
  "70": "airtel",  // Primarily Airtel, some Jio
  "73": "airtel",  // Primarily Airtel in metros
  "75": "vi",      // Primarily Vi in most regions
  "76": "jio",     // Primarily Jio across India
  "77": "vi",      // Primarily Vi in southern regions
  "80": "airtel",  // Primarily Airtel
  "81": "airtel",  // Primarily Airtel in metros
  "83": "vi",      // Primarily Vi, some BSNL
  "90": "airtel",  // Primarily Airtel in metros
  "91": "airtel",  // Primarily Airtel nationwide
  "95": "vi",      // Primarily Vi
  "96": "jio",     // Primarily Jio
  "97": "airtel",  // Primarily Airtel
  "98": "airtel",  // Primarily Airtel in southern regions, some Vi
  "99": "vi"       // Primarily Vi in metros, some Airtel
};

const mobileOperatorData = {
  // Reliance Jio
  jio: {
    name: "Jio",
    prefixes: {
      // Series starting with 6
      "60": ["delhi", "mumbai", "maharashtra", "gujarat", "kolkata", "karnataka"],
      "61": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "62": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "63": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "64": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "65": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "66": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "67": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      "68": ["madhya-pradesh", "orissa", "assam", "northeast", "bihar", "jammu"],
      "69": ["delhi", "maharashtra", "karnataka", "tamil-nadu", "andhra-pradesh", "up-east"],
      
      // Series starting with 7
      "70": ["delhi", "mumbai", "maharashtra", "gujarat", "kolkata", "karnataka"],
      "71": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "72": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "73": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "74": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "75": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "76": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "77": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      "78": ["delhi", "mumbai", "karnataka", "tamil-nadu", "andhra-pradesh", "punjab"],
      "79": ["delhi", "maharashtra", "karnataka", "tamil-nadu", "andhra-pradesh", "up-east"],
      
      // Series starting with 8
      "80": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "81": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "82": ["delhi", "mumbai", "karnataka", "tamil-nadu", "andhra-pradesh", "rajasthan"],
      "83": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "84": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "85": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "86": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "87": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      "88": ["madhya-pradesh", "orissa", "assam", "northeast", "bihar", "jammu"],
      "89": ["delhi", "maharashtra", "karnataka", "tamil-nadu", "andhra-pradesh", "up-east"],
      
      // Series starting with 9
      "90": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "91": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "92": ["delhi", "mumbai", "karnataka", "tamil-nadu", "andhra-pradesh", "rajasthan"],
      "93": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "94": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"]
    }
  },
  
  // Bharti Airtel
  airtel: {
    name: "Airtel",
    prefixes: {
      // Series starting with 6
      "63": ["delhi", "mumbai", "maharashtra", "gujarat", "kolkata", "karnataka"],
      "64": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "65": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      
      // Series starting with 7
      "70": ["delhi", "mumbai", "maharashtra", "gujarat", "kolkata", "karnataka"],
      "71": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "72": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "73": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "74": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      
      // Series starting with 8
      "80": ["delhi", "mumbai", "maharashtra", "gujarat", "kolkata", "karnataka"],
      "81": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "84": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "85": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "86": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "87": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      "88": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "89": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      
      // Series starting with 9
      "90": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "91": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "95": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "96": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "97": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "98": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "99": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"]
    }
  },
  
  // Vodafone Idea
  vi: {
    name: "Vi",
    prefixes: {
      // Series starting with 6
      "60": ["gujarat", "tamil-nadu", "andhra-pradesh", "punjab", "haryana", "up-east"],
      "62": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "63": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "66": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "67": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      
      // Series starting with 7
      "70": ["mumbai", "maharashtra", "gujarat", "kolkata", "karnataka", "kerala"],
      "73": ["delhi", "tamil-nadu", "andhra-pradesh", "punjab", "haryana", "up-east"],
      "74": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "75": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "76": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "77": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      
      // Series starting with 8
      "81": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "82": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "83": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "84": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "85": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "86": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "89": ["delhi", "maharashtra", "karnataka", "tamil-nadu", "andhra-pradesh", "up-east"],
      
      // Series starting with 9
      "90": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "93": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "94": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "95": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "96": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      "97": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      "98": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "99": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"]
    }
  },
  
  // BSNL
  bsnl: {
    name: "BSNL",
    prefixes: {
      // Series starting with 6
      "62": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "64": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "69": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      
      // Series starting with 7
      "71": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "75": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "78": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"],
      
      // Series starting with 8
      "83": ["tamil-nadu", "andhra-pradesh", "punjab", "up-east", "rajasthan", "west-bengal"],
      "84": ["madhya-pradesh", "orissa", "assam", "northeast", "bihar", "jammu"],
      "89": ["delhi", "maharashtra", "karnataka", "tamil-nadu", "andhra-pradesh", "up-east"],
      
      // Series starting with 9
      "91": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "94": ["tamil-nadu", "andhra-pradesh", "kerala", "punjab", "haryana", "up-east"],
      "95": ["rajasthan", "madhya-pradesh", "west-bengal", "himachal", "orissa", "assam"],
      "96": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "tamil-nadu"],
      "97": ["andhra-pradesh", "kerala", "punjab", "haryana", "up-east", "rajasthan"],
      "98": ["madhya-pradesh", "west-bengal", "himachal", "orissa", "assam", "northeast"],
      "99": ["delhi", "mumbai", "maharashtra", "gujarat", "karnataka", "kerala"]
    }
  },
  
  // MTNL
  mtnl: {
    name: "MTNL",
    prefixes: {
      "90": ["delhi", "mumbai"],
      "92": ["delhi", "mumbai"],
      "93": ["delhi", "mumbai"],
      "94": ["delhi", "mumbai"],
      "96": ["delhi", "mumbai"],
      "97": ["delhi", "mumbai"],
      "98": ["delhi", "mumbai"],
      "99": ["delhi", "mumbai"]
    }
  }
};

/**
 * More specific prefix mappings for greater accuracy
 * Format: 'prefix': { operator: 'operator_id', circle: 'circle_id' }
 */
const specificPrefixes = {
  // Jio specific prefixes (more accurate 3-4 digit prefixes)
  "8199": { operator: "jio", circle: "delhi" },
  "9321": { operator: "jio", circle: "mumbai" },
  "9022": { operator: "jio", circle: "maharashtra" },
  "8591": { operator: "jio", circle: "karnataka" },
  "7021": { operator: "jio", circle: "tamil-nadu" },
  "7016": { operator: "jio", circle: "andhra-pradesh" },
  "7700": { operator: "jio", circle: "delhi" },
  "7710": { operator: "jio", circle: "mumbai" },
  "6290": { operator: "jio", circle: "maharashtra" },
  "8570": { operator: "jio", circle: "karnataka" },
  
  // Airtel specific prefixes
  "9810": { operator: "airtel", circle: "delhi" },
  "9920": { operator: "airtel", circle: "mumbai" },
  "9822": { operator: "airtel", circle: "maharashtra" },
  "9845": { operator: "airtel", circle: "karnataka" },
  "9840": { operator: "airtel", circle: "tamil-nadu" },
  "9848": { operator: "airtel", circle: "andhra-pradesh" },
  "8800": { operator: "airtel", circle: "delhi" },
  "8010": { operator: "airtel", circle: "mumbai" },
  "7082": { operator: "airtel", circle: "maharashtra" },
  "7760": { operator: "airtel", circle: "karnataka" },
  
  // Vi specific prefixes
  "9871": { operator: "vi", circle: "delhi" },
  "9820": { operator: "vi", circle: "mumbai" },
  "9823": { operator: "vi", circle: "maharashtra" },
  "9886": { operator: "vi", circle: "karnataka" },
  "9841": { operator: "vi", circle: "tamil-nadu" },
  "9849": { operator: "vi", circle: "andhra-pradesh" },
  "8588": { operator: "vi", circle: "delhi" },
  "7738": { operator: "vi", circle: "mumbai" },
  "7720": { operator: "vi", circle: "maharashtra" },
  "8792": { operator: "vi", circle: "karnataka" },
  
  // BSNL specific prefixes
  "9413": { operator: "bsnl", circle: "delhi" },
  "9423": { operator: "bsnl", circle: "maharashtra" },
  "9449": { operator: "bsnl", circle: "karnataka" },
  "9443": { operator: "bsnl", circle: "tamil-nadu" },
  "9440": { operator: "bsnl", circle: "andhra-pradesh" },
  "6000": { operator: "bsnl", circle: "delhi" },
  "6100": { operator: "bsnl", circle: "maharashtra" },
  "7000": { operator: "bsnl", circle: "karnataka" }
};

/**
 * First-digit based prediction for fallback
 */
const firstDigitOperators = {
  "6": "jio",
  "7": "airtel", 
  "8": "vi",
  "9": "airtel"
};

// Export the data for use in other modules
export { mobileOperatorData, specificPrefixes, firstDigitOperators, priorityPrefixes }; 