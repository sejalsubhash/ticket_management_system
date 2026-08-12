#!/usr/bin/env node

/**
 * Code Review Script
 * Reviews changed files before commit and reports issues.
 * 
 * Usage:
 *   node scripts/review-changes.js          # Review uncommitted changes
 *   node scripts/review-changes.js --staged  # Review staged changes only
 *   node scripts/review-changes.js <commit>  # Review specific commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxFileSize: 500 * 1024, // 500KB max file size to review
  ignorePatterns: [
    'package-lock.json',
    '*.min.js',
    '*.min.css',
    'dist/',
    'build/',
    '.env',
    'uploads/',
  ],
  jsPatterns: ['*.js', '*.jsx', '*.ts', '*.tsx'],
  cssPatterns: ['*.css'],
};

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getChangedFiles(mode = 'unstaged') {
  try {
    let cmd;
    if (mode === 'staged') {
      cmd = 'git diff --cached --name-only --diff-filter=ACM';
    } else if (mode === 'commit') {
      cmd = `git diff-tree --no-commit-id --name-only -r ${process.argv[2]}`;
    } else {
      cmd = 'git diff --name-only --diff-filter=ACM';
    }
    
    const output = execSync(cmd, { encoding: 'utf-8' }).trim();
    return output ? output.split('\n').filter(f => f) : [];
  } catch (error) {
    return [];
  }
}

function shouldIgnoreFile(filePath) {
  return CONFIG.ignorePatterns.some(pattern => {
    if (pattern.startsWith('*')) {
      return filePath.endsWith(pattern.slice(1));
    }
    return filePath.includes(pattern);
  });
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function reviewJavaScript(filePath, content) {
  const issues = [];
  const lines = content.split('\n');

  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Console.log statements (warn in production code)
    if (trimmed.includes('console.log') && !filePath.includes('test')) {
      issues.push({
        type: 'warning',
        line: lineNum,
        message: 'Avoid console.log in production code',
      });
    }

    // TODO/FIXME comments
    if (trimmed.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/i)) {
      issues.push({
        type: 'info',
        line: lineNum,
        message: 'Contains TODO/FIXME comment',
      });
    }

    // Potential security issues
    if (trimmed.includes('eval(')) {
      issues.push({
        type: 'error',
        line: lineNum,
        message: 'Avoid using eval() - potential security risk',
      });
    }

    if (trimmed.includes('innerHTML')) {
      issues.push({
        type: 'warning',
        line: lineNum,
        message: 'innerHTML can cause XSS vulnerabilities',
      });
    }

    // Hardcoded secrets (basic patterns)
    if (trimmed.match(/(password|secret|api_key|apikey)\s*[:=]\s*['"][^'"]+['"]/i)) {
      issues.push({
        type: 'error',
        line: lineNum,
        message: 'Potential hardcoded secret detected',
      });
    }

    // Empty catch blocks
    if (trimmed === 'catch {' || trimmed === 'catch(e) {') {
      const nextLine = lines[index + 1]?.trim();
      if (!nextLine || nextLine === '}') {
        issues.push({
          type: 'warning',
          line: lineNum,
          message: 'Empty catch block - consider handling the error',
        });
      }
    }
  });

  return issues;
}

function reviewCSS(filePath, content) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Inline styles (in CSS files, this might be intentional)
    if (trimmed.includes('!important')) {
      issues.push({
        type: 'warning',
        line: lineNum,
        message: 'Avoid !important when possible',
      });
    }
  });

  return issues;
}

function reviewFile(filePath) {
  const issues = [];
  
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > CONFIG.maxFileSize) {
      return [{ type: 'warning', line: 0, message: 'File too large to review' }];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = getFileExtension(filePath);

    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      issues.push(...reviewJavaScript(filePath, content));
    } else if (ext === '.css') {
      issues.push(...reviewCSS(filePath, content));
    }

    // Check file size
    const lineCount = content.split('\n').length;
    if (lineCount > 300) {
      issues.push({
        type: 'info',
        line: 0,
        message: `Large file (${lineCount} lines) - consider splitting`,
      });
    }
  } catch (error) {
    issues.push({
      type: 'error',
      line: 0,
      message: `Could not read file: ${error.message}`,
    });
  }

  return issues;
}

function printReport(results) {
  let totalErrors = 0;
  let totalWarnings = 0;

  console.log('\n' + '='.repeat(60));
  log('cyan', '  CODE REVIEW REPORT');
  console.log('='.repeat(60) + '\n');

  for (const [filePath, issues] of Object.entries(results)) {
    if (issues.length === 0) continue;

    log('blue', `\n📄 ${filePath}`);
    
    issues.forEach(issue => {
      const prefix = issue.line > 0 ? `  Line ${issue.line}:` : '  ';
      
      if (issue.type === 'error') {
        log('red', `${prefix} ❌ ERROR: ${issue.message}`);
        totalErrors++;
      } else if (issue.type === 'warning') {
        log('yellow', `${prefix} ⚠️  WARNING: ${issue.message}`);
        totalWarnings++;
      } else {
        log('cyan', `${prefix} ℹ️  INFO: ${issue.message}`);
      }
    });
  }

  console.log('\n' + '-'.repeat(60));
  
  if (totalErrors === 0 && totalWarnings === 0) {
    log('green', '✅ No issues found!');
  } else {
    if (totalErrors > 0) log('red', `❌ ${totalErrors} error(s)`);
    if (totalWarnings > 0) log('yellow', `⚠️  ${totalWarnings} warning(s)`);
  }
  
  console.log('-'.repeat(60) + '\n');

  return totalErrors;
}

function main() {
  const args = process.argv.slice(2);
  let mode = 'unstaged';
  let files = [];

  if (args.includes('--staged')) {
    mode = 'staged';
    files = getChangedFiles('staged');
  } else if (args[0] && !args[0].startsWith('-')) {
    mode = 'commit';
    files = getChangedFiles('commit');
  } else {
    files = getChangedFiles('unstaged');
  }

  if (files.length === 0) {
    log('green', 'No files to review.');
    process.exit(0);
  }

  log('cyan', `\n🔍 Reviewing ${files.length} changed file(s)...\n`);

  const results = {};
  
  for (const file of files) {
    if (shouldIgnoreFile(file)) continue;
    results[file] = reviewFile(file);
  }

  const errorCount = printReport(results);
  
  // Exit with error if there are errors (for pre-commit hook)
  process.exit(errorCount > 0 ? 1 : 0);
}

main();
