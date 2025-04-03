/**
 * Helper script to run the backend API server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the backend directory
const backendPath = path.join(__dirname, 'backend');

// Check if backend directory exists
if (!fs.existsSync(backendPath)) {
  console.error('Backend directory not found!');
  process.exit(1);
}

console.log('Starting PortMySim backend server...');

// Change to the backend directory and run npm script
const child = spawn('npm', ['run', 'dev'], { 
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start backend server:', error.message);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Backend server exited with code ${code}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping backend server...');
  child.kill('SIGINT');
  process.exit(0);
}); 