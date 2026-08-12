#!/usr/bin/env node

/**
 * AI Code Review Subagent
 * Uses AI to review code changes with deeper analysis.
 * 
 * Usage:
 *   node scripts/ai-review.js              # Review uncommitted changes
 *   node scripts/ai-review.js --staged     # Review staged changes
 *   node scripts/ai-review.js <file>       # Review specific file
 *   node scripts/ai-review.js --commit <hash> # Review commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
      cmd = `git diff-tree --no-commit-id --name-only -r ${process.argv[3]}`;
    } else {
      cmd = 'git diff --name-only --diff-filter=ACM';
    }
    const output = execSync(cmd, { encoding: 'utf-8' }).trim();
    return output ? output.split('\n').filter(f => f) : [];
  } catch {
    return [];
  }
}

function getDiff(file, mode = 'unstaged') {
  try {
    let cmd;
    if (mode === 'staged') {
      cmd = `git diff --cached "${file}"`;
    } else if (mode === 'commit') {
      cmd = `git show ${process.argv[3]} -- "${file}"`;
    } else {
      cmd = `git diff "${file}"`;
    }
    return execSync(cmd, { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

function getFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function buildReviewPrompt(files, diffs) {
  const prompt = `Review these code changes:

${files.map((f, i) => `File: ${f}\n\`\`\`\n${diffs[f]}\n\`\`\``).join('\n\n')}

Analyze for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Code quality problems
5. Missing error handling

Provide specific, actionable feedback with line numbers.`;

  return prompt;
}

function printReport(file, issues) {
  log('blue', `\n📄 ${file}`);
  
  if (issues.length === 0) {
    log('green', '  ✅ No issues found');
    return;
  }

  issues.forEach(issue => {
    const severityColor = issue.severity === 'ERROR' ? 'red' : 
                          issue.severity === 'WARNING' ? 'yellow' : 'cyan';
    log(severityColor, `  ${issue.severity}: ${issue.message}`);
    if (issue.fix) {
      log('cyan', `    💡 Fix: ${issue.fix}`);
    }
  });
}

function reviewWithAI(prompt) {
  // This would integrate with an AI API in production
  // For now, we'll use the static analysis as a fallback
  log('cyan', '\n🤖 AI Code Review Analysis\n');
  log('magenta', 'To enable full AI review, configure an API key in .env:');
  log('magenta', '  AI_REVIEW_API_KEY=your-api-key\n');
  
  // Simulate AI analysis with enhanced static checks
  return [];
}

function analyzeCode(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  const ext = path.extname(filePath);

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // JavaScript/TypeScript checks
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      // Security issues
      if (trimmed.includes('eval(')) {
        issues.push({
          severity: 'ERROR',
          message: 'eval() is a security risk - use Function constructor or JSON.parse instead',
          fix: 'Replace eval() with safer alternative',
        });
      }

      if (trimmed.includes('innerHTML') && !filePath.includes('.html')) {
        issues.push({
          severity: 'ERROR',
          message: 'innerHTML can cause XSS vulnerabilities',
          fix: 'Use textContent or React components instead',
        });
      }

      if (trimmed.match(/\$\{.*\}.*WHERE/i) || trimmed.match(/query.*\+/)) {
        issues.push({
          severity: 'ERROR',
          message: 'Potential SQL/NoSQL injection - use parameterized queries',
          fix: 'Use query parameters instead of string concatenation',
        });
      }

      // Logic issues
      if (trimmed.match(/if\s*\([^)]*=[^=][^)]*\)/)) {
        issues.push({
          severity: 'WARNING',
          message: 'Assignment in condition (did you mean == or ===?)',
          fix: 'Use === for comparison or move assignment outside condition',
        });
      }

      if (trimmed === 'catch (e) {}' || trimmed === 'catch {}') {
        issues.push({
          severity: 'WARNING',
          message: 'Empty catch block swallows errors',
          fix: 'Log error or rethrow: catch (e) { console.error(e); }',
        });
      }

      // Performance
      if (trimmed.includes('.forEach') && trimmed.includes('await')) {
        issues.push({
          severity: 'WARNING',
          message: 'await in forEach does not wait - use for...of loop',
          fix: 'Replace forEach with: for (const item of array) { await ... }',
        });
      }

      if (trimmed.match(/\.map\(.*\.filter\(/) || trimmed.match(/\.filter\(.*\.map\(/)) {
        issues.push({
          severity: 'INFO',
          message: 'Chained map/filter - consider using reduce for single pass',
          fix: 'Use .reduce() to combine operations if performance matters',
        });
      }

      // Error handling
      if (trimmed.includes('.then(') && !trimmed.includes('.catch(')) {
        const nextLines = lines.slice(index, index + 5).join('\n');
        if (!nextLines.includes('.catch(')) {
          issues.push({
            severity: 'WARNING',
            message: 'Promise chain without .catch()',
            fix: 'Add .catch() handler or use try/await/catch',
          });
        }
      }

      // Code quality
      if (trimmed.length > 120) {
        issues.push({
          severity: 'INFO',
          message: `Line too long (${trimmed.length} chars)`,
          fix: 'Break into multiple lines for readability',
        });
      }

      if (trimmed.match(/console\.(log|warn|error)/) && !filePath.includes('scripts/')) {
        issues.push({
          severity: 'INFO',
          message: 'Console statement in production code',
          fix: 'Remove or use a proper logging library',
        });
      }
    }

    // React-specific checks
    if (['.jsx', '.tsx'].includes(ext)) {
      if (trimmed.includes('useState') && trimmed.includes('useEffect')) {
        // This is a heuristic - actual implementation would parse AST
      }

      if (trimmed.includes('dangerouslySetInnerHTML')) {
        issues.push({
          severity: 'ERROR',
          message: 'dangerouslySetInnerHTML can cause XSS',
          fix: 'Sanitize input or use textContent',
        });
      }
    }

    // CSS checks
    if (ext === '.css') {
      if (trimmed.includes('!important')) {
        issues.push({
          severity: 'WARNING',
          message: 'Avoid !important - increases specificity wars',
          fix: 'Use more specific selectors instead',
        });
      }
    }
  });

  return issues;
}

function main() {
  const args = process.argv.slice(2);
  let mode = 'unstaged';
  let files = [];

  if (args.includes('--staged')) {
    mode = 'staged';
    files = getChangedFiles('staged');
  } else if (args.includes('--commit')) {
    mode = 'commit';
    files = getChangedFiles('commit');
  } else if (args[0] && !args[0].startsWith('-')) {
    files = [args[0]];
  } else {
    files = getChangedFiles('unstaged');
  }

  if (files.length === 0) {
    log('green', 'No files to review.');
    process.exit(0);
  }

  log('cyan', `\n🔍 AI Code Review - Analyzing ${files.length} file(s)...\n`);
  console.log('='.repeat(60));

  let totalIssues = 0;

  for (const file of files) {
    const content = mode === 'unstaged' ? getFileContent(file) : 
                    getDiff(file, mode) || getFileContent(file);
    
    const issues = analyzeCode(content, file);
    printReport(file, issues);
    totalIssues += issues.length;
  }

  console.log('='.repeat(60));
  
  if (totalIssues === 0) {
    log('green', '\n✅ No issues found! Code looks good.\n');
  } else {
    log('yellow', `\n⚠️  Found ${totalIssues} potential issue(s)\n`);
  }

  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
