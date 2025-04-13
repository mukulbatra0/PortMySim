/**
 * Dashboard functionality for PortMySim
 * Handles user profile, porting requests, and dashboard UI
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth state
    if (!window.PortMySimAPI || !window.PortMySimAPI.isAuthenticated()) {
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
        
        // Fetch porting requests
        const response = await fetch('/api/porting/requests', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('portmysim_auth_token')}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load porting requests');
        }
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load porting requests');
        }
        
        // Render porting requests
        if (data.data && data.data.length > 0) {
            renderPortingRequests(data.data, portingRequestsContainer);
        } else {
            // Show empty state
            portingRequestsContainer.innerHTML = `
                <div class="empty-state">
                    <img src="../images/submit-request.svg" alt="No porting requests" style="width: 150px; margin-bottom: 1rem;" />
                    <h3>No Porting Requests Yet</h3>
                    <p>You haven't submitted any porting requests yet.</p>
                    <a href="/HTML/schedule-porting.html" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> New Porting Request
                    </a>
                </div>
            `;
        }
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
    // Clear the container
    container.innerHTML = '';
    
    // Create table to display requests
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
            <th>Submission Date</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(tableHeader);
    
    // Create table body
    const tableBody = document.createElement('tbody');
    
    // Add each request as a row
    requests.forEach(request => {
        const row = document.createElement('tr');
        
        // Format date
        const submissionDate = new Date(request.createdAt);
        const formattedDate = submissionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Get status class
        let statusClass = '';
        switch (request.status) {
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'approved':
                statusClass = 'status-approved';
                break;
            case 'completed':
                statusClass = 'status-completed';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                break;
            default:
                statusClass = 'status-pending';
        }
        
        // Create row content
        row.innerHTML = `
            <td>${request.phoneNumber}</td>
            <td>
                <div class="provider-info">
                    <img src="../images/${request.currentProvider}.png" alt="${request.currentProvider}" />
                    <span>${request.currentProvider.charAt(0).toUpperCase() + request.currentProvider.slice(1)}</span>
                </div>
            </td>
            <td>
                <div class="provider-info">
                    <img src="../images/${request.newProvider}.png" alt="${request.newProvider}" />
                    <span>${request.newProvider.charAt(0).toUpperCase() + request.newProvider.slice(1)}</span>
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
    
    // Add event listeners to action buttons
    const viewButtons = document.querySelectorAll('.view-request');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const requestId = button.getAttribute('data-id');
            viewPortingRequestDetails(requestId);
        });
    });
    
    const trackButtons = document.querySelectorAll('.track-request');
    trackButtons.forEach(button => {
        button.addEventListener('click', () => {
            const requestId = button.getAttribute('data-id');
            trackPortingRequest(requestId);
        });
    });
}

/**
 * View details of a specific porting request
 * @param {string} requestId - ID of the request to view
 */
function viewPortingRequestDetails(requestId) {
    // Redirect to details page
    window.location.href = `/HTML/porting-details.html?id=${requestId}`;
}

/**
 * Track status of a specific porting request
 * @param {string} requestId - ID of the request to track
 */
function trackPortingRequest(requestId) {
    // Redirect to tracking page
    window.location.href = `/HTML/porting-track.html?id=${requestId}`;
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
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
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
    
    // Remove any existing modals
    const existingModal = document.querySelector('.modal-container');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal container with inline styles to ensure visibility
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.display = 'flex';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalContainer.style.zIndex = '9999';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.innerHTML = modalHTML;
    
    // Add to body
    document.body.appendChild(modalContainer);
    
    // Force a reflow to ensure the modal is rendered
    void modalContainer.offsetWidth;
    
    // Add event listeners
    const closeModalButton = modalContainer.querySelector('.close-modal');
    closeModalButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    // Close when clicking outside the modal
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
    
    // Handle form submission
    const editProfileForm = document.getElementById('edit-profile-form');
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
                
                // Close modal
                document.body.removeChild(modalContainer);
                
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