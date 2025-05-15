const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

const INPUT_DIR = './images';
const OUTPUT_DIR = './processed';
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

fs.readdirSync(INPUT_DIR).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);

  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    sharp(inputPath)
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: 'contain', background: '#ffffff' })
      .toFile(outputPath)
      .then(() => console.log(`✅ Resized image: ${file}`))
      .catch(err => console.error(`❌ Failed image: ${file}`, err));
  } else if (['.mp4', '.mov'].includes(ext)) {
    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=${IMAGE_WIDTH}:${IMAGE_HEIGHT}:force_original_aspect_ratio=decrease,pad=${IMAGE_WIDTH}:${IMAGE_HEIGHT}:(ow-iw)/2:(oh-ih)/2:white`,
        '-c:a copy'
      ])
      .output(outputPath)
      .on('end', () => console.log(`✅ Resized video: ${file}`))
      .on('error', err => console.error(`❌ Failed video: ${file}`, err))
      .run();
  }
});
