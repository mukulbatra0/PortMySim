/**
 * Utility functions for plan-related operations
 */

/**
 * Parse data string like "2GB/day" to extract numeric value
 * @param {string} dataString - The data string to parse
 * @returns {number} - The numeric value (GB)
 */
function parseDataValue(dataString) {
  if (!dataString) return 0;
  
  // Extract numeric value
  const match = dataString.match(/(\d+(\.\d+)?)/);
  if (!match) return 0;
  
  const value = parseFloat(match[0]);
  
  // Check if it's per day or total
  const isPerDay = dataString.toLowerCase().includes('/day');
  
  // For per day data, we multiply by 30 for monthly comparison
  return isPerDay ? value * 30 : value;
}

/**
 * Determine data category based on daily data value
 * @param {string} dataString - The data string
 * @returns {string} - Data category (low/medium/high)
 */
function getDataCategory(dataString) {
  if (!dataString) return 'low';
  
  const match = dataString.match(/(\d+(\.\d+)?)/);
  if (!match) return 'low';
  
  const value = parseFloat(match[0]);
  
  if (value <= 1) return 'low';
  if (value <= 2) return 'medium';
  return 'high';
}

/**
 * Determine price category based on price
 * @param {number} price - The plan price
 * @returns {string} - Price category (budget/mid/premium)
 */
function getPriceCategory(price) {
  if (price <= 200) return 'budget';
  if (price <= 500) return 'mid';
  return 'premium';
}

/**
 * Determine validity category based on days
 * @param {number} days - Validity in days
 * @returns {string} - Validity category (monthly/quarterly/annual)
 */
function getValidityCategory(days) {
  if (days <= 31) return 'monthly';
  if (days <= 100) return 'quarterly';
  return 'annual';
}

/**
 * Get operator image URL
 * @param {string} operator - Operator name
 * @returns {string} - Image URL
 */
function getOperatorImage(operator) {
  const baseUrl = '../images/';
  
  switch (operator.toLowerCase()) {
    case 'jio':
      return `${baseUrl}jio.jpeg`;
    case 'airtel':
      return `${baseUrl}airtel.png`;
    case 'vi':
      return `${baseUrl}vi.png`;
    case 'bsnl':
      return `${baseUrl}bsnl.png`;
    default:
      return `${baseUrl}default.png`;
  }
}

module.exports = {
  parseDataValue,
  getDataCategory,
  getPriceCategory,
  getValidityCategory,
  getOperatorImage
}; 