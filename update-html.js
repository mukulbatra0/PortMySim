/**
 * Script to update all HTML files to include auto-init.js
 * Save this to project root and run with: node update-html.js
 */
const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, 'HTML');

// Read all HTML files
fs.readdir(HTML_DIR, (err, files) => {
  if (err) {
    console.error('Error reading HTML directory:', err);
    return;
  }
  
  // Filter for HTML files
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  console.log(`Found ${htmlFiles.length} HTML files to update`);
  
  // Process each HTML file
  htmlFiles.forEach(file => {
    const filePath = path.join(HTML_DIR, file);
    
    // Read file content
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }
      
      // Check if auto-init.js is already included
      if (content.includes('auto-init.js')) {
        console.log(`${file} already has auto-init.js`);
        return;
      }
      
      // Find the head section and add auto-init.js script
      let updatedContent = content;
      
      // Try to insert after the viewport meta tag
      if (content.includes('<meta name="viewport"')) {
        updatedContent = content.replace(
          /(<meta name="viewport"[^>]*>)/i,
          '$1\n    <!-- Block infinite ping calls first -->\n    <script src="../JS/auto-init.js"></script>'
        );
      } 
      // If no viewport meta, try to insert after charset meta
      else if (content.includes('<meta charset')) {
        updatedContent = content.replace(
          /(<meta charset[^>]*>)/i,
          '$1\n    <!-- Block infinite ping calls first -->\n    <script src="../JS/auto-init.js"></script>'
        );
      }
      // If no meta tags found, try to insert at the beginning of head
      else if (content.includes('<head>')) {
        updatedContent = content.replace(
          /(<head>)/i,
          '$1\n    <!-- Block infinite ping calls first -->\n    <script src="../JS/auto-init.js"></script>'
        );
      }
      
      // Write the updated content back to the file
      if (updatedContent !== content) {
        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing file ${file}:`, err);
            return;
          }
          console.log(`Successfully updated ${file}`);
        });
      } else {
        console.log(`Could not update ${file} - head tag not found`);
      }
    });
  });
}); 