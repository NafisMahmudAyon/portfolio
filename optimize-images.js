const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = './public';
const files = fs.readdirSync(publicDir);

files.forEach(async (file) => {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size > 500 * 1024) {
      console.log('Optimizing ' + file + '...');
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(path.join(publicDir, path.parse(file).name + '.webp'));
    }
  }
});
