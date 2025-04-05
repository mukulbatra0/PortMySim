require('dotenv').config({ path: '../.env' });
const { exec } = require('child_process');
const path = require('path');

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