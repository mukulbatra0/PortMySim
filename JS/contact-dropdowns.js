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
    
    selectElements.forEach((select, index) => {
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
            
            // Add animation delay for staggered appearance
            optionElement.style.animationDelay = `${index * 0.05}s`;
            
            optionElement.addEventListener('click', () => {
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
                    const icon = formGroup.querySelector('.form-icon');
                    if (icon) {
                        icon.classList.add('selection-celebration');
                        setTimeout(() => {
                            icon.classList.remove('selection-celebration');
                        }, 1000);
                    }
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Toggle dropdown when clicking trigger
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other open dropdowns
            document.querySelectorAll('.dropdown-options.open').forEach(dropdown => {
                if (dropdown !== optionsContainer) {
                    dropdown.classList.remove('open');
                    dropdown.previousElementSibling.classList.remove('open');
                }
            });
            
            // Toggle this dropdown
            optionsContainer.classList.toggle('open');
            trigger.classList.toggle('open');
            
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
                const icon = formGroup.querySelector('.form-icon');
                if (icon) {
                    icon.classList.toggle('icon-bounce', optionsContainer.classList.contains('open'));
                }
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            optionsContainer.classList.remove('open');
            trigger.classList.remove('open');
            
            // Remove bounce from icon
            const formGroup = select.closest('.form-group');
            if (formGroup) {
                const icon = formGroup.querySelector('.form-icon');
                if (icon) {
                    icon.classList.remove('icon-bounce');
                }
            }
        });
        
        // Add to DOM
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsContainer);
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
        }
        
        .dropdown-trigger {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-radius: 8px;
            background-color: #fff;
            border: 1px solid #ddd;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            color: #333;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .dropdown-trigger:hover {
            border-color: #4569d4;
        }
        
        .dropdown-trigger.open {
            border-color: #4569d4;
            box-shadow: 0 0 0 3px rgba(69, 105, 212, 0.2);
        }
        
        .dropdown-arrow {
            transition: transform 0.3s ease;
        }
        
        .dropdown-trigger.open .dropdown-arrow {
            transform: rotate(180deg);
        }
        
        .dropdown-options {
            position: absolute;
            top: calc(100% + 5px);
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 100;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        }
        
        .dropdown-options.open {
            max-height: 250px;
            opacity: 1;
            pointer-events: all;
            overflow-y: auto;
        }
        
        .dropdown-option {
            padding: 12px 16px;
            cursor: pointer;
            transition: background 0.2s;
            opacity: 0;
            transform: translateY(10px);
            animation: slideIn 0.3s forwards;
        }
        
        .dropdown-options.open .dropdown-option {
            opacity: 1;
            transform: translateY(0);
        }
        
        .dropdown-option:hover {
            background: #f5f8ff;
            color: #4569d4;
        }
        
        .dropdown-option.selected {
            background: #eef2ff;
            color: #4569d4;
            font-weight: 500;
        }
        
        .dropdown-option.option-selected {
            animation: selectPulse 0.5s;
        }
        
        /* Ripple effect */
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(69, 105, 212, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        /* Pulse animation for trigger after selection */
        .dropdown-trigger.pulse {
            animation: triggerPulse 0.3s;
        }
        
        /* Icon animation when dropdown is opened */
        .form-icon.icon-bounce {
            animation: iconBounce 0.5s;
            color: #4569d4;
        }
        
        /* Icon celebration when option is selected */
        .form-icon.selection-celebration {
            animation: iconCelebration 1s;
            color: #4569d4;
        }
        
        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes selectPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); background: rgba(69, 105, 212, 0.2); }
            100% { transform: scale(1); }
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes triggerPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        @keyframes iconBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        @keyframes iconCelebration {
            0% { transform: scale(1) rotate(0); }
            25% { transform: scale(1.2) rotate(-15deg); }
            50% { transform: scale(1.2) rotate(15deg); }
            75% { transform: scale(1.1) rotate(-15deg); }
            100% { transform: scale(1) rotate(0); }
        }
    `;
    
    document.head.appendChild(style);
} 