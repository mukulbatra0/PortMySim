// Loader functionality
document.addEventListener('DOMContentLoaded', () => {
    // Skip loader creation if we're on the contact page
    if (window.contactPage) {
        return;
    }
    
    // Create loader elements
    createLoader();
    
    // Skip auto-showing loader if the disable flag is set
    if (!window.disableDefaultLoader) {
        // Show loader initially
        showLoader();
        
        // Hide loader when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                hideLoader();
            }, 1000); // Display loader for at least 1 second
        });
        
        // Add loader for page transitions
        document.addEventListener('click', (e) => {
            // Check if clicked element is a link that navigates to another page
            const link = e.target.closest('a');
            if (link && link.href && 
                !link.href.startsWith('#') && 
                !link.href.startsWith('javascript') && 
                link.hostname === window.location.hostname && 
                !link.hasAttribute('data-no-loader') &&
                !link.target) {
                
                // Skip loader for auth page transitions (login/signup)
                const isAuthPageTransition = (
                    (link.href.includes('/login.html') && window.location.href.includes('/signup.html')) ||
                    (link.href.includes('/signup.html') && window.location.href.includes('/login.html'))
                );
                
                if (isAuthPageTransition) {
                    return; // Skip loader for auth transitions
                }
                
                // Special handling for primary and hero buttons
                const isPrimaryButton = link.classList.contains('btn-primary') || 
                                      (link.classList.contains('hero-btn') && link.classList.contains('primary'));
                
                if (isPrimaryButton) {
                    // Prevent default behavior
                    e.preventDefault();
                    
                    // Get the target URL
                    const targetUrl = link.href;
                    
                    // Skip if we're already on this page
                    if (window.location.href === targetUrl) {
                        return;
                    }
                    
                    // Show loader
                    showLoader();
                    
                    // Navigate directly and quickly
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 200);
                    
                    return;
                }
                
                // Get the target URL
                const targetUrl = link.href;
                
                // Don't show loader if we're already on this page
                if (window.location.href === targetUrl) {
                    return;
                }
                
                // Show loader before navigation
                showLoader();
                
                // Safety fallback - navigate after 2 seconds if we're still on the same page
                setTimeout(() => {
                    if (window.location.href !== targetUrl) {
                        window.location.href = targetUrl;
                    }
                }, 2000);
            }
        });
    }
});

// Function to create loader elements
function createLoader() {
    // Clean up any existing loaders first
    const existingProgressBars = document.querySelectorAll('.loader-progress');
    const existingLoaders = document.querySelectorAll('.loader-container');
    
    // Remove existing progress bars
    existingProgressBars.forEach(bar => {
        if (bar.parentNode) {
            bar.parentNode.removeChild(bar);
        }
    });
    
    // Remove existing loaders
    existingLoaders.forEach(loader => {
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    });
    
    // Create loader container
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    
    // Create loader progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'loader-progress';
    progressBar.style.width = '0%'; // Ensure it starts at 0%
    
    // Create the main loader
    const loader = document.createElement('div');
    loader.className = 'loader';
    
    // Create logo for loader center
    const logo = document.createElement('img');
    logo.className = 'loader-logo';
    logo.src = '../images/logo.png';
    logo.alt = 'PortMySim Logo';
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loader-text';
    loadingText.textContent = 'LOADING...';
    
    // Assemble the loader
    loader.appendChild(logo);
    loaderContainer.appendChild(loader);
    loaderContainer.appendChild(loadingText);
    
    // Insert progress bar and loader container before the footer
    const footer = document.querySelector('footer');
    if (footer) {
        document.body.insertBefore(progressBar, footer);
        document.body.insertBefore(loaderContainer, footer);
    } else {
        // Fallback to appending to body if footer not found
        document.body.appendChild(progressBar);
        document.body.appendChild(loaderContainer);
    }
    
    // Ensure the progress bar is initially hidden until needed
    requestAnimationFrame(() => {
        if (!progressBar.classList.contains('hidden')) {
            progressBar.style.width = '0%';
        }
    });
}

// Function to show loader
function showLoader() {
    const loaderContainer = document.querySelector('.loader-container');
    const progressBar = document.querySelector('.loader-progress');
    
    if (loaderContainer) {
        loaderContainer.classList.remove('hidden');
    }
    
    // Make sure progress bar is visible
    if (progressBar) {
        progressBar.classList.remove('hidden');
        progressBar.style.width = '0%';
        animateProgress(progressBar);
    }
    
    // Prevent scrolling when loader is showing
    document.body.style.overflow = 'hidden';
    
    // Set a safety timeout to ensure we don't permanently block navigation
    setTimeout(() => {
        hideLoader();
    }, 5000); // 5 second backup timeout
}

// Function to hide loader
function hideLoader() {
    const loaderContainer = document.querySelector('.loader-container');
    const progressBar = document.querySelector('.loader-progress');
    
    // Complete progress bar
    if (progressBar) {
        progressBar.style.width = '100%';
    }
    
    // Hide loader after a short delay to see completed progress
    setTimeout(() => {
        if (loaderContainer) {
            loaderContainer.classList.add('hidden');
        }
        
        // Hide the progress bar
        if (progressBar) {
            progressBar.classList.add('hidden');
        }
        
        // Re-enable scrolling
        document.body.style.overflow = '';
        
        // Reset progress bar after transition (complete hiding)
        setTimeout(() => {
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }, 300);
        
        // Hide all page transition elements
        const transitions = document.querySelectorAll('.page-transition');
        transitions.forEach(transition => {
            transition.classList.remove('active');
        });
    }, 300);
}

// Animate progress bar
function animateProgress(progressBar) {
    let width = 0;
    const increment = 1;
    const interval = setInterval(() => {
        if (width >= 90) {
            clearInterval(interval);
        } else {
            // Slow down as it approaches 90%
            if (width < 30) {
                width += increment;
            } else if (width < 60) {
                width += increment * 0.7;
            } else {
                width += increment * 0.3;
            }
            progressBar.style.width = width + '%';
        }
    }, 20);
}

// Expose loader functions globally
window.PortMySim = window.PortMySim || {};
window.PortMySim.loader = {
    show: showLoader,
    hide: hideLoader
}; 