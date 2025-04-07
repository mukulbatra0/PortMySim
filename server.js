/**
 * API Server for PortMySim
 * This server provides APIs for the mobile number porting application
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from HTML directory
app.use(express.static(path.join(__dirname)));

// Mock API endpoint for telecom providers
app.get('/api/porting/providers', (req, res) => {
  console.log('[API] Serving providers data');
  
  // Return sample provider data
  res.json({
    success: true,
    data: [
      {
        id: 'jio',
        name: 'Jio',
        description: 'Affordable plans & digital benefits',
        logo: '../images/jio.jpeg'
      },
      {
        id: 'airtel',
        name: 'Airtel',
        description: 'Wide coverage & great speeds',
        logo: '../images/airtel.png'
      },
      {
        id: 'vi',
        name: 'Vi',
        description: 'Weekend data & entertainment',
        logo: '../images/vi.png'
      },
      {
        id: 'bsnl',
        name: 'BSNL',
        description: 'Extensive rural coverage',
        logo: '../images/bsnl.png'
      }
    ]
  });
});

// Mock API endpoint for telecom circles
app.get('/api/porting/circles', (req, res) => {
  console.log('[API] Serving circles data');
  
  // Return sample circle data
  res.json({
    success: true,
    data: [
      { id: 'delhi', name: 'Delhi NCR' },
      { id: 'mumbai', name: 'Mumbai' },
      { id: 'maharashtra', name: 'Maharashtra & Goa' },
      { id: 'karnataka', name: 'Karnataka' },
      { id: 'tamil-nadu', name: 'Tamil Nadu' },
      { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
      { id: 'west-bengal', name: 'West Bengal' },
      { id: 'gujarat', name: 'Gujarat' },
      { id: 'kolkata', name: 'Kolkata' },
      { id: 'up-east', name: 'UP East' },
      { id: 'up-west', name: 'UP West' },
      { id: 'kerala', name: 'Kerala' },
      { id: 'punjab', name: 'Punjab' },
      { id: 'haryana', name: 'Haryana' },
      { id: 'rajasthan', name: 'Rajasthan' },
      { id: 'madhya-pradesh', name: 'Madhya Pradesh & Chhattisgarh' },
      { id: 'bihar', name: 'Bihar & Jharkhand' },
      { id: 'orissa', name: 'Orissa' },
      { id: 'assam', name: 'Assam' },
      { id: 'northeast', name: 'North East' },
      { id: 'himachal', name: 'Himachal Pradesh' },
      { id: 'jammu', name: 'Jammu & Kashmir' }
    ]
  });
});

// Add a fallback route for any other API routes
app.get('/api/*', (req, res) => {
  console.log(`[API] Fallback for: ${req.path}`);
  res.json({
    success: false,
    error: 'Endpoint not implemented in demo server'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 