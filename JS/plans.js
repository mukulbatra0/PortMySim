// Import the API utilities
import { fetchPlansByOperator, comparePlans, fetchRecommendedPlans } from './api.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize plan comparison functionality
    initPlanComparison();
    
    // Load plans for comparison
    loadPlansForComparison();
    
    // FAQ Accordion
    initFaqAccordion();
    
    // Plan Card Hover Animation
    initPlanCardHover();
    
    // Intersection Observer for Animations
    initAnimations();
    
    // Smooth scroll to comparison section
    initSmoothScroll();
    
    // Update current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// FAQ Accordion
function initFaqAccordion() {
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
}

// Plan Card Hover Animation
function initPlanCardHover() {
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
}

// Initialize animations
function initAnimations() {
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
}

// Initialize smooth scroll
function initSmoothScroll() {
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
}

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
        // Get the comparison container
        const comparisonResult = document.getElementById('plans-comparison-result');
        
        // Clear any previous content and show loading indicator
        comparisonResult.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Comparing plans...</p></div>';
        comparisonResult.style.display = 'block';
        
        // Add styles for loader if not already present
        if (!document.querySelector('style#loader-styles')) {
            const loaderStyle = document.createElement('style');
            loaderStyle.id = 'loader-styles';
            loaderStyle.textContent = `
                .loading-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    text-align: center;
                }
                
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top-color: #3498db;
                    animation: spinner 1s ease-in-out infinite;
                    margin-bottom: 20px;
                }
                
                @keyframes spinner {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(loaderStyle);
        }
        
        // Get selected plan IDs
        selectedPlans = Array.from(planDropdowns)
            .filter(dropdown => dropdown.value)
            .map(dropdown => dropdown.value);
        
        console.log('Selected plans for comparison:', selectedPlans);
        
        // Compare plans via API
        comparePlans(selectedPlans)
            .then(comparisonData => {
                console.log('Received comparison data:', comparisonData);
                
                // Update comparison table with API data
                updateComparisonTable(comparisonData);
            })
            .catch(error => {
                console.error('Error comparing plans:', error);
                comparisonResult.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Failed to compare plans. Please try again.</p></div>';
                comparisonResult.style.display = 'block';
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
    // Get the comparison container
    const comparisonResult = document.getElementById('plans-comparison-result');
    if (!comparisonResult) {
        console.error('Comparison result container not found');
        return;
    }
    
    // Clear any previous content and show loading indicator
    comparisonResult.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading recommended plans...</p></div>';
    comparisonResult.style.display = 'block';
    
    // Add styles for loader if not already present
    if (!document.querySelector('style#loader-styles')) {
        const loaderStyle = document.createElement('style');
        loaderStyle.id = 'loader-styles';
        loaderStyle.textContent = `
            .loading-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
            }
            
            .spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top-color: #3498db;
                animation: spinner 1s ease-in-out infinite;
                margin-bottom: 20px;
            }
            
            @keyframes spinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(loaderStyle);
    }
    
    // Fetch recommended plans from API
    fetchRecommendedPlans()
        .then(plans => {
            console.log('Received recommended plans:', plans);
            
            // Check if we have at least 2 plans to compare
            if (plans && plans.length >= 2) {
                // Limit to 3 plans maximum for comparison
                const planIds = plans.slice(0, Math.min(plans.length, 3)).map(plan => plan._id || plan.name);
                console.log('Using plan IDs for comparison:', planIds);
                return comparePlans(planIds);
            } else {
                console.warn('Not enough recommended plans available, using sample data');
                // Not enough plans, throw error to trigger sample data fallback
                throw new Error('Not enough recommended plans available');
            }
        })
        .then(comparisonData => {
            console.log('Received comparison data:', comparisonData);
            
            // Update comparison table with API data
            updateComparisonTable(comparisonData);
        })
        .catch(error => {
            console.error('Error loading plans:', error);
            
            // Fall back to sample data if API fails
            const sampleComparisonData = {
                plans: [
                    {
                        operator: 'jio',
                        name: 'Jio Premium',
                        price: 399,
                        data: '3GB/day',
                        data_value: 90,
                        validity: 84,
                        validity_category: 'quarterly',
                        has_5g: true,
                        voice_calls: 'Unlimited',
                        sms: '100/day',
                        subscriptions: ['JioTV', 'JioCinema'],
                        network_coverage: 98,
                        data_speed: 50,
                        image: '../images/jio.jpeg',
                        recommendation: 'Best Value'
                    },
                    {
                        operator: 'airtel',
                        name: 'Airtel Smart',
                        price: 349,
                        data: '2.5GB/day',
                        data_value: 75,
                        validity: 56,
                        validity_category: 'quarterly',
                        has_5g: true,
                        voice_calls: 'Unlimited',
                        sms: '100/day',
                        subscriptions: ['Amazon Prime'],
                        network_coverage: 99,
                        data_speed: 100,
                        image: '../images/airtel.png',
                        recommendation: 'Best Data'
                    },
                    {
                        operator: 'vi',
                        name: 'Vi Value',
                        price: 329,
                        data: '2GB/day',
                        data_value: 60,
                        validity: 70,
                        validity_category: 'quarterly',
                        has_5g: false,
                        voice_calls: 'Unlimited',
                        sms: '100/day',
                        subscriptions: ['Vi Movies & TV'],
                        network_coverage: 92,
                        data_speed: 45,
                        image: '../images/vi.png',
                        recommendation: 'Budget Choice'
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
                    subscriptions: [true, false, false],
                    coverage: [false, true, false],
                    speed: [false, true, false]
                }
            };
            
            console.log('Using sample comparison data:', sampleComparisonData);
            
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
        
        console.log(`Selected operator: ${operator}`);
        
        // Fetch plans for selected operator from API
        fetchPlansByOperator(operator)
            .then(plans => {
                console.log(`Received ${plans.length} plans for ${operator}`);
                
                // Remove loading option
                planDropdown.removeChild(loadingOption);
                
                if (plans.length === 0) {
                    // Handle case with no plans
                    const noPlansOption = document.createElement('option');
                    noPlansOption.disabled = true;
                    noPlansOption.selected = true;
                    noPlansOption.textContent = 'No plans available';
                    planDropdown.appendChild(noPlansOption);
                    return;
                }
                
                // Populate plans for selected operator
                plans.forEach(plan => {
                    const option = document.createElement('option');
                    // Use plan._id or fallback to a generated ID if not available
                    option.value = plan._id || `${operator}-${plan.name}-${plan.price}`.replace(/\s+/g, '-');
                    option.textContent = `${plan.name} - ₹${plan.price} (${plan.data})`;
                    
                    try {
                        option.dataset.planData = JSON.stringify(plan);
                    } catch (e) {
                        console.error('Error stringifying plan data:', e);
                    }
                    
                    planDropdown.appendChild(option);
                });
                
                // Enable plan dropdown
                planDropdown.disabled = false;
            })
            .catch(error => {
                console.error('Error fetching plans:', error);
                
                // Remove loading option
                try {
                    planDropdown.removeChild(loadingOption);
                } catch (e) {
                    // Ignore if already removed
                }
                
                // Add error option
                const errorOption = document.createElement('option');
                errorOption.disabled = true;
                errorOption.selected = true;
                errorOption.textContent = 'Error loading plans';
                planDropdown.appendChild(errorOption);
                
                // Show error message
                showToast('Failed to load plans. Please try again.', 'error');
                
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
            { 
                _id: 'jio1', 
                name: 'Jio Freedom', 
                price: 299, 
                data: '2GB/day',
                data_value: 60,
                validity: 28,
                validity_category: 'monthly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: ['JioTV', 'JioCinema'],
                network_coverage: 98,
                data_speed: 50,
                plan_type: 'prepaid',
                data_category: 'medium',
                price_category: 'mid',
                operator: 'jio'
            },
            { 
                _id: 'jio2', 
                name: 'Jio Premium', 
                price: 399, 
                data: '3GB/day',
                data_value: 90,
                validity: 84,
                validity_category: 'quarterly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: ['JioTV', 'JioCinema', 'Disney+ Hotstar'],
                network_coverage: 98,
                data_speed: 50,
                plan_type: 'prepaid',
                data_category: 'high',
                price_category: 'mid',
                operator: 'jio'
            },
            { 
                _id: 'jio3', 
                name: 'Jio Ultimate', 
                price: 599, 
                data: '5GB/day',
                data_value: 150,
                validity: 84,
                validity_category: 'quarterly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: 'Unlimited',
                subscriptions: ['JioTV', 'JioCinema', 'Disney+ Hotstar', 'Amazon Prime'],
                network_coverage: 98,
                data_speed: 50,
                plan_type: 'prepaid',
                data_category: 'high',
                price_category: 'premium',
                operator: 'jio'
            }
        ],
        'airtel': [
            { 
                _id: 'airtel1', 
                name: 'Airtel Basic', 
                price: 249, 
                data: '1.5GB/day',
                data_value: 45,
                validity: 28,
                validity_category: 'monthly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: ['Wynk Music'],
                network_coverage: 99,
                data_speed: 60,
                plan_type: 'prepaid',
                data_category: 'medium',
                price_category: 'budget',
                operator: 'airtel'
            },
            { 
                _id: 'airtel2', 
                name: 'Airtel Smart', 
                price: 349, 
                data: '2.5GB/day',
                data_value: 75,
                validity: 56,
                validity_category: 'quarterly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: ['Wynk Music', 'Amazon Prime'],
                network_coverage: 99,
                data_speed: 100,
                plan_type: 'prepaid',
                data_category: 'high',
                price_category: 'mid',
                operator: 'airtel'
            },
            { 
                _id: 'airtel3', 
                name: 'Airtel Premium', 
                price: 499, 
                data: '4GB/day',
                data_value: 120,
                validity: 84,
                validity_category: 'quarterly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: 'Unlimited',
                subscriptions: ['Wynk Music', 'Amazon Prime', 'Disney+ Hotstar'],
                network_coverage: 99,
                data_speed: 100,
                plan_type: 'prepaid',
                data_category: 'high',
                price_category: 'premium',
                operator: 'airtel'
            }
        ],
        'vi': [
            { 
                _id: 'vi1', 
                name: 'Vi Weekend', 
                price: 199, 
                data: '1GB/day',
                data_value: 30,
                validity: 28,
                validity_category: 'monthly',
                has_5g: false,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: ['Vi Movies & TV'],
                network_coverage: 92,
                data_speed: 40,
                plan_type: 'prepaid',
                data_category: 'low',
                price_category: 'budget',
                operator: 'vi'
            },
            { 
                _id: 'vi2', 
                name: 'Vi Value', 
                price: 329, 
                data: '2GB/day',
                data_value: 60,
                validity: 70,
                validity_category: 'quarterly',
                has_5g: false,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: ['Vi Movies & TV'],
                network_coverage: 92,
                data_speed: 45,
                plan_type: 'prepaid',
                data_category: 'medium',
                price_category: 'mid',
                operator: 'vi'
            },
            { 
                _id: 'vi3', 
                name: 'Vi Premium', 
                price: 449, 
                data: '3GB/day',
                data_value: 90,
                validity: 84,
                validity_category: 'quarterly',
                has_5g: true,
                voice_calls: 'Unlimited',
                sms: 'Unlimited',
                subscriptions: ['Vi Movies & TV', 'SonyLIV Premium'],
                network_coverage: 92,
                data_speed: 45,
                plan_type: 'prepaid',
                data_category: 'high',
                price_category: 'premium',
                operator: 'vi'
            }
        ],
        'bsnl': [
            { 
                _id: 'bsnl1', 
                name: 'BSNL Value', 
                price: 149, 
                data: '1GB/day',
                data_value: 30,
                validity: 28,
                validity_category: 'monthly',
                has_5g: false,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: [],
                network_coverage: 85,
                data_speed: 20,
                plan_type: 'prepaid',
                data_category: 'low',
                price_category: 'budget',
                operator: 'bsnl'
            },
            { 
                _id: 'bsnl2', 
                name: 'BSNL Standard', 
                price: 279, 
                data: '2GB/day',
                data_value: 60,
                validity: 84,
                validity_category: 'quarterly',
                has_5g: false,
                voice_calls: 'Unlimited',
                sms: '100/day',
                subscriptions: [],
                network_coverage: 85,
                data_speed: 20,
                plan_type: 'prepaid',
                data_category: 'medium',
                price_category: 'mid',
                operator: 'bsnl'
            },
            { 
                _id: 'bsnl3', 
                name: 'BSNL Premium', 
                price: 399, 
                data: '3GB/day',
                data_value: 90,
                validity: 90,
                validity_category: 'quarterly',
                has_5g: false,
                voice_calls: 'Unlimited',
                sms: 'Unlimited',
                subscriptions: [],
                network_coverage: 85,
                data_speed: 20,
                plan_type: 'prepaid',
                data_category: 'high',
                price_category: 'premium',
                operator: 'bsnl'
            }
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
    
    if (!plans || plans.length === 0) {
        console.error('No plan data received for comparison');
        return;
    }
    
    console.log('Updating comparison table with data:', data);
    
    // Get the comparison result container
    const comparisonResult = document.getElementById('plans-comparison-result');
    if (!comparisonResult) {
        console.error('Comparison result container not found');
        return;
    }
    
    // Clear any previous content
    comparisonResult.innerHTML = '';
    
    // Create structure if it doesn't exist
    const tableContainer = document.createElement('div');
    tableContainer.className = 'comparison-table-container';
    
    // Create table structure
    const tableHTML = `
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Feature</th>
                    ${plans.map((_, i) => `<th class="plan-header plan-${i+1}"></th>`).join('')}
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    tableContainer.innerHTML = tableHTML;
    
    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'text-summary-container';
    summaryContainer.innerHTML = '<div class="comparison-summary"></div>';
    
    // Create value meters container
    const metersContainer = document.createElement('div');
    metersContainer.className = 'value-meters-container';
    
    // Add value meters for each plan
    plans.forEach((plan, index) => {
        const meterHTML = `
            <div class="value-meter ${plan.operator}">
                <div class="meter-label">Value for <span>${plan.name}</span></div>
                <div class="meter-container">
                    <div class="meter-fill"></div>
                    <div class="meter-value">0/10</div>
                </div>
            </div>
        `;
        metersContainer.innerHTML += meterHTML;
    });
    
    // Add all containers to the result
    comparisonResult.appendChild(tableContainer);
    comparisonResult.appendChild(summaryContainer);
    comparisonResult.appendChild(metersContainer);
    
    // Get the table and populate it
    const table = tableContainer.querySelector('table');
    if (table) {
        // Update headers
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            // Keep the first cell (feature header)
            const featureCell = headerRow.querySelector('th:first-child');
            headerRow.innerHTML = '';
            headerRow.appendChild(featureCell);
            
            // Add plan header cells
            plans.forEach((plan, index) => {
                const headerCell = document.createElement('th');
                headerCell.className = `plan-header plan-${index + 1}`;
                headerCell.innerHTML = `
                    <div class="plan-header-content">
                        <img src="${plan.image || `../images/${plan.operator}.png`}" alt="${plan.operator}" class="operator-icon">
                        <div class="plan-info">
                            <h3>${plan.name}</h3>
                            <div class="price">₹${plan.price} <span>/${plan.validity_category || 'month'}</span></div>
                        </div>
                    </div>
                `;
                headerRow.appendChild(headerCell);
            });
        }
        
        // Now create and add rows for each feature
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Clear any existing rows
            
            // Data feature
            const dataRow = document.createElement('tr');
            dataRow.innerHTML = `<td class="feature-name">Daily Data</td>`;
            plans.forEach((plan, index) => {
                const isHighlight = features.daily_data && features.daily_data[index];
                dataRow.innerHTML += `<td class="feature-value ${isHighlight ? 'best' : ''}">${plan.data || 'N/A'}</td>`;
            });
            tbody.appendChild(dataRow);
            
            // Validity feature
            const validityRow = document.createElement('tr');
            validityRow.innerHTML = `<td class="feature-name">Validity</td>`;
            plans.forEach((plan, index) => {
                const isHighlight = features.validity && features.validity[index];
                validityRow.innerHTML += `<td class="feature-value ${isHighlight ? 'best' : ''}">${plan.validity || 'N/A'} days</td>`;
            });
            tbody.appendChild(validityRow);
            
            // Voice calls feature
            const callsRow = document.createElement('tr');
            callsRow.innerHTML = `<td class="feature-name">Voice Calls</td>`;
            plans.forEach((plan) => {
                callsRow.innerHTML += `<td class="feature-value best">${plan.voice_calls || 'Unlimited'}</td>`;
            });
            tbody.appendChild(callsRow);
            
            // SMS feature
            const smsRow = document.createElement('tr');
            smsRow.innerHTML = `<td class="feature-name">SMS</td>`;
            plans.forEach((plan) => {
                const isUnlimited = plan.sms === 'Unlimited';
                smsRow.innerHTML += `<td class="feature-value ${isUnlimited ? 'best' : ''}">${plan.sms || '100/day'}</td>`;
            });
            tbody.appendChild(smsRow);
            
            // 5G feature
            const fiveGRow = document.createElement('tr');
            fiveGRow.innerHTML = `<td class="feature-name">5G Access</td>`;
            plans.forEach((plan) => {
                const has5G = plan.has_5g;
                fiveGRow.innerHTML += `<td class="feature-value ${has5G ? 'best' : ''}">
                    ${has5G ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                </td>`;
            });
            tbody.appendChild(fiveGRow);
            
            // Subscriptions feature
            const subsRow = document.createElement('tr');
            subsRow.innerHTML = `<td class="feature-name">Bundled Subscriptions</td>`;
            plans.forEach((plan, index) => {
                const subs = plan.subscriptions && plan.subscriptions.length > 0 ? 
                    plan.subscriptions.join(', ') : 'None';
                const isHighlight = features.subscriptions && features.subscriptions[index];
                subsRow.innerHTML += `<td class="feature-value ${isHighlight ? 'best' : ''}">${subs}</td>`;
            });
            tbody.appendChild(subsRow);
            
            // Network Coverage feature
            const coverageRow = document.createElement('tr');
            coverageRow.innerHTML = `<td class="feature-name">Network Coverage</td>`;
            plans.forEach((plan, index) => {
                const isHighlight = features.coverage && features.coverage[index];
                coverageRow.innerHTML += `<td class="feature-value ${isHighlight ? 'best' : ''}">${plan.network_coverage || 'N/A'}%</td>`;
            });
            tbody.appendChild(coverageRow);
            
            // Data Speed feature
            const speedRow = document.createElement('tr');
            speedRow.innerHTML = `<td class="feature-name">Data Speed</td>`;
            plans.forEach((plan, index) => {
                const isHighlight = features.speed && features.speed[index];
                speedRow.innerHTML += `<td class="feature-value ${isHighlight ? 'best' : ''}">${plan.data_speed || 'N/A'} Mbps</td>`;
            });
            tbody.appendChild(speedRow);
            
            // Extra Benefits feature
            const benefitsRow = document.createElement('tr');
            benefitsRow.innerHTML = `<td class="feature-name">Extra Benefits</td>`;
            plans.forEach((plan) => {
                const benefits = plan.extra_benefits && plan.extra_benefits.length > 0 ? 
                    plan.extra_benefits.join(', ') : 'None';
                benefitsRow.innerHTML += `<td class="feature-value">${benefits}</td>`;
            });
            tbody.appendChild(benefitsRow);
        }
    }
    
    // Display comparison summary if available
    if (data.summary) {
        const summaryElement = summaryContainer.querySelector('.comparison-summary');
        if (summaryElement) {
            summaryElement.innerHTML = data.summary.replace(/\n/g, '<br>');
            summaryElement.style.display = 'block';
        }
    }
    
    // Update value meters
    plans.forEach((plan, index) => {
        if (valueScores && valueScores[index]) {
            const score = valueScores[index].score;
            const meterFill = metersContainer.querySelector(`.value-meter.${plan.operator} .meter-fill`);
            if (meterFill) {
                meterFill.style.width = `${score * 10}%`;
            }
            
            const meterValue = metersContainer.querySelector(`.value-meter.${plan.operator} .meter-value`);
            if (meterValue) {
                meterValue.textContent = `${score.toFixed(1)}/10`;
            }
            
            const meterLabel = metersContainer.querySelector(`.value-meter.${plan.operator} .meter-label span`);
            if (meterLabel) {
                meterLabel.textContent = plan.name;
            }
        }
    });
    
    // Add additional styles if needed
    const style = document.createElement('style');
    style.textContent = `
        /* Comparison Table Styles */
        .comparison-table-container {
            overflow-x: auto;
            margin: 30px 0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border-radius: 10px;
            animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .comparison-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .comparison-table thead {
            background: #3498db;
            color: white;
        }
        
        .comparison-table th {
            padding: 18px 15px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 0.5px;
            border: none;
            text-align: center;
            position: sticky;
            top: 0;
        }
        
        .comparison-table th:first-child {
            text-align: left;
            background: #3498db;
            color: white;
            border-radius: 10px 0 0 0;
        }
        
        .comparison-table td {
            padding: 16px 15px;
            text-align: center;
            border-bottom: 1px solid #eee;
            transition: background-color 0.3s ease;
            font-size: 15px;
        }
        
        .comparison-table tr:last-child td {
            border-bottom: none;
        }
        
        .comparison-table td:first-child {
            text-align: left;
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
            position: sticky;
            left: 0;
        }
        
        .comparison-table tr:hover td:not(:first-child) {
            background-color: #f5f9ff;
        }
        
        /* Plan Header Styling */
        .plan-header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 5px;
        }
        
        .plan-header-content img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: contain;
            background-color: white;
            padding: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
            animation: scaleIn 0.5s ease-out forwards;
        }
        
        .plan-header-content .plan-info {
            margin-top: 6px;
            text-align: center;
        }
        
        .plan-header-content h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            white-space: nowrap;
        }
        
        .plan-header-content .price {
            font-size: 18px;
            font-weight: 700;
            color: white;
        }
        
        .plan-header-content .price span {
            font-size: 14px;
            opacity: 0.9;
        }
        
        /* Feature Value Styling */
        .feature-value {
            font-weight: 500;
            transition: all 0.3s ease;
            color: #444;
        }
        
        .feature-value.best {
            background-color: rgba(52, 152, 219, 0.1);
            font-weight: 700;
            color: #3498db;
            border-left: 3px solid #3498db;
            border-right: 3px solid #3498db;
            animation: pulseFade 2s infinite;
        }
        
        .feature-value i.fas.fa-check {
            color: #2ecc71;
            font-size: 18px;
        }
        
        .feature-value i.fas.fa-times {
            color: #e74c3c;
            font-size: 18px;
        }
        
        /* Value Meters Styling */
        .value-meters-container {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin: 40px 0;
            animation: fadeInUp 1s ease-out forwards;
            animation-delay: 0.3s;
            opacity: 0;
        }
        
        .value-meter {
            width: 30%;
            margin-bottom: 30px;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .value-meter:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        
        .meter-label {
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 16px;
            color: #333;
        }
        
        .meter-container {
            height: 20px;
            background-color: #f1f1f1;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .meter-fill {
            height: 100%;
            transition: width 1.5s cubic-bezier(0.19, 1, 0.22, 1);
            width: 0;
        }
        
        /* Operator-specific colors */
        .value-meter.jio .meter-fill {
            background: #0f3cc9;
        }
        
        .value-meter.airtel .meter-fill {
            background: #e40000;
        }
        
        .value-meter.vi .meter-fill {
            background: #ED1C24;
        }
        
        .value-meter.bsnl .meter-fill {
            background: #1d965c;
        }
        
        .meter-value {
            position: absolute;
            top: 0;
            right: 10px;
            font-size: 13px;
            line-height: 20px;
            color: #333;
            font-weight: 700;
            text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
        }
        
        /* Summary Container Styling */
        .text-summary-container {
            margin: 30px 0;
            padding: 22px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
            animation: fadeInUp 1.2s ease-out forwards;
            animation-delay: 0.5s;
            opacity: 0;
        }
        
        .comparison-summary {
            line-height: 1.7;
            font-size: 15px;
            color: #444;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes pulseFade {
            0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
            70% { box-shadow: 0 0 0 8px rgba(52, 152, 219, 0); }
            100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
        }
        
        /* Responsive styles */
        @media (max-width: 992px) {
            .value-meter {
                width: 45%;
            }
        }
        
        @media (max-width: 768px) {
            .value-meter {
                width: 100%;
            }
            
            .comparison-table th, 
            .comparison-table td {
                padding: 15px 10px;
                font-size: 14px;
            }
            
            .plan-header-content img {
                width: 40px;
                height: 40px;
            }
            
            .plan-header-content h3 {
                font-size: 14px;
            }
            
            .plan-header-content .price {
                font-size: 16px;
            }
            
            .text-summary-container {
                padding: 18px 15px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Apply animations to table elements
    setTimeout(() => {
        // Get the tbody element
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // Add staggered animation to table rows
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.animation = `fadeInUp 0.5s ease-out forwards`;
            row.style.animationDelay = `${0.1 + (index * 0.05)}s`;
            row.style.opacity = '0';
        });
        
        // Animate the best values with a delay
        const bestValues = tbody.querySelectorAll('.feature-value.best');
        bestValues.forEach((cell, index) => {
            cell.style.animationDelay = `${1 + (index * 0.1)}s`;
        });
        
        // Apply meter animations with delay
        metersContainer.querySelectorAll('.value-meter').forEach((meter, index) => {
            meter.style.animationDelay = `${0.7 + (index * 0.2)}s`;
        });
    }, 100);
    
    // Show the comparison result
    comparisonResult.style.display = 'block';
    
    // Scroll to result after a short delay to ensure everything is rendered
    setTimeout(() => {
        comparisonResult.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
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