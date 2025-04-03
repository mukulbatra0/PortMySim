// Import the API utilities
import { fetchPlansByOperator, comparePlans, fetchRecommendedPlans } from './api.js';

// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = question.classList.contains('active');
        
        // Close all other answers
        faqQuestions.forEach(q => {
            if (q !== question) {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            }
        });
        
        // Toggle current answer
        question.classList.toggle('active');
        answer.classList.toggle('active');
    });
});

// Plan Card Hover Animation
const planCards = document.querySelectorAll('.plan-card');

planCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        planCards.forEach(c => {
            if (c !== card) {
                c.style.transform = 'scale(0.95)';
                c.style.opacity = '0.7';
            }
        });
    });
    
    card.addEventListener('mouseleave', () => {
        planCards.forEach(c => {
            c.style.transform = '';
            c.style.opacity = '';
        });
    });
});

// Intersection Observer for Animations
const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.1
});

// Observe elements for animation
document.querySelectorAll('.plan-card, .faq-item').forEach(element => {
    observer.observe(element);
});

// Smooth scroll to comparison section
const comparisonLinks = document.querySelectorAll('a[href="#comparison"]');
comparisonLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const comparisonSection = document.querySelector('.plan-comparison');
        comparisonSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Update current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Plans page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Plan comparison functionality
    initPlanComparison();
    
    // Load plan details from API for the comparison section
    loadPlansForComparison();
});

/**
 * Initialize plan comparison functionality
 */
function initPlanComparison() {
    const operatorDropdowns = document.querySelectorAll('.operator-dropdown');
    const planDropdowns = document.querySelectorAll('.plan-dropdown');
    const compareBtn = document.getElementById('compare-plans-btn');
    const resetBtn = document.getElementById('reset-comparison-btn');
    const comparisonResult = document.getElementById('plans-comparison-result');
    
    // Store selected plan IDs
    let selectedPlans = [];
    
    // Handle operator selection
    operatorDropdowns.forEach((dropdown, index) => {
        dropdown.addEventListener('change', function() {
            handleOperatorSelection(this, index);
            updateCompareButtonState();
        });
    });
    
    // Handle plan selection
    planDropdowns.forEach((dropdown, index) => {
        dropdown.addEventListener('change', function() {
            updateCompareButtonState();
        });
    });
    
    // Handle compare button click
    compareBtn.addEventListener('click', function() {
        // Show loading indicator
        comparisonResult.innerHTML = '<div class="loading-indicator"><div class="loader"></div><p>Comparing plans...</p></div>';
        comparisonResult.style.display = 'block';
        
        // Get selected plan IDs
        selectedPlans = Array.from(planDropdowns)
            .filter(dropdown => dropdown.value)
            .map(dropdown => dropdown.value);
        
        // Compare plans via API
        comparePlans(selectedPlans)
            .then(comparisonData => {
                // Update comparison table with API data
                updateComparisonTable(comparisonData);
                
                // Scroll to comparison result
                comparisonResult.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            })
            .catch(error => {
                console.error('Error comparing plans:', error);
                comparisonResult.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Failed to compare plans. Please try again.</p></div>';
                showToast('Failed to compare plans', 'error');
            });
    });
    
    // Handle reset button click
    resetBtn.addEventListener('click', function() {
        // Reset all dropdowns
        operatorDropdowns.forEach(dropdown => {
            dropdown.value = '';
        });
        
        planDropdowns.forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select Plan</option>';
            dropdown.disabled = true;
        });
        
        // Disable compare button
        compareBtn.disabled = true;
        
        // Clear selected plans
        selectedPlans = [];
    });
    
    // Check if we can enable compare button
    function updateCompareButtonState() {
        const selectedCount = Array.from(planDropdowns)
            .filter(dropdown => dropdown.value)
            .length;
        
        compareBtn.disabled = selectedCount < 2;
    }
}

/**
 * Load plan details from API for the comparison section
 */
function loadPlansForComparison() {
    // Show loading indicator
    const comparisonResult = document.getElementById('plans-comparison-result');
    if (comparisonResult) {
        comparisonResult.innerHTML = '<div class="loading-indicator"><div class="loader"></div><p>Loading plans...</p></div>';
    }
    
    // Fetch recommended plans from API
    fetchRecommendedPlans()
        .then(plans => {
            if (plans && plans.length >= 3) {
                const planIds = plans.slice(0, 3).map(plan => plan._id);
                return comparePlans(planIds);
            } else {
                throw new Error('Not enough recommended plans available');
            }
        })
        .then(comparisonData => {
            // Update comparison table with API data
            updateComparisonTable(comparisonData);
        })
        .catch(error => {
            console.error('Error loading plans:', error);
            
            // Fall back to sample data if API fails
            const sampleComparisonData = {
                plans: [
                    {
                        operator: 'Jio',
                        name: 'Jio Premium',
                        price: 399,
                        data: '3GB/day',
                        validity: 84,
                        validity_category: 'quarterly',
                        has_5g: true,
                        subscriptions: ['Netflix', 'Disney+'],
                        image: '../images/jio.jpeg',
                        recommendation: 'Best Value'
                    },
                    {
                        operator: 'Airtel',
                        name: 'Airtel Smart',
                        price: 349,
                        data: '2.5GB/day',
                        validity: 56,
                        validity_category: 'quarterly',
                        has_5g: true,
                        subscriptions: ['Amazon Prime'],
                        image: '../images/airtel.png',
                        recommendation: 'Best Data'
                    },
                    {
                        operator: 'Vi',
                        name: 'Vi Value',
                        price: 329,
                        data: '2GB/day',
                        validity: 70,
                        validity_category: 'quarterly',
                        has_5g: false,
                        subscriptions: [],
                        image: '../images/vi.png',
                        recommendation: 'Budget'
                    }
                ],
                valueScores: [
                    { score: 8.5 },
                    { score: 7.8 },
                    { score: 6.9 }
                ],
                features: {
                    daily_data: [true, false, false],
                    validity: [true, false, false],
                    price: [false, true, false],
                    subscriptions: [true, false, false]
                }
            };
            
            // Update with sample data
            updateComparisonTable(sampleComparisonData);
            
            // Show toast error message
            showToast('Using sample data - API error', 'error');
        });
}

/**
 * Handle operator selection
 */
function handleOperatorSelection(dropdown, index) {
    const operator = dropdown.value;
    const planDropdown = document.querySelectorAll('.plan-dropdown')[index];
    
    // Clear existing options
    planDropdown.innerHTML = '<option value="">Select Plan</option>';
    
    if (operator) {
        // Show loading indicator in dropdown
        const loadingOption = document.createElement('option');
        loadingOption.disabled = true;
        loadingOption.selected = true;
        loadingOption.textContent = 'Loading plans...';
        planDropdown.appendChild(loadingOption);
        
        // Fetch plans for selected operator from API
        fetchPlansByOperator(operator)
            .then(plans => {
                // Remove loading option
                planDropdown.removeChild(loadingOption);
                
                // Populate plans for selected operator
                plans.forEach(plan => {
                    const option = document.createElement('option');
                    option.value = plan._id;
                    option.textContent = `${plan.name} - ₹${plan.price} (${plan.data})`;
                    option.dataset.planData = JSON.stringify(plan);
                    planDropdown.appendChild(option);
                });
                
                // Enable plan dropdown
                planDropdown.disabled = false;
            })
            .catch(error => {
                console.error('Error fetching plans:', error);
                
                // Remove loading option
                planDropdown.removeChild(loadingOption);
                
                // Add error option
                const errorOption = document.createElement('option');
                errorOption.disabled = true;
                errorOption.selected = true;
                errorOption.textContent = 'Error loading plans';
                planDropdown.appendChild(errorOption);
                
                // Show error message
                showToast('Failed to load plans', 'error');
                
                // Add sample data for development/demo purposes
                addSamplePlans(planDropdown, operator);
            });
    } else {
        // Disable plan dropdown if no operator is selected
        planDropdown.disabled = true;
    }
}

/**
 * Animation on scroll functionality
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.content-transition');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Toast notification system
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add style for toast container if not already in CSS
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .toast {
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                min-width: 300px;
                max-width: 400px;
                animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s forwards;
                opacity: 0;
                transform: translateY(100%);
            }
            
            .toast i {
                margin-right: 12px;
                font-size: 18px;
            }
            
            .toast.success {
                background-color: #4CAF50;
            }
            
            .toast.error {
                background-color: #F44336;
            }
            
            .toast.warning {
                background-color: #FFC107;
                color: #333;
            }
            
            .toast.info {
                background-color: #2196F3;
            }
            
            @keyframes toast-in {
                from {
                    opacity: 0;
                    transform: translateY(100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes toast-out {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        default:
            icon = 'fas fa-info-circle';
    }
    
    toast.innerHTML = `<i class="${icon}"></i>${message}`;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Force reflow to trigger animation
    void toast.offsetWidth;
    
    // Add animation class
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize animation on scroll
animateOnScroll();

/**
 * Add sample plans for development purposes
 */
function addSamplePlans(dropdown, operator) {
    const samplePlans = {
        'jio': [
            { _id: 'jio1', name: 'Jio Freedom', price: 299, data: '2GB/day' },
            { _id: 'jio2', name: 'Jio Premium', price: 399, data: '3GB/day' },
            { _id: 'jio3', name: 'Jio Ultimate', price: 599, data: '5GB/day' }
        ],
        'airtel': [
            { _id: 'airtel1', name: 'Airtel Basic', price: 249, data: '1.5GB/day' },
            { _id: 'airtel2', name: 'Airtel Smart', price: 349, data: '2.5GB/day' },
            { _id: 'airtel3', name: 'Airtel Premium', price: 499, data: '4GB/day' }
        ],
        'vi': [
            { _id: 'vi1', name: 'Vi Weekend', price: 199, data: '1GB/day' },
            { _id: 'vi2', name: 'Vi Value', price: 329, data: '2GB/day' },
            { _id: 'vi3', name: 'Vi Premium', price: 449, data: '3GB/day' }
        ],
        'bsnl': [
            { _id: 'bsnl1', name: 'BSNL Value', price: 149, data: '1GB/day' },
            { _id: 'bsnl2', name: 'BSNL Standard', price: 279, data: '2GB/day' },
            { _id: 'bsnl3', name: 'BSNL Premium', price: 399, data: '3GB/day' }
        ]
    };
    
    if (samplePlans[operator]) {
        samplePlans[operator].forEach(plan => {
            const option = document.createElement('option');
            option.value = plan._id;
            option.textContent = `${plan.name} - ₹${plan.price} (${plan.data})`;
            option.dataset.planData = JSON.stringify(plan);
            dropdown.appendChild(option);
        });
        
        // Enable plan dropdown
        dropdown.disabled = false;
    }
}

/**
 * Function to update comparison table with API data
 */
function updateComparisonTable(data) {
    const { plans, valueScores, features } = data;
    
    // Update plan headers
    const planHeaders = document.querySelectorAll('.plan-header');
    plans.forEach((plan, index) => {
        if (index < planHeaders.length) {
            const header = planHeaders[index];
            const headerContent = header.querySelector('.plan-header-content');
            headerContent.innerHTML = `
                <img src="${plan.image}" alt="${plan.operator}" class="operator-icon">
                <div class="plan-info">
                    <h3>${plan.name}</h3>
                    <div class="price">₹${plan.price} <span>/${plan.validity_category}</span></div>
                </div>
            `;
        }
    });
    
    // Update feature rows
    // This is a simplified example - in a real application you would dynamically generate all rows
    const rows = document.querySelectorAll('.comparison-table tbody tr');
    
    // Update Daily Data row
    if (rows.length > 0) {
        const dataRow = rows[0];
        const dataCells = dataRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < dataCells.length) {
                dataCells[index].textContent = plan.data;
                dataCells[index].classList.toggle('best', features.daily_data[index]);
            }
        });
    }
    
    // Update Validity row
    if (rows.length > 1) {
        const validityRow = rows[1];
        const validityCells = validityRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < validityCells.length) {
                validityCells[index].textContent = `${plan.validity} days`;
                validityCells[index].classList.toggle('best', features.validity[index]);
            }
        });
    }
    
    // Update Voice Calls row
    if (rows.length > 2) {
        const callsRow = rows[2];
        const callsCells = callsRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < callsCells.length) {
                callsCells[index].textContent = plan.voice_calls;
                callsCells[index].classList.toggle('best', true); // All plans typically have unlimited calls
            }
        });
    }
    
    // Update SMS row
    if (rows.length > 3) {
        const smsRow = rows[3];
        const smsCells = smsRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < smsCells.length) {
                smsCells[index].textContent = plan.sms;
                smsCells[index].classList.toggle('best', plan.sms === 'Unlimited');
            }
        });
    }
    
    // Update 5G row
    if (rows.length > 4) {
        const fiveGRow = rows[4];
        const fiveGCells = fiveGRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < fiveGCells.length) {
                fiveGCells[index].innerHTML = plan.has_5g ? 
                    '<i class="fas fa-check"></i>' : 
                    '<i class="fas fa-times"></i>';
                fiveGCells[index].classList.toggle('best', plan.has_5g);
            }
        });
    }
    
    // Update Subscriptions row
    if (rows.length > 5) {
        const subRow = rows[5];
        const subCells = subRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < subCells.length) {
                subCells[index].textContent = plan.subscriptions && plan.subscriptions.length > 0 ? 
                    plan.subscriptions.join(', ') : 
                    'None';
                subCells[index].classList.toggle('best', features.subscriptions && features.subscriptions[index]);
            }
        });
    }
    
    // Update Network Coverage row
    if (rows.length > 6) {
        const coverageRow = rows[6];
        const coverageCells = coverageRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < coverageCells.length) {
                coverageCells[index].textContent = plan.network_coverage ? `${plan.network_coverage}%` : 'N/A';
                coverageCells[index].classList.toggle('best', features.coverage && features.coverage[index]);
            }
        });
    }
    
    // Update Data Speed row
    if (rows.length > 7) {
        const speedRow = rows[7];
        const speedCells = speedRow.querySelectorAll('.feature-value');
        plans.forEach((plan, index) => {
            if (index < speedCells.length) {
                speedCells[index].textContent = plan.data_speed ? `${plan.data_speed} Mbps` : 'N/A';
                speedCells[index].classList.toggle('best', features.speed && features.speed[index]);
            }
        });
    }
    
    // Display comparison summary if available
    if (data.summary) {
        const summaryElement = document.querySelector('.comparison-summary');
        if (summaryElement) {
            summaryElement.textContent = data.summary;
            summaryElement.style.display = 'block';
        }
    }
    
    // Show the comparison result
    const comparisonResult = document.getElementById('plans-comparison-result');
    if (comparisonResult) {
        comparisonResult.style.display = 'block';
        
        // Add animation class to trigger animations
        const elements = comparisonResult.querySelectorAll('.content-transition');
        elements.forEach(el => {
            el.classList.add('animate');
        });
    }
}

/**
 * Helper function to get badge class based on recommendation
 */
function getBadgeClass(recommendation) {
    switch (recommendation) {
        case 'Best Value': return 'best-value';
        case 'Best Data': return 'best-data';
        case 'Budget Choice': return 'budget';
        case 'Widest Coverage': return 'coverage';
        default: return '';
    }
} 