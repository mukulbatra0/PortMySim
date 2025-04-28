// script-init.js
// This script initializes the functionality from script.js after DOM is fully loaded

// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting for elements to render before initializing script.js');
    
    // Slight delay to ensure elements are fully rendered
    setTimeout(() => {
        // Dynamic import script.js module
        import('./script.js')
            .then(module => {
                console.log('script.js module loaded successfully');
                
                // Check if document is fully interactive before running initialization
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    try {
                        // Call the initialization function if it exists
                        if (typeof module.initScriptFunctionality === 'function') {
                            console.log('Running script initialization function');
                            module.initScriptFunctionality();
                        } else {
                            console.log('No initialization function found in script.js');
                        }
                    } catch (error) {
                        console.error('Error during script initialization:', error);
                    }
                } else {
                    console.log('Document not ready yet, waiting...');
                    window.addEventListener('load', () => {
                        if (typeof module.initScriptFunctionality === 'function') {
                            module.initScriptFunctionality();
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error loading script.js module:', error);
            });
    }, 100); // Small delay to ensure DOM is ready and elements are rendered
}); 