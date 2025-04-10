// Password Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const setupPasswordToggle = () => {
        const singleToggleButton = document.getElementById('single-password-toggle');
        if (!singleToggleButton) {
            console.error('Password toggle button not found');
            return;
        }

        const passwordInputs = document.querySelectorAll('input[type="password"]');
        if (!passwordInputs.length) {
            console.error('No password inputs found');
            return;
        }

        let passwordsVisible = false;
        
        singleToggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Toggle visibility state
            passwordsVisible = !passwordsVisible;
            
            // Apply to all password inputs
            passwordInputs.forEach(input => {
                input.type = passwordsVisible ? 'text' : 'password';
            });
            
            // Update button appearance
            const icon = this.querySelector('i');
            const span = this.querySelector('span');
            
            if (passwordsVisible) {
                icon.className = 'fas fa-eye-slash';
                span.textContent = 'Hide Passwords';
            } else {
                icon.className = 'fas fa-eye';
                span.textContent = 'Show Passwords';
            }
            
            console.log('Password visibility toggled:', passwordsVisible);
        });
    };

    // Initialize password toggle functionality
    setupPasswordToggle();
}); 