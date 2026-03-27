import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Starting database seeding process...');

// Helper function to run a seed script
const runSeedScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    console.log(`Running ${scriptName}...`);
    
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${scriptName}:`, error);
        reject(error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
};

// Run all seed scripts sequentially
async function seedAll() {
  try {
    // Seed plans
    await runSeedScript('seedPlans.js');
    
    // Seed FAQs
    await runSeedScript('seedFAQs.js');
    
    // Seed telecom circles
    await runSeedScript('seedTelecomCircles.js');
    
    console.log('✅ All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedAll(); 