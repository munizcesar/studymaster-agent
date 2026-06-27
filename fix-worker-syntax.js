const fs = require('fs');
let content = fs.readFileSync('worker.js', 'utf8');

// The problematic pattern: template literal closes with `; then the next line
// starts with ${concursoBancaInstr ? ... which is outside the template literal
// 
// Fix: move the template literal closing to AFTER the conditional banca instr

function fixBancaInstr(content, searchTerm) {
  const idx = content.indexOf(searchTerm);
  if (idx < 0) return content;
  
  const before = content.substring(0, idx);
  const lastBacktickSemicolon = before.lastIndexOf('`;');
  
  if (lastBacktickSemicolon < 0) return content;
  
  const afterBancaEnd = content.indexOf(': ""}', idx);
  if (afterBancaEnd < 0) return content;
  
  console.log('Found', searchTerm);
  
  // Remove `; (2 chars) before the ${, and add `; after the : ""}
  const part1 = content.substring(0, lastBacktickSemicolon);
  const part2 = content.substring(lastBacktickSemicolon + 2, idx); // was between `; and $
  const expr = content.substring(idx, afterBancaEnd + 5); // the ${... : ""}
  const part3 = content.substring(afterBancaEnd + 5);
  
  return part1 + part2 + expr + '`;' + part3;
}

content = fixBancaInstr(content, 'concursoBancaInstr ?');
content = fixBancaInstr(content, 'academicBancaInstr ?');

fs.writeFileSync('worker.js', content, 'utf8');
console.log('Done. File written.');
