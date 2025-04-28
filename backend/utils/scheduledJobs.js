import PortingRequest from '../models/PortingRequest.model.js';
import cron from 'node-cron';

/**
 * Scheduled job to check porting status with provider APIs
 * Runs every hour to update the status of porting requests
 */
export const schedulePortingStatusChecks = () => {
  console.log('Setting up scheduled job for porting status checks');
  
  // Schedule the job to run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled porting status check:', new Date().toISOString());
    try {
      await updatePortingStatusesFromProviders();
    } catch (error) {
      console.error('Error in scheduled porting status check:', error);
    }
  });
};

/**
 * Updates the status of pending porting requests by checking with provider APIs
 */
export const updatePortingStatusesFromProviders = async () => {
  try {
    // Find all porting requests that are in processing or approved status
    const activePortingRequests = await PortingRequest.find({
      status: { $in: ['processing', 'approved'] },
      'metadata.providerReferenceId': { $exists: true }
    });
    
    console.log(`Found ${activePortingRequests.length} active porting requests to check with providers`);
    
    if (activePortingRequests.length === 0) {
      return {
        success: true,
        message: 'No active porting requests to check',
        updatedCount: 0
      };
    }
    
    let updatedCount = 0;
    const results = [];
    
    // Process each request
    for (const request of activePortingRequests) {
      try {
        console.log(`Checking status for porting request ${request._id} with ${request.newProvider}`);
        
        // Check status with provider
        const statusResult = await request.checkProviderPortingStatus();
        
        if (!statusResult.success) {
          console.error(`Failed to check status for porting request ${request._id}:`, statusResult.error);
          results.push({
            id: request._id,
            success: false,
            error: statusResult.error
          });
          continue;
        }
        
        // Update status if needed
        const providerStatus = statusResult.providerStatus;
        let statusChanged = false;
        
        if (providerStatus === 'COMPLETED' && request.status !== 'completed') {
          await request.updateStatus('completed', 'Porting completed by provider');
          statusChanged = true;
        } else if (providerStatus === 'APPROVED' && request.status !== 'approved' && request.status !== 'completed') {
          await request.updateStatus('approved', 'Porting approved by provider');
          statusChanged = true;
        }
        
        if (statusChanged) {
          updatedCount++;
        }
        
        results.push({
          id: request._id,
          success: true,
          previousStatus: request.status,
          currentStatus: statusChanged ? (providerStatus === 'COMPLETED' ? 'completed' : 'approved') : request.status,
          statusChanged
        });
        
      } catch (error) {
        console.error(`Error checking provider status for porting request ${request._id}:`, error);
        results.push({
          id: request._id,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    console.log(`Updated status for ${updatedCount} out of ${activePortingRequests.length} porting requests`);
    
    return {
      success: true,
      message: `Completed status check for ${activePortingRequests.length} porting requests`,
      updatedCount,
      results
    };
  } catch (error) {
    console.error('Error in update porting statuses job:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during porting status updates'
    };
  }
};

/**
 * Schedule all the automated jobs
 */
export const initializeScheduledJobs = () => {
  console.log('Initializing scheduled jobs');
  
  // Schedule all the jobs
  schedulePortingStatusChecks();
  
  console.log('All scheduled jobs initialized');
}; 