const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

const step = (msg) => console.log(`\n${colors.cyan}${colors.bold}>>> [ANTIGRAVITY SCAN] ${msg}...${colors.reset}`);
const success = (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`);
const fail = (msg) => {
    console.error(`${colors.red}✖ CRITICAL ERROR: ${msg}${colors.reset}`);
    process.exit(1);
};

console.log(`${colors.bold}🚀 ANTIGRAVITY DIAGNOSTIC TOOL V1.0${colors.reset}`);
console.log('========================================');

// 1. ARCHITECTURE CHECK
step('Checking Critical Files');
const requiredFiles = [
    'package.json',
    'vercel.json',
    '.env',
    'src/App.jsx',
    'src/main.jsx',
    'api/create-payment.js' 
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
        success(`Found: ${file}`);
    } else {
        fail(`Missing critical file: ${file}`);
    }
});

// 2. DEPENDENCY CHECK
step('Checking Node Modules');
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    console.warn(`${colors.yellow}⚠ node_modules not found. Installing...${colors.reset}`);
    try {
        execSync('npm install', { stdio: 'inherit' });
        success('Dependencies installed');
    } catch (e) {
        fail('Failed to install dependencies');
    }
} else {
    success('Modules ready');
}

// 3. BUILD SIMULATION
step('Running Production Build Simulation');
try {
    // Attempt a real build to catch compilation errors
    execSync('npx vite build', { stdio: 'inherit' });
    success('Build Successful! System is stable.');
} catch (e) {
    fail('BUILD FAILED. Fix errors before deploying.');
}

console.log('\n========================================');
console.log(`${colors.green}${colors.bold}✅ SYSTEM GREEN. ALL SYSTEMS OPERATIONAL.${colors.reset}`);
process.exit(0);
