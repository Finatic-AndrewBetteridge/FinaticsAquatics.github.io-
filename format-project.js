
// format-project.js - Automatically formats CSS, HTML, and JS files in a project

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const TARGET_DIR = './'; // Set this to your project root
const SUPPORTED_EXTENSIONS = ['.js', '.css', '.html'];

function formatFile(filePath) {
  const ext = path.extname(filePath);
  if (!SUPPORTED_EXTENSIONS.includes(ext)) return;

  const source = fs.readFileSync(filePath, 'utf-8');
  const config = prettier.resolveConfig.sync(filePath) || {};
  try {
    const formatted = prettier.format(source, { ...config, filepath: filePath });
    fs.writeFileSync(filePath, formatted, 'utf-8');
    console.log(`✅ Formatted: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error formatting ${filePath}:`, error.message);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      formatFile(fullPath);
    }
  });
}

walk(TARGET_DIR);
