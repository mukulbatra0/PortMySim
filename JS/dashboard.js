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
                    <img src="../images/empty-requests.svg" alt="No porting requests" />
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
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Profile</h3>
                <button class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="edit-name">Full Name</label>
                        <input type="text" id="edit-name" name="name" value="${user.name}" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-email">Email Address</label>
                        <input type="email" id="edit-email" name="email" value="${user.email}" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-phone">Phone Number</label>
                        <input type="tel" id="edit-phone" name="phone" value="${user.phone}" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.innerHTML = modalHTML;
    
    // Add to body
    document.body.appendChild(modalContainer);
    
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
            // Update profile API call would go here
            // const response = await window.PortMySimAPI.user.updateProfile(formData);
            
            // For now, just simulate success
            showNotification('Profile updated successfully', 'success');
            
            // Close modal
            document.body.removeChild(modalContainer);
            
            // Update UI
            updateUserProfile({
                ...user,
                ...formData
            });
        } catch (error) {
            showNotification('Error updating profile', 'error');
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
        document.body.appendChild(notificationsContainer);
    }
    
    // Add to container
    notificationsContainer.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        
        // Remove from DOM after animation
        setTimeout(() => {
            notificationsContainer.removeChild(notification);
            
            // Remove container if empty
            if (notificationsContainer.children.length === 0) {
                document.body.removeChild(notificationsContainer);
            }
        }, 300);
    }, 5000);
} 