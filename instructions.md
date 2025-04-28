# PortMySim Integration Guide

This guide explains how to set up and use the PortMySim application for mobile number porting.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Server:**
   ```bash
   npm start
   ```
   - This starts an Express server that handles the porting requests
   - The server runs on port 5000 by default

3. **Access the application:**
   - Open your browser and go to http://localhost:5000/HTML/schedule-porting.html
   - Enter a mobile number and other details to schedule a porting request

## How It Works

1. When a user decides to port their mobile number:
   - They provide their current mobile number, operator, and circle information
   - Select their new desired operator
   - Schedule a date for the porting to take place
   - Enter personal details for verification

2. Porting process:
   - User manually enters their current operator and circle
   - System calculates the appropriate dates for porting
   - User receives confirmation details upon successful submission

## Troubleshooting

- **Server Errors**: Make sure the proxy server is running
- **Form Validation**: Ensure all required fields are filled correctly
- **Date Selection**: Verify that you've selected valid future dates for plan expiry and porting

## Notes

- This implementation uses an Express server to handle form submissions
- The application can run in mock mode without a backend for demonstration purposes
- Follow the UI steps to complete the porting process 