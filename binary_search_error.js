const fs = require('fs');

// Read the extracted script
const content = fs.readFileSync('script_1_check.js', 'utf8');
const lines = content.split('\n');

function testLines(start, end) {
  // Test if lines [start, end) are syntactically valid
  // We wrap in an async function to allow 'await' at top level
  const testContent = lines.slice(start, end).join('\n');
  
  // Try wrapping in an async IIFE to allow top-level await
  const wrapped = '(async () => {\n' + testContent + '\n})();';
  
  try {
    require('vm').runInThisContext(wrapped, { filename: 'test.js', displayErrors: true });
    return true;
  } catch (e) {
    return false;
  }
}

function findErrorRange(start, end) {
  if (end - start <= 1) {
    console.log(`Error between lines ${start+1} and ${end+1}`);
    console.log(`Line ${start+1}: ${lines[start].substring(0, 100)}`);
    console.log(`Line ${end+1}: ${lines[end].substring(0, 100)}`);
    return;
  }
  
  const mid = Math.floor((start + end) / 2);
  
  // Test each half
  const firstHalfOk = testLines(start, mid);
  const secondHalfOk = testLines(mid, end);
  
  console.log(`Range [${start+1}, ${end+1}]: first=${firstHalfOk}, second=${secondHalfOk}`);
  
  if (!firstHalfOk) {
    findErrorRange(start, mid);
  } else if (!secondHalfOk) {
    findErrorRange(mid, end);
  } else {
    // Error might span both halves
    console.log(`Both halves seem OK individually, error at boundary [${start+1}, ${end+1}]`);
  }
}

// Test the full file
try {
  require('vm').runInThisContext('(async () => {\n' + content + '\n})();', { filename: 'test.js', displayErrors: false });
  console.log('Full file compiles OK when wrapped in async IIFE');
} catch(e) {
  console.log('Full file error:', e.message?.substring(0, 100));
  // Binary search for the error
  findErrorRange(0, lines.length);
}
