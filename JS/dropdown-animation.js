// Dropdown Animation Script
document.addEventListener('DOMContentLoaded', function() {
    initCustomDropdowns();
});

// Initialize custom dropdowns with animations
function initCustomDropdowns() {
    // Find all select elements in the form
    const selectElements = document.querySelectorAll('.schedule-form select');
    
    selectElements.forEach(select => {
        // Skip if select is already customized
        if (select.dataset.customized === 'true' || select.style.display === 'none') {
            console.log('Skipping already customized select:', select.id || 'unnamed');
            return;
        }
        
        // Get the form icon if it exists
        const formGroup = select.closest('.form-group');
        const formIcon = formGroup?.querySelector('.form-icon');
        
        // Create wrapper for the custom dropdown
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        // Create the custom select element
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        
        // Create the trigger element (what users click on)
        const trigger = document.createElement('span');
        trigger.className = 'custom-select-trigger';
        trigger.textContent = select.options[select.selectedIndex]?.textContent || 'Select an option';
        
        // Move the form icon to the custom trigger if it exists
        if (formIcon) {
            // Clone the icon to preserve event listeners
            const iconClone = formIcon.cloneNode(true);
            iconClone.style.left = '1rem';
            
            // Add the icon to the trigger
            trigger.appendChild(iconClone);
            
            // Hide the original icon
            formIcon.style.display = 'none';
        }
        
        // Create the options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-options';
        
        // Add options from the original select
        Array.from(select.options).forEach(option => {
            const customOption = document.createElement('span');
            customOption.className = 'custom-option';
            customOption.setAttribute('data-value', option.value);
            customOption.textContent = option.textContent;
            
            // Mark as selected if it's the current value
            if (option.selected) {
                customOption.classList.add('selection');
            }
            
            // Handle option selection
            customOption.addEventListener('click', function() {
                // Update the original select value
                select.value = this.getAttribute('data-value');
                
                // Trigger change event on the original select
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
                
                // Update the trigger text
                trigger.textContent = this.textContent;
                
                // Update selection styling
                optionsContainer.querySelectorAll('.custom-option').forEach(opt => {
                    opt.classList.remove('selection');
                });
                this.classList.add('selection');
                
                // Add selection animation
                this.classList.add('option-selected');
                setTimeout(() => {
                    this.classList.remove('option-selected');
                }, 700);
                
                // Close the dropdown with animation
                customSelect.classList.remove('opened');
                
                // Add a pulse animation to the trigger
                trigger.classList.add('pulse-animation');
                setTimeout(() => {
                    trigger.classList.remove('pulse-animation');
                }, 700);
                
                // Animate the form icon to celebrate selection
                if (formIcon) {
                    formIcon.classList.add('selection-celebration');
                    formIcon.style.color = 'var(--success-color)';
                    
                    setTimeout(() => {
                        formIcon.classList.remove('selection-celebration');
                        formIcon.style.color = '';
                    }, 1000);
                }
            });
            
            optionsContainer.appendChild(customOption);
        });
        
        // Toggle dropdown on trigger click
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close all other open dropdowns
            document.querySelectorAll('.custom-select.opened').forEach(openSelect => {
                if (openSelect !== customSelect) {
                    openSelect.classList.remove('opened');
                }
            });
            
            // Toggle current dropdown
            customSelect.classList.toggle('opened');
            
            // Animate the associated form icon
            if (formIcon) {
                if (customSelect.classList.contains('opened')) {
                    formIcon.classList.add('floating');
                    formIcon.style.color = 'var(--primary-color)';
                    formIcon.style.animation = 'iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate';
                } else {
                    formIcon.classList.remove('floating');
                    formIcon.style.color = '';
                    formIcon.style.animation = '';
                }
            }
            
            // Add ripple effect
            const rect = trigger.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'select-ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            trigger.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            customSelect.classList.remove('opened');
        });
        
        // Prevent closing when clicking inside the options
        optionsContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Assemble the custom dropdown
        customSelect.appendChild(trigger);
        customSelect.appendChild(optionsContainer);
        wrapper.appendChild(customSelect);
        
        // Hide the original select and insert the custom one
        select.style.display = 'none';
        select.parentNode.insertBefore(wrapper, select);
        
        // Mark this select as customized
        select.dataset.customized = 'true';
        
        // Update custom select when original select changes
        select.addEventListener('change', function() {
            trigger.textContent = this.options[this.selectedIndex]?.textContent || 'Select an option';
            
            optionsContainer.querySelectorAll('.custom-option').forEach(opt => {
                if (opt.getAttribute('data-value') === this.value) {
                    opt.classList.add('selection');
                } else {
                    opt.classList.remove('selection');
                }
            });
        });
    });
    
    // Add animation styles dynamically
    addDropdownStyles();
}

// Add required CSS styles for the dropdown animations
function addDropdownStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .custom-select-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 1.5rem;
        }
        
        .custom-select {
            position: relative;
            display: block;
            width: 100%;
            cursor: pointer;
        }
        
        .custom-select-trigger {
            position: relative;
            display: block;
            padding: 1rem 1rem 1rem 3rem;
            border-radius: var(--border-radius);
            background: var(--bg-dark-3);
            border: 1px solid rgba(var(--text-light-rgb), 0.1);
            color: var(--text-light);
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .custom-select-trigger:after {
            content: '';
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid var(--text-light-muted);
            transition: all 0.3s ease;
        }
        
        .custom-select.opened .custom-select-trigger:after {
            transform: translateY(-50%) rotate(180deg);
        }
        
        .custom-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-dark-2);
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            border: 1px solid rgba(var(--text-light-rgb), 0.1);
            border-top: 0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-20px);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-height: 200px;
            overflow-y: auto;
        }
        
        .custom-select.opened .custom-options {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .custom-option {
            position: relative;
            display: block;
            padding: 0.8rem 1.5rem;
            color: var(--text-light-muted);
            cursor: pointer;
            transition: all 0.3s ease;
            transform: translateX(-10px);
            opacity: 0;
        }
        
        .custom-select.opened .custom-option {
            transform: translateX(0);
            opacity: 1;
        }
        
        .custom-select.opened .custom-option:nth-child(1) { transition-delay: 0.1s; }
        .custom-select.opened .custom-option:nth-child(2) { transition-delay: 0.15s; }
        .custom-select.opened .custom-option:nth-child(3) { transition-delay: 0.2s; }
        .custom-select.opened .custom-option:nth-child(4) { transition-delay: 0.25s; }
        .custom-select.opened .custom-option:nth-child(5) { transition-delay: 0.3s; }
        
        .custom-option:hover {
            background: rgba(var(--primary-rgb), 0.1);
            color: var(--text-light);
            transform: translateX(5px);
        }
        
        .custom-option.selection {
            background: rgba(var(--primary-rgb), 0.2);
            color: var(--primary-color);
        }
        
        .select-ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: selectRippleEffect 0.6s linear;
            pointer-events: none;
            width: 100px;
            height: 100px;
            margin-top: -50px;
            margin-left: -50px;
        }
        
        @keyframes selectRippleEffect {
            0% {
                transform: scale(0);
                opacity: 0.5;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .pulse-animation {
            animation: selectPulse 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes selectPulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.03);
            }
            100% {
                transform: scale(1);
            }
        }
        
        @keyframes iconBounce {
            0% {
                transform: translateY(-50%) scale(1);
            }
            100% {
                transform: translateY(-50%) scale(1.3);
            }
        }
        
        .custom-option.option-selected {
            animation: optionSelected 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
            background: rgba(var(--success-rgb), 0.2);
            color: var(--success-color);
        }
        
        @keyframes optionSelected {
            0% {
                transform: scale(1);
                background: rgba(var(--primary-rgb), 0.2);
            }
            50% {
                transform: scale(1.05);
                background: rgba(var(--success-rgb), 0.3);
            }
            100% {
                transform: scale(1);
                background: rgba(var(--success-rgb), 0.2);
            }
        }
        
        .form-icon.selection-celebration {
            animation: celebrationSpin 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes celebrationSpin {
            0% {
                transform: translateY(-50%) rotate(0deg);
            }
            25% {
                transform: translateY(-50%) rotate(30deg) scale(1.2);
            }
            75% {
                transform: translateY(-50%) rotate(-30deg) scale(1.2);
            }
            100% {
                transform: translateY(-50%) rotate(0deg);
            }
        }
    `;
    
    document.head.appendChild(styleElement);
} 