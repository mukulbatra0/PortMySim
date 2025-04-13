// Signup Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Additional signup page specific functionality
    
    // Password strength meter
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('password-strength-meter');
    const strengthText = document.getElementById('password-strength-text');
    
    if (passwordInput && strengthMeter) {
        passwordInput.addEventListener('input', updatePasswordStrength);
        
        function updatePasswordStrength() {
            const password = passwordInput.value;
            let strength = 0;
            let feedback = '';
            
            // Calculate password strength
            if (password.length >= 8) strength += 1;
            if (password.match(/[A-Z]/)) strength += 1;
            if (password.match(/[a-z]/)) strength += 1;
            if (password.match(/[0-9]/)) strength += 1;
            if (password.match(/[^A-Za-z0-9]/)) strength += 1;
            
            // Update meter and text
            strengthMeter.value = strength;
            
            switch(strength) {
                case 0:
                    feedback = 'Very Weak';
                    strengthMeter.className = 'strength-very-weak';
                    break;
                case 1:
                    feedback = 'Weak';
                    strengthMeter.className = 'strength-weak';
                    break;
                case 2:
                    feedback = 'Fair';
                    strengthMeter.className = 'strength-fair';
                    break;
                case 3:
                    feedback = 'Good';
                    strengthMeter.className = 'strength-good';
                    break;
                case 4:
                    feedback = 'Strong';
                    strengthMeter.className = 'strength-strong';
                    break;
                case 5:
                    feedback = 'Very Strong';
                    strengthMeter.className = 'strength-very-strong';
                    break;
                default:
                    feedback = '';
            }
            
            if (strengthText) {
                strengthText.textContent = feedback;
                strengthText.className = `password-strength-text ${strengthMeter.className}`;
            }
        }
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove non-digit characters
            let digits = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            digits = digits.substring(0, 10);
            
            // Format for Indian mobile numbers
            if (digits.length > 0) {
                if (digits.length <= 5) {
                    e.target.value = digits;
                } else {
                    e.target.value = digits.substring(0, 5) + ' ' + digits.substring(5);
                }
            }
        });
    }
    
    // Show referral code field when toggle is clicked
    const referralToggle = document.getElementById('show-referral');
    const referralField = document.getElementById('referral-field');
    
    if (referralToggle && referralField) {
        referralToggle.addEventListener('click', function(e) {
            e.preventDefault();
            referralField.classList.toggle('active');
            
            if (referralField.classList.contains('active')) {
                referralToggle.textContent = 'Hide referral code';
            } else {
                referralToggle.textContent = 'Have a referral code?';
            }
        });
    }
    
    console.log('Signup.js loaded successfully');
}); 