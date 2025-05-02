/**
 * Porting Request Submission Module
 * Provides functions for submitting porting requests
 */

(function() {
  'use strict';
  
  console.log('PortMySim Porting Submit Module - v1.1 (Fixed)');
  
  // Helper function to format dates
  function formatISODate(date) {
    if (!date) return '';
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toISOString();
  }
  
  // Function to submit porting request without Promise chains
  function submitPortingRequest(formData) {
    console.log('Submitting porting request with formData:', formData);
    
    try {
      // Create a reference number
      const refNumber = `PORT-${Math.floor(Math.random() * 900000) + 100000}`;
      
      // Get dates
      const now = new Date();
      
      // Calculate SMS date - 3 days before plan end date or 7 days from now as fallback
      let smsDate;
      if (formData.planEndDate) {
        smsDate = new Date(formData.planEndDate);
        smsDate.setDate(smsDate.getDate() - 3);
      } else {
        smsDate = new Date();
        smsDate.setDate(smsDate.getDate() + 7);
      }
      
      // Get scheduled date from form or default to 10 days from now
      const scheduledDate = formData.scheduledDate ? 
        new Date(formData.scheduledDate) : 
        new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      
      // Store the data in localStorage
      try {
        const portingRecord = {
          id: `request_${Date.now()}`,
          refNumber: refNumber,
          timestamp: new Date().toISOString(),
          mobileNumber: formData.mobileNumber,
          currentProvider: formData.currentProvider,
          currentCircle: formData.currentCircle,
          newProvider: formData.newProvider,
          planEndDate: formData.planEndDate,
          scheduledDate: scheduledDate.toISOString(),
          smsDate: smsDate.toISOString(),
          fullName: formData.fullName,
          email: formData.email,
          alternateNumber: formData.alternateNumber || '',
          automatePorting: !!formData.automatePorting,
          notifyUpdates: !!formData.notifyUpdates,
          location: formData.location || '',
          status: 'pending'
        };
        
        // Store in localStorage
        const existingRequests = JSON.parse(localStorage.getItem('portingRequests') || '[]');
        existingRequests.push(portingRecord);
        localStorage.setItem('portingRequests', JSON.stringify(existingRequests));
        
        console.log('Saved porting request to localStorage:', portingRecord);
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }
      
      // Create success response - NO PROMISES USED
      return {
        success: true,
        message: 'Porting request submitted successfully',
        data: {
          id: `request_${Date.now()}`,
          refNumber: refNumber,
          status: 'pending',
          smsDate: smsDate.toISOString(),
          scheduledDate: scheduledDate.toISOString(),
          mobileNumber: formData.mobileNumber,
          currentProvider: formData.currentProvider,
          currentCircle: formData.currentCircle,
          newProvider: formData.newProvider,
          fullName: formData.fullName,
          email: formData.email,
          portingCenterDetails: {
            name: 'Nearest Service Center',
            address: '123 Main Street, ' + (formData.location || 'Your City'),
            openingHours: '9:00 AM - 6:00 PM'
          },
          automatePorting: formData.automatePorting === true
        }
      };
      
    } catch (error) {
      console.error('Error in submission function:', error);
      
      // Return error response - NO PROMISES USED
      return {
        success: false,
        message: 'Error submitting porting request',
        error: error.message || 'Unknown error'
      };
    }
  }
  
  // Ensure we connect with the schedule.js submitForm function
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up porting-submit.js form integration');
    
    // Connect to the form if available directly
    const portingForm = document.getElementById('portingForm');
    if (portingForm) {
      console.log('Adding submit handler to porting form');
      portingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (typeof window.submitForm === 'function') {
          console.log('Calling submitForm function');
          window.submitForm(e);
        } else {
          console.warn('submitForm function not found, check schedule.js');
          alert('Form submission function not found. Please refresh the page and try again.');
        }
        return false;
      });
    }
  });
  
  // Expose the function globally
  window.submitPortingRequest = submitPortingRequest;
  
})();
