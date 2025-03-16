// Contact Page Dropdown Animations
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing custom dropdowns');
    initCustomDropdowns();
});

// Initialize custom dropdowns with animations
function initCustomDropdowns() {
    // Find all select elements with id 'subject' or class 'form-control'
    const selectElements = document.querySelectorAll('select#subject, select.form-control');
    console.log('Found select elements:', selectElements.length);
    
    // Track active dropdowns
    let activeDropdown = null;
    
    selectElements.forEach((select, index) => {
        // Skip if select is already customized
        if (select.dataset.customized === 'true' || select.style.display === 'none') {
            console.log('Skipping already customized select:', select.id || 'unnamed');
            return;
        }
        
        console.log(`Processing select #${index}:`, select.id || 'unnamed');
        // Create wrapper for custom dropdown
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-dropdown-wrapper';
        
        // Create trigger element (what user clicks on)
        const trigger = document.createElement('div');
        trigger.className = 'dropdown-trigger';
        
        // Add icon and text to trigger
        trigger.innerHTML = `
            <span class="trigger-text">${select.options[select.selectedIndex]?.text || 'Select an option'}</span>
            <i class="dropdown-arrow fas fa-chevron-down"></i>
        `;
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'dropdown-options';
        
        // Hide the original select
        select.style.display = 'none';
        
        // Mark this select as customized
        select.dataset.customized = 'true';
        
        // Populate options from select
        Array.from(select.options).forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'dropdown-option';
            optionElement.dataset.value = option.value;
            optionElement.textContent = option.text;
            
            // Set selected class if this option is selected
            if (index === select.selectedIndex) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Update the original select value
                select.value = option.value;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
                
                // Update trigger text
                trigger.querySelector('.trigger-text').textContent = option.text;
                
                // Add selected class to this option and remove from others
                Array.from(optionsContainer.children).forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElement.classList.add('selected');
                
                // Show selection animation
                optionElement.classList.add('option-selected');
                setTimeout(() => {
                    optionElement.classList.remove('option-selected');
                }, 500);
                
                // Close dropdown with animation
                optionsContainer.classList.remove('open');
                trigger.classList.remove('open');
                trigger.classList.add('pulse');
                setTimeout(() => {
                    trigger.classList.remove('pulse');
                }, 300);
                
                // Animate the form icon if present
                const formGroup = select.closest('.form-group');
                if (formGroup) {
                    const icon = formGroup.querySelector('.input-with-icon i');
                    if (icon) {
                        icon.classList.add('selection-celebration');
                        setTimeout(() => {
                            icon.classList.remove('selection-celebration');
                        }, 1000);
                    }
                }
                
                // Reset active dropdown
                activeDropdown = null;
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Toggle dropdown when clicking trigger
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // If this dropdown is already open, close it
            if (optionsContainer.classList.contains('open')) {
                optionsContainer.classList.remove('open');
                trigger.classList.remove('open');
                activeDropdown = null;
                return;
            }
            
            // Close other open dropdowns
            if (activeDropdown) {
                activeDropdown.optionsContainer.classList.remove('open');
                activeDropdown.trigger.classList.remove('open');
            }
            
            // Toggle this dropdown
            optionsContainer.classList.add('open');
            trigger.classList.add('open');
            
            // Set as active dropdown
            activeDropdown = {
                optionsContainer,
                trigger
            };
            
            // Add ripple effect
            const rect = trigger.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            trigger.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Animate the form icon if present
            const formGroup = select.closest('.form-group');
            if (formGroup) {
                const icon = formGroup.querySelector('.input-with-icon i');
                if (icon) {
                    icon.classList.toggle('icon-bounce', optionsContainer.classList.contains('open'));
                }
            }
        });
        
        // Add to DOM
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsContainer);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (activeDropdown && !e.target.closest('.custom-dropdown-wrapper')) {
            activeDropdown.optionsContainer.classList.remove('open');
            activeDropdown.trigger.classList.remove('open');
            
            // Remove bounce from icon
            const formGroup = activeDropdown.optionsContainer.closest('.form-group');
            if (formGroup) {
                const icon = formGroup.querySelector('.input-with-icon i');
                if (icon) {
                    icon.classList.remove('icon-bounce');
                }
            }
            
            activeDropdown = null;
        }
    });
    
    // Add CSS for custom dropdowns
    addCustomDropdownStyles();
}

// Add required CSS for dropdown styles and animations
function addCustomDropdownStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-dropdown-wrapper {
            position: relative;
            width: 100%;
            font-family: 'Inter', sans-serif;
            z-index: 50;
        }
        
        .dropdown-trigger {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-radius: 8px;
            background-color: var(--bg-dark-2, #222831);
            border: 1px solid var(--bg-dark-3, #2D333B);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            color: var(--text-light, #e8eaed);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding-left: 45px; /* Make room for the icon */
        }
        
        /* Position the icon */
        .input-with-icon i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 60;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .dropdown-trigger:hover {
            border-color: var(--primary-color, #F0B67F);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .dropdown-trigger.open {
            border-color: var(--primary-color, #F0B67F);
            box-shadow: 0 0 0 3px rgba(240, 182, 127, 0.2);
        }
        
        .dropdown-arrow {
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            color: var(--primary-color, #F0B67F);
        }
        
        .dropdown-trigger.open .dropdown-arrow {
            transform: rotate(180deg);
        }

        .dropdown-trigger .trigger-text {
            transition: transform 0.3s ease;
        }
        
        .dropdown-trigger.open .trigger-text {
            transform: translateX(5px);
            color: var(--primary-color, #F0B67F);
        }
        
        .dropdown-options {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            background: var(--bg-dark-2, #222831);
            border-radius: 8px;
            border: 1px solid var(--bg-dark-3, #2D333B);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            z-index: 100;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            visibility: hidden;
        }
        
        .dropdown-options.open {
            max-height: 250px;
            opacity: 1;
            pointer-events: all;
            overflow-y: auto;
            transform: translateY(0);
            visibility: visible;
        }
        
        .dropdown-option {
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            color: var(--text-light, #e8eaed);
        }
        
        .dropdown-options.open .dropdown-option {
            animation: dropdownOptionIn 0.4s forwards;
            animation-fill-mode: both;
        }
        
        .dropdown-options.open .dropdown-option:nth-child(1) { animation-delay: 0.05s; }
        .dropdown-options.open .dropdown-option:nth-child(2) { animation-delay: 0.1s; }
        .dropdown-options.open .dropdown-option:nth-child(3) { animation-delay: 0.15s; }
        .dropdown-options.open .dropdown-option:nth-child(4) { animation-delay: 0.2s; }
        .dropdown-options.open .dropdown-option:nth-child(5) { animation-delay: 0.25s; }
        .dropdown-options.open .dropdown-option:nth-child(6) { animation-delay: 0.3s; }
        
        .dropdown-option:hover {
            background: var(--bg-dark-3, #2D333B);
            padding-left: 22px;
            color: var(--primary-color, #F0B67F);
        }
        
        .dropdown-option.selected {
            color: var(--primary-color, #F0B67F);
            font-weight: 500;
            background-color: rgba(240, 182, 127, 0.1);
        }
        
        .dropdown-option.selected::before {
            content: '✓';
            position: absolute;
            left: 8px;
            opacity: 1;
        }
        
        .dropdown-option.option-selected {
            animation: pulse 0.5s;
        }
        
        .dropdown-trigger.pulse {
            animation: triggerPulse 0.3s;
        }
        
        /* Ripple effect */
        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s linear;
            pointer-events: none;
        }
        
        /* Icon animations */
        .input-with-icon i.selection-celebration {
            animation: iconCelebration 1s ease;
        }
        
        .input-with-icon i.icon-bounce {
            animation: iconBounce 0.5s infinite alternate;
        }
        
        /* Animation Keyframes */
        @keyframes dropdownOptionIn {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0% {
                background-color: rgba(240, 182, 127, 0.2);
            }
            50% {
                background-color: rgba(240, 182, 127, 0.4);
            }
            100% {
                background-color: rgba(240, 182, 127, 0.1);
            }
        }
        
        @keyframes triggerPulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.02);
            }
            100% {
                transform: scale(1);
            }
        }
        
        @keyframes rippleEffect {
            0% {
                width: 0;
                height: 0;
                opacity: 0.5;
                transform: scale(0);
            }
            100% {
                width: 500px;
                height: 500px;
                opacity: 0;
                transform: scale(1);
            }
        }
        
        @keyframes iconCelebration {
            0% {
                transform: scale(1);
            }
            25% {
                transform: scale(1.2) rotate(-10deg);
                color: var(--primary-color, #F0B67F);
            }
            50% {
                transform: scale(1.2) rotate(10deg);
                color: var(--accent-color, #6C5CE7);
            }
            75% {
                transform: scale(1.2) rotate(-10deg);
                color: var(--primary-color, #F0B67F);
            }
            100% {
                transform: scale(1) rotate(0);
            }
        }
        
        @keyframes iconBounce {
            0% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(-4px);
                color: var(--primary-color, #F0B67F);
            }
        }
        
        /* Scrollbar styling */
        .dropdown-options::-webkit-scrollbar {
            width: 6px;
        }
        
        .dropdown-options::-webkit-scrollbar-track {
            background: var(--bg-dark-2, #222831);
            border-radius: 8px;
        }
        
        .dropdown-options::-webkit-scrollbar-thumb {
            background: var(--bg-dark-3, #2D333B);
            border-radius: 8px;
        }
        
        .dropdown-options::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color, #F0B67F);
        }

        /* Fix for existing icon in the HTML structure */
        .input-with-icon {
            position: relative;
            z-index: 5;
        }
        
        /* Override some form styles to make the dropdown work */
        .input-with-icon select.form-control {
            opacity: 0;
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
        }
    `;
    
    document.head.appendChild(style);
} 