# Truecaller Integration Guide

This guide explains how to set up and use the Truecaller integration for mobile number operator and circle detection.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get Your Truecaller Installation ID:**
   - You need a valid Truecaller installation ID to use the API
   - Run this Node.js script to obtain your ID:
   ```bash
   node JS/truecallerLogin.js
   ```
   - Follow the prompts to enter your phone number and the OTP you receive
   - Copy the installation ID that is generated

3. **Configure Installation ID:**
   - Open `JS/truecallerHelper.js`
   - Update the `INSTALLATION_ID` constant with your ID:
   ```javascript
   const INSTALLATION_ID = "your-installation-id-here";
   ```

4. **Start the Proxy Server:**
   ```bash
   npm start
   ```
   - This starts an Express server that proxies requests to Truecaller to avoid CORS issues
   - The server runs on port 5000 by default

5. **Access the application:**
   - Open your browser and go to http://localhost:5000/HTML/schedule-porting.html
   - Enter a mobile number to test the operator detection

## How It Works

1. When a user enters a 10-digit mobile number, our system:
   - First tries to detect the operator using Truecaller API (high accuracy)
   - Falls back to our local TRAI database if Truecaller fails

2. Detection process:
   - Browser sends request to our local proxy server
   - Proxy forwards the request to Truecaller API with proper authentication
   - Response is processed to extract operator and circle information
   - User interface updates with the detected information

## Troubleshooting

- **CORS Errors**: Make sure the proxy server is running
- **API Errors**: Check that your installation ID is valid and not expired
- **Detection Failures**: Ensure the mobile number is in correct format

## Notes

- Truecaller has usage limitations - for high volume applications, consider caching results
- This implementation uses an Express proxy server to overcome browser CORS restrictions
- The installation ID has an expiration time, and you may need to regenerate it periodically 