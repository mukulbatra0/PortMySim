/**
 * Form Navigation Fix
 * Provides reliable multi-step form navigation functionality
 */

// Execute immediately when loaded
(function() {
  console.log('🔄 Form navigation fix script loaded');
  
  // Form Navigation Functions
  window.FormNavigation = {
    // Navigate to a specific step
    goToStep: function(stepNumber) {
      console.log('FormNavigation: Going to step', stepNumber);
      
      // Hide all steps with complete styles
      const allSteps = document.querySelectorAll('.form-step');
      allSteps.forEach(step => {
        step.classList.remove('active');
        // Set all hiding properties to ensure complete hiding
        step.style.display = 'none';
        step.style.visibility = 'hidden';
        step.style.position = 'absolute';
        step.style.height = '0';
        step.style.overflow = 'hidden';
        step.style.opacity = '0';
      });
      
      // Show target step with complete styles
      const targetStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
      if (targetStep) {
        targetStep.classList.add('active');
        // Set all showing properties to ensure complete visibility
        targetStep.style.display = 'block';
        targetStep.style.visibility = 'visible';
        targetStep.style.position = 'relative';
        targetStep.style.height = 'auto';
        targetStep.style.overflow = 'visible';
        targetStep.style.opacity = '1';
        
        // Special handling for step 2 (New Provider)
        if (stepNumber === 2) {
          console.log('Applying special handling for New Provider section');
          this.fixNewProviderStep();
        }
        
        // Update progress indicator
        this.updateProgress(stepNumber);
        
        // Scroll to top of form
        const formContainer = document.querySelector('.schedule-form-container');
        if (formContainer) {
          formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    
    // Special fix for the New Provider step
    fixNewProviderStep: function() {
      // Get the provider options container
      const providerOptions = document.querySelector('.provider-options');
      if (providerOptions) {
        // Force display
        providerOptions.style.display = 'grid';
        
        // Fix the provider cards
        const providerCards = document.querySelectorAll('.provider-card');
        providerCards.forEach(card => {
          card.style.display = 'block';
          card.style.visibility = 'visible';
          card.style.opacity = '1';
          
          // Ensure click handler is attached
          card.onclick = function() {
            // Remove selection from all cards
            providerCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Update the hidden input with the selected provider
            const provider = this.getAttribute('data-provider');
            const providerInput = document.getElementById('newProvider');
            const providerNameDisplay = document.getElementById('selectedProviderName');
            
            if (providerInput) {
              providerInput.value = provider;
            }
            
            if (providerNameDisplay) {
              const providerName = this.querySelector('h3').textContent;
              providerNameDisplay.textContent = providerName;
            }
          };
        });
      }
      
      // Force display of selected provider section
      const selectedProviderSection = document.querySelector('.selected-provider');
      if (selectedProviderSection) {
        selectedProviderSection.style.display = 'block';
        selectedProviderSection.style.visibility = 'visible';
      }
    },
    
    // Update progress indicators
    updateProgress: function(currentStep) {
      const progressSteps = document.querySelectorAll('.progress-steps .step');
      progressSteps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum <= currentStep) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    },
    
    // Initialize navigation
    init: function() {
      this.attachHandlers();
      console.log('FormNavigation: Initialized');
    },
    
    // Attach event handlers to navigation buttons
    attachHandlers: function() {
      // Next buttons
      document.querySelectorAll('.btn-next').forEach(button => {
        button.onclick = (e) => {
          e.preventDefault();
          const nextStep = button.getAttribute('data-next');
          if (nextStep) {
            this.goToStep(parseInt(nextStep));
          }
          return false;
        };
      });
      
      // Previous buttons
      document.querySelectorAll('.btn-prev').forEach(button => {
        button.onclick = (e) => {
          e.preventDefault();
          const prevStep = button.getAttribute('data-prev');
          if (prevStep) {
            this.goToStep(parseInt(prevStep));
          }
          return false;
        };
      });
      
      // Setup provider cards
      const providerCards = document.querySelectorAll('.provider-card');
      providerCards.forEach(card => {
        card.onclick = function() {
          // Remove selection from all cards
          providerCards.forEach(c => c.classList.remove('selected'));
          
          // Add selection to clicked card
          this.classList.add('selected');
          
          // Update the hidden input with the selected provider
          const provider = this.getAttribute('data-provider');
          const providerInput = document.getElementById('newProvider');
          const providerNameDisplay = document.getElementById('selectedProviderName');
          
          if (providerInput) {
            providerInput.value = provider;
          }
          
          if (providerNameDisplay) {
            const providerName = this.querySelector('h3').textContent;
            providerNameDisplay.textContent = providerName;
          }
        };
      });
      
      console.log('FormNavigation: Handlers attached');
    },
    
    // Force show a specific step (if things get stuck)
    forceShowStep: function(stepNumber) {
      const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
      if (step) {
        // Hide all steps first
        document.querySelectorAll('.form-step').forEach(s => {
          s.style.display = 'none';
        });
        
        // Apply complete show styles
        step.style.display = 'block';
        step.style.visibility = 'visible';
        step.style.position = 'relative';
        step.style.height = 'auto';
        step.style.overflow = 'visible';
        step.style.opacity = '1';
        step.classList.add('active');
        
        if (stepNumber === 2) {
          this.fixNewProviderStep();
        }
        
        console.log(`Force showed step ${stepNumber}`);
      }
    }
  };
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.FormNavigation.init();
    });
  } else {
    // DOM already loaded
    window.FormNavigation.init();
  }
  
  // Reinitialize after a delay to ensure it works
  setTimeout(() => {
    window.FormNavigation.init();
  }, 1000);
  
  // Expose global direct access function for user to manually show steps if needed
  window.showStep = function(stepNumber) {
    window.FormNavigation.forceShowStep(stepNumber);
  };
})(); 