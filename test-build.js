// Simple test to verify application structure
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing application structure...\n');

// Check if required directories exist
const requiredDirs = [
  'client/src',
  'client/src/components',
  'client/src/contexts',
  'client/src/pages',
  'controllers',
  'routes',
  'config'
];

console.log('📁 Checking directories:');
requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${dir}: ${exists ? 'Found' : 'Missing'}`);
});

// Check if required files exist
console.log('\n📄 Checking key files:');
const requiredFiles = [
  'client/src/App.jsx',
  'client/src/main.jsx',
  'client/package.json',
  'server.js',
  'package.json',
  'config/database.js',
  'controllers/authController.js'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
});

// Check package.json scripts
console.log('\n⚙️  Checking build scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'client/package.json'), 'utf8'));
  const hasBuildScript = !!packageJson.scripts?.build;
  console.log(`${hasBuildScript ? '✅' : '❌'} Build script in client/package.json: ${hasBuildScript ? 'Present' : 'Missing'}`);
  
  if (hasBuildScript) {
    console.log(`   Script: ${packageJson.scripts.build}`);
  }
} catch (error) {
  console.log('❌ Error reading client/package.json');
}

console.log('\n✅ Structure check complete!');