/**
 * Auto-Include JavaScript
 * 
 * This script automatically includes common elements across pages
 * Used for VS Code Live Preview Content Security Policy fixes
 */

document.addEventListener('DOMContentLoaded', function() {
  // This is where automatic includes would be added
  // For example, adding standard components, headers, or other elements
  
  console.log('Auto-include script loaded successfully');
  
  // Fix for VS Code Live Preview WebSocket connection issue
  fixVSCodeLivePreviewCSP();
});

/**
 * Fixes VS Code Live Preview WebSocket connection issues by dynamically
 * updating the Content Security Policy to allow all required connections
 */
function fixVSCodeLivePreviewCSP() {
  try {
    // Find all meta tags
    const metaTags = document.querySelectorAll('meta');
    
    // Look for the CSP meta tag
    let cspTag = null;
    metaTags.forEach(tag => {
      if (tag.getAttribute('http-equiv') === 'Content-Security-Policy') {
        cspTag = tag;
      }
    });
    
    if (cspTag) {
      // Get current CSP content
      let cspContent = cspTag.getAttribute('content');
      
      // Ensure we have all the necessary WebSocket connections allowed
      // Check if we need to add the specific WebSocket URL
      if (!cspContent.includes('wss://127.0.0.1:3001')) {
        // Add wss protocol support for WebSockets
        cspContent = cspContent.replace(
          'connect-src', 
          'connect-src wss://127.0.0.1:* ws://127.0.0.1:3001'
        );
        
        // Update the CSP tag
        cspTag.setAttribute('content', cspContent);
        console.log('VS Code Live Preview WebSocket CSP fixed');
      }
    } else {
      // If no CSP tag exists, create one
      const newCSPTag = document.createElement('meta');
      newCSPTag.setAttribute('http-equiv', 'Content-Security-Policy');
      newCSPTag.setAttribute('content', 
        "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:* ws://127.0.0.1:* wss://127.0.0.1:* http://127.0.0.1:*; script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:;"
      );
      document.head.appendChild(newCSPTag);
      console.log('VS Code Live Preview CSP tag created');
    }
    
    // Fallback: If page uses Live Preview's injected script, explicitly allow it
    if (document.querySelector('script[src*="vscode_livepreview_injected_script"]')) {
      const scriptTag = document.createElement('script');
      scriptTag.textContent = `
        // Allow WebSocket connections for Live Preview
        if (window.WebSocket) {
          console.log('WebSocket is supported - enabling VS Code Live Preview connection');
          
          // Attempt to reconnect if connection fails
          window.addEventListener('error', function(event) {
            if (event.target && (event.target.src || event.target.href)) {
              console.log('Reconnecting Live Preview WebSocket');
              setTimeout(() => {
                const wsUrl = 'ws://127.0.0.1:3001';
                const ws = new WebSocket(wsUrl);
                ws.addEventListener('open', () => console.log('Live Preview reconnected'));
              }, 1000);
            }
          }, true);
        }
      `;
      document.head.appendChild(scriptTag);
    }
  } catch (err) {
    console.error('Error fixing VS Code Live Preview CSP:', err);
  }
} 