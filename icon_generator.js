import fs from 'fs';
import { createCanvas } from 'canvas';

// Function to create a PNG icon
function createPngIcon(size) {
  // Create a canvas with the specified size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#1a1b26';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, [size * 0.15]); // Rounded corners
  ctx.fill();
  
  // Calculate scaling factor
  const scale = size / 128;
  
  // Draw form background
  ctx.fillStyle = '#2a2c3d';
  ctx.beginPath();
  ctx.roundRect(
    24 * scale, 
    24 * scale, 
    80 * scale, 
    60 * scale, 
    [4 * scale]
  );
  ctx.fill();
  
  // Draw form fields
  ctx.fillStyle = '#0ea5e9'; // Blue
  ctx.beginPath();
  ctx.roundRect(
    (10 + 24) * scale, 
    (25 + 14) * scale, 
    60 * scale, 
    8 * scale, 
    [2 * scale]
  );
  ctx.fill();
  
  // Draw checkbox indicator
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo((70 + 24) * scale, (22 + 14) * scale);
  ctx.lineTo((70 + 24) * scale, (58 + 14) * scale);
  ctx.stroke();
  
  // Add horizontal lines to checkbox
  ctx.beginPath();
  ctx.moveTo((65 + 24) * scale, (22 + 14) * scale);
  ctx.lineTo((75 + 24) * scale, (22 + 14) * scale);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo((65 + 24) * scale, (58 + 14) * scale);
  ctx.lineTo((75 + 24) * scale, (58 + 14) * scale);
  ctx.stroke();
  
  // Add checkbox marker
  ctx.fillStyle = '#0ea5e9';
  ctx.beginPath();
  ctx.arc((70 + 24) * scale, (40 + 14) * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Convert canvas to buffer and save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`extension/icons/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
}

// Create icons in different sizes
createPngIcon(16);
createPngIcon(48);
createPngIcon(128);

console.log('All icons generated successfully!');