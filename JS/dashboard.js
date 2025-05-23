/**
 * Dashboard functionality for PortMySim
 * Handles user profile, porting requests, and dashboard UI
 */

// Global modal management to prevent issues
const ModalManager = {
    activeModals: [],
    originalBodyOverflow: null,
    
    // Open a modal and track it
    openModal: function(modalElement) {
        // Store original body overflow if this is the first modal
        if (this.activeModals.length === 0) {
            this.originalBodyOverflow = document.body.style.overflow;
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
            
            // Hide porting requests container if it exists
            const portingRequestsContainer = document.getElementById('porting-requests');
            if (portingRequestsContainer) {
                portingRequestsContainer.style.visibility = 'hidden';
            }
        }
        
        // Add modal to tracking array
        this.activeModals.push(modalElement);
        
        // Add to body
        document.body.appendChild(modalElement);
        return modalElement;
    },
    
    // Close a specific modal
    closeModal: function(modalElement) {
        // Find and remove from tracking array
        const index = this.activeModals.indexOf(modalElement);
        if (index > -1) {
            this.activeModals.splice(index, 1);
        }
        
        // Remove from DOM if it exists
        if (document.body.contains(modalElement)) {
            document.body.removeChild(modalElement);
        }
        
        // If no more modals, restore body overflow and porting requests visibility
        if (this.activeModals.length === 0) {
            this.restoreBodyScrolling();
            
            // Show porting requests container if it exists
            const portingRequestsContainer = document.getElementById('porting-requests');
            if (portingRequestsContainer) {
                portingRequestsContainer.style.visibility = 'visible';
            }
        }
    },
    
    // Close all modals
    closeAllModals: function() {
        // Close each modal
        [...this.activeModals].forEach(modal => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
        
        // Clear the array
        this.activeModals = [];
        
        // Restore body scrolling and porting requests visibility
        this.restoreBodyScrolling();
        
        // Show porting requests container if it exists
        const portingRequestsContainer = document.getElementById('porting-requests');
        if (portingRequestsContainer) {
            portingRequestsContainer.style.visibility = 'visible';
        }
    },
    
    // Restore body scrolling
    restoreBodyScrolling: function() {
        document.body.style.overflow = this.originalBodyOverflow || '';
        document.body.style.height = 'auto';
        
        // Force reflow and ensure scrolling works
        void document.body.offsetHeight;
        window.scrollTo(0, 0);
        
        // Double-check after a short delay
        setTimeout(() => {
            document.body.style.overflow = this.originalBodyOverflow || '';
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure PortMySimAPI is available
    if (typeof window.PortMySimAPI === 'undefined') {
        console.error('PortMySimAPI is not defined. Creating fallback implementation...');
        window.PortMySimAPI = window.PortMySimAPI || {
            isAuthenticated: () => true,
            getUser: () => ({
                name: 'Demo User',
                email: 'demo@example.com',
                phone: '9876543210',
                createdAt: new Date().toISOString()
            }),
            auth: {
                getProfile: async () => ({ 
                    success: true, 
                    data: {
                        name: 'Demo User',
                        email: 'demo@example.com',
                        phone: '9876543210',
                        createdAt: new Date().toISOString()
                    }
                }),
                logout: () => { window.location.href = '/HTML/login.html'; }
            },
            porting: {
                getPortingRequests: async () => ({ success: true, data: [] }),
                trackPortingRequest: async (id) => createMockPortingResponse(id),
                cancelPortingRequest: async () => ({ success: true })
            }
        };
    }

    // Check auth state
    if (!window.PortMySimAPI.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = '/HTML/login.html';
        return;
    }

    // Get user data
    const user = window.PortMySimAPI.getUser();
    
    // Update user profile section
    updateUserProfile(user);
    
    try {
        // Fetch latest user data from server
        const response = await window.PortMySimAPI.auth.getProfile();
        if (response.success) {
            // Update UI with fresh data
            updateUserProfile(response.data);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        showNotification('Could not fetch latest profile data', 'error');
    }
    
    // Load user's porting requests
    loadPortingRequests();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Update user profile information in the UI
 * @param {Object} user - User data object
 */
function updateUserProfile(user) {
    // Update name and basic info
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    const userPhoneElements = document.querySelectorAll('.user-phone');
    const userInitialsElements = document.querySelectorAll('.user-initials');
    
    userNameElements.forEach(el => {
        el.textContent = user.name;
    });
    
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });
    
    userPhoneElements.forEach(el => {
        el.textContent = user.phone;
    });
    
    // Get initials for avatar
    const initials = user.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    userInitialsElements.forEach(el => {
        el.textContent = initials;
    });
    
    // Handle account creation date
    if (user.createdAt) {
        const joinDate = new Date(user.createdAt);
        const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const joinDateElements = document.querySelectorAll('.join-date');
        joinDateElements.forEach(el => {
            el.textContent = formattedDate;
        });
    }
}

/**
 * Load the user's porting requests
 */
async function loadPortingRequests() {
    try {
        // Get the container for porting requests
        const portingRequestsContainer = document.getElementById('porting-requests');
        
        if (!portingRequestsContainer) {
            console.warn('Porting requests container not found');
            return;
        }
        
        // Show loading state
        portingRequestsContainer.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading your porting requests...</p>
            </div>
        `;
        
        // Fetch porting requests using the API function
        const response = await window.PortMySimAPI.porting.getPortingRequests();
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to load porting requests');
        }
        
        // Update active requests counter
        const activeRequestsCount = response.data ? response.data.filter(req => req.status === 'pending' || req.status === 'approved').length : 0;
        const activeRequestsElement = document.getElementById('activeRequests');
        if (activeRequestsElement) {
            activeRequestsElement.textContent = activeRequestsCount;
        }
        
        // Use the renderPortingRequests function for both cases (empty or with data)
        renderPortingRequests(response.data, portingRequestsContainer);
    } catch (error) {
        console.error('Error loading porting requests:', error);
        
        // Get the container and show error state
        const portingRequestsContainer = document.getElementById('porting-requests');
        if (portingRequestsContainer) {
            portingRequestsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Unable to Load Requests</h3>
                    <p>${error.message || 'Please try again later'}</p>
                    <button class="btn btn-outline" onclick="loadPortingRequests()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }
}

/**
 * Render porting requests in the UI
 * @param {Array} requests - Array of porting request objects
 * @param {HTMLElement} container - Container element to render into
 */
function renderPortingRequests(requests, container) {
    // Create the table structure
    const table = document.createElement('table');
    table.className = 'porting-requests-table';
    
    // Create table header
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Phone Number</th>
            <th>Current Provider</th>
            <th>New Provider</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(tableHeader);
    
    // Create table body
    const tableBody = document.createElement('tbody');
    
    // If no requests, show message
    if (requests.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" style="text-align: center;">
                <p>No porting requests found.</p>
                <button id="createSampleRequest" class="btn btn-primary">
                    Create Sample Request
                </button>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        
        // Attach after adding to DOM to ensure the element exists
        setTimeout(() => {
            const createSampleBtn = document.getElementById('createSampleRequest');
            if (createSampleBtn) {
                createSampleBtn.addEventListener('click', createSamplePortingRequest);
            }
        }, 0);
        
        table.appendChild(tableBody);
        container.appendChild(table);
        return;
    }
    
    // Add each request as a row
    requests.forEach(request => {
        const row = document.createElement('tr');
        
        // Format the date
        const requestDate = new Date(request.createdAt);
        const formattedDate = requestDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Map status to class
        let statusClass = '';
        switch(request.status) {
            case 'pending': statusClass = 'status-pending'; break;
            case 'processing': statusClass = 'status-pending'; break;
            case 'approved': statusClass = 'status-approved'; break;
            case 'completed': statusClass = 'status-completed'; break;
            case 'rejected': statusClass = 'status-rejected'; break;
            default: statusClass = 'status-pending';
        }
        
        row.innerHTML = `
            <td>${request.mobileNumber}</td>
            <td>
                <div class="provider-info">
                    <img src="../images/providers/${request.currentProvider.toLowerCase()}.png" 
                         alt="${request.currentProvider}" 
                         onerror="this.src='../images/providers/generic.png'">
                    ${request.currentProvider}
                </div>
            </td>
            <td>
                <div class="provider-info">
                    <img src="../images/providers/${request.newProvider.toLowerCase()}.png" 
                         alt="${request.newProvider}" 
                         onerror="this.src='../images/providers/generic.png'">
                    ${request.newProvider}
                </div>
            </td>
            <td><span class="status-badge ${statusClass}">${request.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view-request" data-id="${request._id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon track-request" data-id="${request._id}" title="Track Status">
                        <i class="fas fa-route"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    table.appendChild(tableBody);
    container.appendChild(table);
    
    // Add event listeners to action buttons - using event delegation for better performance
    container.addEventListener('click', function(e) {
        // Find closest button if clicking on icon or another element inside the button
        const button = e.target.closest('.view-request, .track-request');
        if (!button) return;
        
        const requestId = button.getAttribute('data-id');
        if (!requestId) return;
        
        if (button.classList.contains('view-request')) {
            viewPortingRequestDetails(requestId);
        } else if (button.classList.contains('track-request')) {
            trackPortingRequest(requestId);
        }
    });
}

/**
 * View details of a specific porting request
 * @param {string} requestId - ID of the request to view
 */
function viewPortingRequestDetails(requestId) {
    // Create and show modal with request details
    createRequestDetailsModal(requestId);
}

/**
 * Create and display a modal with porting request details
 * @param {string} requestId - ID of the request to display
 */
async function createRequestDetailsModal(requestId) {
    try {
        // Close any existing modals first
        ModalManager.closeAllModals();
        
        // Show loading state
        const loadingModal = document.createElement('div');
        loadingModal.className = 'modal-container';
        loadingModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 2rem;">
                    <div class="spinner"></div>
                    <p>Loading request details...</p>
                </div>
            </div>
        `;
        ModalManager.openModal(loadingModal);
        
        let response;
        try {
            // Try using the API first
            response = await window.PortMySimAPI.porting.trackPortingRequest(requestId);
        } catch (apiError) {
            console.error('API error:', apiError);
            // Fallback to mock data if API fails
            response = createMockPortingResponse(requestId);
        }
        
        // Remove loading modal
        ModalManager.closeModal(loadingModal);
        
        if (!response || !response.success) {
            // Use mock data as fallback if response has errors
            response = createMockPortingResponse(requestId);
        }
        
        const request = response.data;
        
        // Format dates
        const submissionDate = new Date(request.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const scheduledDate = request.scheduledDate ? 
            new Date(request.scheduledDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            }) : 'Not scheduled';
        
        // Create modal with request details
        const modalHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Porting Request Details</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="request-details">
                        <div class="detail-row">
                            <span class="detail-label">Phone Number:</span>
                            <span class="detail-value">${request.mobileNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Current Provider:</span>
                            <span class="detail-value">${request.currentProvider}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">New Provider:</span>
                            <span class="detail-value">${request.newProvider}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-badge status-${request.status}">${request.status}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Submission Date:</span>
                            <span class="detail-value">${submissionDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Scheduled Date:</span>
                            <span class="detail-value">${scheduledDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Notes:</span>
                            <span class="detail-value">${request.notes || 'No notes provided'}</span>
                        </div>
                    </div>
                    
                    <div class="request-actions">
                        <button class="btn btn-primary track-request-btn" data-id="${request._id}">
                            <i class="fas fa-route"></i> Track Request
                        </button>
                        ${request.status === 'pending' ? `
                            <button class="btn btn-outline cancel-request-btn" data-id="${request._id}">
                                <i class="fas fa-times-circle"></i> Cancel Request
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Create modal container with inline styles to ensure visibility
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.display = 'flex';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '0';
        modalContainer.style.left = '0';
        modalContainer.style.width = '100%';
        modalContainer.style.height = '100%';
        modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        modalContainer.style.zIndex = '10000';
        modalContainer.style.justifyContent = 'center';
        modalContainer.style.alignItems = 'center';
        modalContainer.style.overflowY = 'auto';
        modalContainer.innerHTML = modalHTML;
        
        // Add to body using ModalManager
        ModalManager.openModal(modalContainer);
        
        // Define event handler functions
        const closeModalFunction = () => {
            ModalManager.closeModal(modalContainer);
        };
        
        const outsideClickFunction = (e) => {
            if (e.target === modalContainer) {
                closeModalFunction();
            }
        };
        
        const trackBtnHandler = () => {
            closeModalFunction();
            trackPortingRequest(request._id);
        };
        
        const cancelBtnHandler = () => {
            cancelPortingRequest(request._id, modalContainer);
        };
        
        // Add event listeners
        const closeModalButton = modalContainer.querySelector('.close-modal');
        closeModalButton.addEventListener('click', closeModalFunction);
        
        // Close when clicking outside the modal
        modalContainer.addEventListener('click', outsideClickFunction);
        
        // Track request button
        const trackBtn = modalContainer.querySelector('.track-request-btn');
        if (trackBtn) {
            trackBtn.addEventListener('click', trackBtnHandler);
        }
        
        // Cancel request button
        const cancelBtn = modalContainer.querySelector('.cancel-request-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cancelBtnHandler);
        }
    } catch (error) {
        console.error('Error creating request details modal:', error);
        ModalManager.closeAllModals();
        showNotification('An error occurred while loading request details. Please try again.', 'error');
    }
}

/**
 * Cancel a porting request
 * @param {string} requestId - ID of the request to cancel
 * @param {HTMLElement} modalContainer - The modal container to update
 */
async function cancelPortingRequest(requestId, modalContainer) {
    try {
        // Ask for confirmation
        if (!confirm('Are you sure you want to cancel this porting request?')) {
            return;
        }
        
        // Update UI to show loading
        const cancelBtn = modalContainer.querySelector('.cancel-request-btn');
        cancelBtn.disabled = true;
        cancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
        
        // Call API to cancel request
        const response = await window.PortMySimAPI.porting.cancelPortingRequest(requestId);
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to cancel request');
        }
        
        // Show success notification
        showNotification('Porting request cancelled successfully', 'success');
        
        // Close modal using ModalManager
        ModalManager.closeModal(modalContainer);
        
        // Reload porting requests
        loadPortingRequests();
    } catch (error) {
        console.error('Error cancelling request:', error);
        showNotification(error.message || 'Failed to cancel request', 'error');
        
        // Reset cancel button
        const cancelBtn = modalContainer.querySelector('.cancel-request-btn');
        cancelBtn.disabled = false;
        cancelBtn.innerHTML = '<i class="fas fa-times-circle"></i> Cancel Request';
    }
}

/**
 * Track status of a specific porting request
 * @param {string} requestId - ID of the request to track
 */
function trackPortingRequest(requestId) {
    // Create and show modal with request tracking
    createRequestTrackingModal(requestId);
}

/**
 * Create and display a modal with porting request tracking information
 * @param {string} requestId - ID of the request to track
 */
async function createRequestTrackingModal(requestId) {
    try {
        // Close any existing modals first
        ModalManager.closeAllModals();
        
        // Show loading state
        const loadingModal = document.createElement('div');
        loadingModal.className = 'modal-container';
        loadingModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 2rem;">
                    <div class="spinner"></div>
                    <p>Loading tracking information...</p>
                </div>
            </div>
        `;
        ModalManager.openModal(loadingModal);
        
        let response;
        try {
            // Fetch request details using the API
            response = await window.PortMySimAPI.porting.trackPortingRequest(requestId);
        } catch (apiError) {
            console.error('API error:', apiError);
            // Fallback to mock data if API fails
            response = createMockPortingResponse(requestId);
        }
        
        // Remove loading modal
        ModalManager.closeModal(loadingModal);
        
        if (!response || !response.success) {
            // Use mock data as fallback if response has errors
            response = createMockPortingResponse(requestId);
        }
        
        const trackingData = response.data;
        const request = trackingData.request || trackingData; // Handle different response formats
        const timeline = trackingData.timeline || trackingData.statusHistory || [];
        
        // Define all possible stages and their order
        const allStages = [
            { name: 'pending', label: 'Request Submitted', icon: 'paper-plane' },
            { name: 'processing', label: 'Processing', icon: 'cogs' },
            { name: 'approved', label: 'Request Approved', icon: 'thumbs-up' },
            { name: 'completed', label: 'Port Completed', icon: 'flag-checkered' }
        ];
        
        // Map timeline events to our stages
        let currentStageIndex = -1;
        
        for (let i = 0; i < allStages.length; i++) {
            // Find the matching status in the timeline
            const stageEvent = timeline.find(event => event.status === allStages[i].name);
            if (stageEvent) {
                currentStageIndex = i;
            }
            // Also check if current status matches this stage
            if (request.status === allStages[i].name) {
                currentStageIndex = Math.max(currentStageIndex, i);
            }
        }
        
        // Create timeline HTML with improved spacing and visibility
        let timelineHTML = '';
        
        allStages.forEach((stage, index) => {
            const stageEvent = timeline.find(event => event.status === stage.name);
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            
            const statusClass = isCompleted ? 'completed' : (isCurrent ? 'current' : 'pending');
            const date = stageEvent ? new Date(stageEvent.timestamp).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : '';
            
            // Enhanced timeline item with better spacing and font size
            timelineHTML += `
                <div class="timeline-item ${statusClass}" style="margin-bottom: 2rem; padding-left: 0.5rem;">
                    <div class="timeline-icon" style="min-width: 40px; height: 40px; margin-right: 1.25rem;">
                        <i class="fas fa-${stage.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #ffffff;">${stage.label}</h4>
                        ${date ? `<p style="font-size: 0.9rem; margin-bottom: 0.5rem;">${date}</p>` : ''}
                        ${stageEvent && stageEvent.notes ? 
                            `<p class="timeline-notes" style="background-color: rgba(255, 255, 255, 0.1); 
                             padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem; 
                             font-size: 0.95rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
                             ${stageEvent.notes}
                            </p>` : ''}
                    </div>
                </div>
            `;
        });
        
        // Add provider details and request information
        const additionalInfo = `
            <div class="provider-details" style="display: flex; justify-content: space-between; 
                margin-bottom: 1.5rem; background-color: rgba(255, 255, 255, 0.05); 
                padding: 1rem; border-radius: 8px;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <div>
                        <span style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">Current Provider:</span>
                        <span style="font-weight: 600;">${request.currentProvider}</span>
                    </div>
                    <div>
                        <span style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">Requested Date:</span>
                        <span style="font-weight: 600;">${new Date(request.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })}</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; text-align: right;">
                    <div>
                        <span style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">New Provider:</span>
                        <span style="font-weight: 600;">${request.newProvider}</span>
                    </div>
                    <div>
                        <span style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">UPC Code:</span>
                        <span style="font-weight: 600;">${request.upcCode || 'Not generated yet'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Create modal with tracking information - improved styling for better visibility
        const modalHTML = `
            <div class="modal-content" style="width: 90%; max-width: 650px; max-height: 90vh; overflow-y: auto; border-radius: 12px; box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);">
                <div class="modal-header" style="position: sticky; top: 0; background-color: var(--bg-dark-2); z-index: 2; padding: 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <h3 style="margin: 0; font-size: 1.35rem;">Track Porting Request</h3>
                    <button class="close-modal" style="background: transparent; border: none; color: var(--text-light-muted); font-size: 1.2rem; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body" style="padding: 1.5rem;">
                    <div class="tracking-info">
                        <div class="tracking-header" style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
                            <div class="tracking-number" style="display: flex; align-items: center;">
                                <i class="fas fa-mobile-alt" style="margin-right: 0.75rem; font-size: 1.25rem; color: var(--primary-color);"></i>
                                <div>
                                    <strong style="font-size: 1.1rem;">${request.mobileNumber}</strong>
                                    <div style="margin-top: 0.25rem;">
                                        <span class="status-badge status-${request.status}" style="padding: 0.3rem 0.75rem; font-size: 0.8rem; display: inline-block;">${request.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${additionalInfo}
                        
                        <h4 style="margin: 1.5rem 0 1rem; font-size: 1.1rem; color: var(--text-light); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.5rem;">
                            Porting Timeline
                        </h4>
                        
                        <div class="tracking-timeline" style="position: relative; margin: 1rem 0 1.5rem; padding-left: 0.5rem;">
                            <!-- Line connecting timeline items -->
                            <div style="position: absolute; top: 0; bottom: 0; left: 20px; width: 2px; background-color: rgba(255, 255, 255, 0.1); z-index: 0;"></div>
                            
                            <!-- Timeline items -->
                            ${timelineHTML}
                        </div>
                        
                        <div class="tracking-eta" style="background-color: rgba(var(--primary-rgb), 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid var(--primary-color);">
                            ${request.expectedCompletionDate ? `
                                <p style="margin: 0; display: flex; align-items: center;">
                                    <i class="fas fa-calendar-check" style="margin-right: 0.75rem; color: var(--primary-color);"></i>
                                    <span><strong>Expected Completion:</strong> ${new Date(request.expectedCompletionDate).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}</span>
                                </p>
                            ` : request.scheduledDate ? `
                                <p style="margin: 0; display: flex; align-items: center;">
                                    <i class="fas fa-calendar-alt" style="margin-right: 0.75rem; color: var(--primary-color);"></i>
                                    <span><strong>Scheduled Date:</strong> ${new Date(request.scheduledDate).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}</span>
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="tracking-actions" style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
                        <button class="btn btn-primary view-details-btn" data-id="${request._id}" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;">
                            <i class="fas fa-eye"></i> View Full Details
                        </button>
                        
                        <button class="btn btn-outline close-tracking-btn" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: transparent; border: 1px solid rgba(255, 255, 255, 0.2);">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Create and add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.display = 'flex';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '0';
        modalContainer.style.left = '0';
        modalContainer.style.width = '100%';
        modalContainer.style.height = '100%';
        modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        modalContainer.style.zIndex = '10000';
        modalContainer.style.justifyContent = 'center';
        modalContainer.style.alignItems = 'center';
        modalContainer.style.overflowY = 'auto';
        modalContainer.style.padding = '1rem';
        modalContainer.innerHTML = modalHTML;
        
        // Add to body using ModalManager
        ModalManager.openModal(modalContainer);
        
        // Define event handlers
        const closeModalFunction = () => {
            ModalManager.closeModal(modalContainer);
        };
        
        const outsideClickFunction = (e) => {
            if (e.target === modalContainer) {
                closeModalFunction();
            }
        };
        
        // Add event listeners
        const closeBtn = modalContainer.querySelector('.close-modal');
        closeBtn.addEventListener('click', closeModalFunction);
        
        // Close tracking button
        const closeTrackingBtn = modalContainer.querySelector('.close-tracking-btn');
        closeTrackingBtn.addEventListener('click', closeModalFunction);
        
        // Close when clicking outside
        modalContainer.addEventListener('click', outsideClickFunction);
        
        // View details button
        const viewDetailsBtn = modalContainer.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                closeModalFunction();
                // Then open the details modal
                viewPortingRequestDetails(request._id);
            });
        }
        
        // Make sure scrolling works by forcing a reflow
        setTimeout(() => {
            const modalContent = modalContainer.querySelector('.modal-content');
            if (modalContent) {
                void modalContent.offsetHeight;
            }
        }, 100);
        
    } catch (error) {
        console.error('Error loading tracking information:', error);
        // Restore scrolling in case of errors
        ModalManager.closeAllModals();
        showNotification(error.message || 'Failed to load tracking information', 'error');
    }
}

/**
 * Create mock porting response data when API fails
 * @param {string} requestId - The request ID to use
 * @returns {Object} Mock response data
 */
function createMockPortingResponse(requestId) {
    // Current date for reference
    const currentDate = new Date();
    
    // Create a date 3 days ago for the creation date
    const createdAt = new Date();
    createdAt.setDate(currentDate.getDate() - 3);
    
    // Create a date 4 days in the future for the scheduled date
    const scheduledDate = new Date();
    scheduledDate.setDate(currentDate.getDate() + 4);
    
    // Create a date 7 days in the future for the expected completion
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(currentDate.getDate() + 7);
    
    // Create the mock timeline
    const timeline = [
        {
            status: 'pending',
            timestamp: createdAt.toISOString(),
            notes: 'Your porting request has been received and is being processed.'
        },
        {
            status: 'processing',
            timestamp: new Date(createdAt.getTime() + 86400000).toISOString(), // +1 day
            notes: 'Your request is under review by the carrier.'
        }
    ];
    
    // Only include approved status if the current date is past creation + 2 days
    const twoDaysAfterCreation = new Date(createdAt.getTime() + 172800000); // +2 days
    if (currentDate > twoDaysAfterCreation) {
        timeline.push({
            status: 'approved',
            timestamp: twoDaysAfterCreation.toISOString(),
            notes: 'Your porting request has been approved by the carrier.'
        });
    }
    
    return {
        success: true,
        data: {
            _id: requestId || 'mock-request-123',
            mobileNumber: '9876543210',
            currentProvider: 'Airtel',
            newProvider: 'Jio',
            status: timeline.length > 2 ? 'approved' : 'processing',
            createdAt: createdAt.toISOString(),
            scheduledDate: scheduledDate.toISOString(),
            expectedCompletionDate: expectedCompletionDate.toISOString(),
            notes: 'Customer requested port-in due to better network coverage.',
            timeline: timeline,
            statusHistory: timeline
        }
    };
}

/**
 * Set up event listeners for dashboard functionality
 */
function setupEventListeners() {
    // Profile edit button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.PortMySimAPI.auth.logout();
        });
    }
    
    // New porting request button
    const newPortingBtn = document.getElementById('new-porting-btn');
    if (newPortingBtn) {
        newPortingBtn.addEventListener('click', () => {
            window.location.href = '/HTML/schedule-porting.html';
        });
    }
    
    // Add tab system if tab elements exist
    setupTabSystem();
}

/**
 * Set up the tab system for the dashboard if tab elements exist
 */
function setupTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length === 0) return; // No tabs found
    
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Make sure first tab is active by default
    if (tabButtons.length > 0 && !document.querySelector('.tab-button.active')) {
        tabButtons[0].classList.add('active');
        
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        const firstTabContent = document.getElementById(firstTabId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Open the edit profile modal
 */
function openEditProfileModal() {
    // Get user data
    const user = window.PortMySimAPI.getUser();
    
    // Close any existing modals first
    ModalManager.closeAllModals();
    
    // Remove any existing loaders
    const loaders = document.querySelectorAll('.loader-overlay, .loader-container, .loading-indicator');
    loaders.forEach(loader => {
        if (loader.parentNode) {
            // First set its content to empty and visibility to hidden before removing
            loader.innerHTML = '';
            loader.style.visibility = 'hidden';
            loader.style.display = 'none';
            loader.parentNode.removeChild(loader);
        }
    });
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-content" style="background-color: #1e2837; color: #fff; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); overflow: hidden;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <h3 style="margin: 0; color: #fff;">Edit Profile</h3>
                <button class="close-modal" style="background: transparent; border: none; color: #999; font-size: 1.2rem; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <form id="edit-profile-form">
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label for="edit-name" style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Full Name</label>
                        <input type="text" id="edit-name" name="name" value="${user.name || ''}" style="width: 100%; padding: 0.8rem 1rem; background-color: #2a3547; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 1rem;" required>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label for="edit-email" style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Email Address</label>
                        <input type="email" id="edit-email" name="email" value="${user.email || ''}" style="width: 100%; padding: 0.8rem 1rem; background-color: #2a3547; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 1rem;" required>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 1.2rem;">
                        <label for="edit-phone" style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Phone Number</label>
                        <input type="tel" id="edit-phone" name="phone" value="${user.phone || ''}" style="width: 100%; padding: 0.8rem 1rem; background-color: #2a3547; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 1rem;" required>
                    </div>
                    
                    <button type="submit" style="background: #4a90e2; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; width: 100%;">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    // Create modal container with inline styles to ensure visibility
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.display = 'flex';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modalContainer.style.zIndex = '10000';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.overflowY = 'auto';
    modalContainer.innerHTML = modalHTML;
    
    // Add to body using ModalManager
    ModalManager.openModal(modalContainer);
    
    // Define event handlers
    const closeModalFunction = () => {
        ModalManager.closeModal(modalContainer);
    };
    
    const outsideClickFunction = (e) => {
        if (e.target === modalContainer) {
            closeModalFunction();
        }
    };
    
    // Add event listeners
    const closeModalButton = modalContainer.querySelector('.close-modal');
    closeModalButton.addEventListener('click', closeModalFunction);
    
    // Close when clicking outside the modal
    modalContainer.addEventListener('click', outsideClickFunction);
    
    // Get the form element
    const editProfileForm = document.getElementById('edit-profile-form');
    
    // Handle form submission
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('edit-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value
        };
        
        try {
            // Show loading indicator
            const submitButton = editProfileForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitButton.disabled = true;
            
            let apiSuccess = false;
            let response;
            
            try {
                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timed out')), 10000); // 10-second timeout
                });
                
                // Call the updateProfile API method with timeout
                response = await Promise.race([
                    window.PortMySimAPI.auth.updateProfile(formData),
                    timeoutPromise
                ]);
                
                apiSuccess = true;
            } catch (apiError) {
                console.error('API call failed:', apiError);
                // Force a simulated response since the API failed
                response = {
                    success: true,
                    message: 'Profile updated locally (API unavailable)',
                    localOnly: true
                };
            }
            
            // Check response
            if (response && response.success) {
                // Show appropriate message based on whether this was a real API update or local fallback
                showNotification(
                    response.localOnly 
                        ? 'Profile updated locally (server connection failed)' 
                        : 'Profile updated successfully', 
                    response.localOnly ? 'info' : 'success'
                );
                
                // Update localStorage user data to reflect changes
                const currentUser = window.PortMySimAPI.getUser();
                const updatedUser = {
                    ...currentUser,
                    ...formData
                };
                localStorage.setItem('portmysim_user', JSON.stringify(updatedUser));
                
                // Close the modal using ModalManager
                closeModalFunction();
                
                // Update UI
                updateUserProfile(updatedUser);
                
                // Update displayed username in the welcome message
                const userNameDisplay = document.getElementById('userName');
                if (userNameDisplay) {
                    userNameDisplay.textContent = formData.name;
                }
            } else {
                // Handle case where response exists but success is false
                showNotification(response?.message || 'Error updating profile', 'error');
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showNotification(error.message || 'Error updating profile. Please try again.', 'error');
            
            // Reset submit button
            const submitButton = editProfileForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = 'Save Changes';
                submitButton.disabled = false;
            }
        }
    });
}

/**
 * Show a notification to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to notifications container or create one
    let notificationsContainer = document.querySelector('.notifications-container');
    
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        notificationsContainer.style.position = 'fixed';
        notificationsContainer.style.top = '20px';
        notificationsContainer.style.right = '20px';
        notificationsContainer.style.zIndex = '9999';
        notificationsContainer.style.display = 'flex';
        notificationsContainer.style.flexDirection = 'column';
        notificationsContainer.style.gap = '10px';
        document.body.appendChild(notificationsContainer);
    }
    
    // Style the notification
    notification.style.backgroundColor = '#1e2837';
    notification.style.color = '#fff';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '12px';
    notification.style.animation = 'slideIn 0.3s ease forwards';
    
    if (type === 'success') {
        notification.style.borderLeft = '4px solid #4CAF50';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #F44336';
    } else {
        notification.style.borderLeft = '4px solid #4a90e2';
    }
    
    // Add to container
    notificationsContainer.appendChild(notification);
    
    // Define keyframes for animations
    if (!document.getElementById('notification-keyframes')) {
        const style = document.createElement('style');
        style.id = 'notification-keyframes';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes fadeOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notificationsContainer.removeChild(notification);
                
                // Remove container if empty
                if (notificationsContainer.children.length === 0) {
                    document.body.removeChild(notificationsContainer);
                }
            }
        }, 300);
    }, 5000);
}

/**
 * Create a sample porting request for testing purposes
 * This function should be called when no porting requests are found and user wants to create a test one
 */
async function createSamplePortingRequest() {
    try {
        // Get current user data
        const user = window.PortMySimAPI.getUser();
        if (!user) {
            showNotification('Please log in to create a porting request', 'error');
            return;
        }
        
        // Show notification that we're creating a sample request
        showNotification('Creating a sample porting request...', 'info');
        
        // Create sample request data
        const currentDate = new Date();
        const planEndDate = new Date(currentDate);
        planEndDate.setDate(planEndDate.getDate() + 14); // 2 weeks from now
        
        const scheduledDate = new Date(planEndDate);
        scheduledDate.setDate(scheduledDate.getDate() + 7); // 1 week after plan ends
        
        // Sample request payload
        const sampleRequest = {
            mobileNumber: '9' + Math.floor(Math.random() * 900000000 + 100000000), // Random 10-digit number starting with 9
            currentProvider: ['airtel', 'jio', 'vi', 'bsnl'][Math.floor(Math.random() * 4)],
            currentCircle: 'Delhi NCR',
            newProvider: ['airtel', 'jio', 'vi', 'bsnl'][Math.floor(Math.random() * 4)],
            planEndDate: planEndDate.toISOString().split('T')[0],
            scheduledDate: scheduledDate.toISOString().split('T')[0],
            timeSlot: ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)],
            fullName: user.name || 'Test User',
            email: user.email || 'test@example.com',
            alternateNumber: '9' + Math.floor(Math.random() * 900000000 + 100000000)
        };
        
        // Ensure current and new provider are different
        while (sampleRequest.currentProvider === sampleRequest.newProvider) {
            sampleRequest.newProvider = ['airtel', 'jio', 'vi', 'bsnl'][Math.floor(Math.random() * 4)];
        }
        
        // Submit the request
        const response = await window.PortMySimAPI.porting.submitPortingRequest(sampleRequest);
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to create sample porting request');
        }
        
        showNotification('Sample porting request created successfully!', 'success');
        
        // Reload the porting requests
        loadPortingRequests();
    } catch (error) {
        console.error('Error creating sample porting request:', error);
        showNotification(error.message || 'Failed to create sample porting request', 'error');
    }
}