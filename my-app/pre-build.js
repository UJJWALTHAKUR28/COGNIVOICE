#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting pre-build process...');

// Check if .env.local exists, if not create from .env.example
const envLocalPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
  console.log('📝 Creating .env.local from .env.example...');
  fs.copyFileSync(envExamplePath, envLocalPath);
}

// Install missing TypeScript dependencies
console.log('📦 Installing TypeScript dependencies...');
try {
  execSync('npm install --save-dev typescript @types/react @types/node', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  TypeScript dependencies installation failed, continuing...');
}

// Fix npm audit issues (non-breaking fixes only)
console.log('🔧 Fixing npm audit issues...');
try {
  execSync('npm audit fix --only=prod', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Some audit issues could not be auto-fixed (this is normal)');
}

// Run ESLint to check for any remaining issues
console.log('🔍 Running ESLint check...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ ESLint check passed!');
} catch (error) {
  console.log('❌ ESLint issues found. Please fix them before building.');
  process.exit(1);
}

console.log('✅ Pre-build process completed successfully!');