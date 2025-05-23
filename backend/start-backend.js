/**
 * Helper script to run the backend API server
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

console.log('Starting PortMySim backend server...');

// Run npm script in the current directory
const child = spawn('npm', ['run', 'dev'], { 
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