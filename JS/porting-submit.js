/**
 * Porting Submission Handler
 * Simple form submission handler without auto-detection functionality
 */

// Function to handle the form submission - simply collects the data and submits it
function handlePortingSubmission(formData) {
  console.log('Handling porting submission:', formData);
  
  // Validate required fields
  const requiredFields = ['mobileNumber', 'currentProvider', 'currentCircle', 'newProvider', 
                         'scheduledDate', 'planEndDate', 'fullName', 'email'];
  
  const missingFields = requiredFields.filter(field => !formData[field]);
  
  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Return success response
  return {
    success: true,
    data: {
      refNumber: `PORT-${Math.floor(Math.random() * 100000)}`,
      smsDate: calculateSmsDate(formData.planEndDate),
      status: 'pending',
      message: 'Porting request submitted successfully'
    }
  };
}

// Helper function to calculate SMS date
function calculateSmsDate(planEndDate) {
  const endDate = new Date(planEndDate);
  const smsDate = new Date(endDate);
  smsDate.setDate(smsDate.getDate() - 4); // 4 days before plan ends
  return smsDate.toISOString();
}

// Export the function
window.submitPortingWithFixedAuth = handlePortingSubmission; 