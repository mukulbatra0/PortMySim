// Simple script to create SVG logos for network providers
const fs = require('fs');
const path = require('path');

// Make sure the images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Define carrier colors
const carriers = {
    'verizon': { color: '#cd040b', bgColor: '#ffffff', text: 'VZ' },
    'tmobile': { color: '#ea0a8e', bgColor: '#ffffff', text: 'TM' },
    'att': { color: '#00a8e0', bgColor: '#ffffff', text: 'AT' },
    'cricket': { color: '#6cbe45', bgColor: '#ffffff', text: 'CR' },
    'sprint': { color: '#fee100', bgColor: '#000000', text: 'SP' },
    'boost': { color: '#f26728', bgColor: '#ffffff', text: 'BM' }
};

// Create a simple SVG logo for each carrier
for (const [carrier, style] of Object.entries(carriers)) {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="90" fill="${style.bgColor}" stroke="${style.color}" stroke-width="10" />
    <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="${style.color}">${style.text}</text>
</svg>`;

    fs.writeFileSync(path.join(imagesDir, `${carrier}-logo.png`), svgContent);
    console.log(`Created ${carrier}-logo.png`);
}

console.log('All logo placeholders created!'); 