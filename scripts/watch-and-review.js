#!/usr/bin/env node

/**
 * File Watcher with Auto Code Review
 * Watches for file changes and runs code review automatically.
 * 
 * Usage:
 *   node scripts/watch-and-review.js              # Watch client/src
 *   node scripts/watch-and-review.js --server     # Watch server/src
 *   node scripts/watch-and-review.js --all        # Watch everything
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WATCH_DIRS = {
  client: path.join(__dirname, '../client/src'),
  server: path.join(__dirname, '../server/src'),
};

const CONFIG = {
  debounceMs: 1000,
  ignorePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'uploads',
    '*.log',
    'package-lock.json',
  ],
};

let debounceTimer = null;
let lastReviewedFile = null;

function shouldIgnore(filePath) {
  return CONFIG.ignorePatterns.some(pattern => {
    if (pattern.startsWith('*')) {
      return filePath.includes(pattern.slice(1));
    }
    return filePath.includes(pattern);
  });
}

function reviewFile(filePath) {
  try {
    console.log(`\n🔍 Reviewing: ${path.relative(process.cwd(), filePath)}`);
    console.log('─'.repeat(50));
    
    // Run review on single file
    execSync(`node scripts/review-changes.js`, {
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    // Review script exits with code 1 if errors found - that's ok
  }
}

function handleFileChange(eventType, filePath) {
  // Debounce rapid changes
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    if (filePath && !shouldIgnore(filePath) && fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && stat.size < 500 * 1024) {
        reviewFile(filePath);
      }
    }
  }, CONFIG.debounceMs);
}

function startWatching(dirs) {
  console.log('🚀 Starting file watcher with auto code review...\n');
  console.log('Watching directories:');
  
  for (const [name, dir] of Object.entries(dirs)) {
    if (fs.existsSync(dir)) {
      console.log(`  📁 ${name}: ${dir}`);
      fs.watch(dir, { recursive: true }, handleFileChange);
    } else {
      console.log(`  ⚠️  ${name}: ${dir} (not found)`);
    }
  }

  console.log('\nPress Ctrl+C to stop.\n');
}

// Parse arguments
const args = process.argv.slice(2);
let dirs = {};

if (args.includes('--all')) {
  dirs = WATCH_DIRS;
} else if (args.includes('--server')) {
  dirs = { server: WATCH_DIRS.server };
} else {
  dirs = { client: WATCH_DIRS.client };
}

startWatching(dirs);
