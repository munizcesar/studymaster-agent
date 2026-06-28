const fs = require('fs');
const content = fs.readFileSync('final_check.js', 'utf8');

const tests = [
  { closings: '}\n}\n}\n)\n)\n`\n;', desc: '3 braces + 2 parens + backtick' },
  { closings: '}\n}\n}\n)\n`\n;', desc: '3 braces + 1 paren + backtick' },
  { closings: '}\n}\n}\n)\n)\n;', desc: '3 braces + 2 parens' },
  { closings: '}\n}\n}\n)\n;', desc: '3 braces + 1 paren' },
  { closings: '}\n}\n}\n`\n;', desc: '3 braces + backtick' },
  { closings: '}\n}\n)\n)\n`\n;', desc: '2 braces + 2 parens + backtick' },
  { closings: '}\n}\n)\n`\n;', desc: '2 braces + 1 paren + backtick' },
  { closings: '}\n}\n`\n;', desc: '2 braces + backtick' },
  { closings: '}\n)\n`\n;', desc: '1 brace + 1 paren + backtick' },
  { closings: '}\n}\n}\n)\n)\n`\n)\n;', desc: '3 braces + 3 parens + backtick' },
  { closings: '}\n}\n}\n}\n)\n)\n`\n;', desc: '4 braces + 2 parens + backtick' },
  { closings: '}\n}\n}\n}\n`\n;', desc: '4 braces + backtick' },
  { closings: ')\n`\n;', desc: '1 paren + backtick' },
  { closings: '`\n;', desc: 'backtick only' },
  { closings: '}\n;\n', desc: '1 brace' },
  { closings: '}\n}\n;\n', desc: '2 braces' },
  { closings: '}\n}\n}\n;\n', desc: '3 braces' },
  { closings: '}\n}\n}\n}\n;\n', desc: '4 braces' },
  { closings: '}\n}\n}\n}\n}\n;\n', desc: '5 braces' },
  { closings: ')\n;\n', desc: '1 paren' },
  { closings: ')\n)\n;\n', desc: '2 parens' },
];

const results = [];
for (const test of tests) {
  const testContent = content + test.closings;
  const fs2 = require('fs');
  fs2.writeFileSync('test_closing.js', testContent);
  
  try {
    require('child_process').execSync('node --check test_closing.js 2>&1', { stdio: 'pipe' });
    results.push({ desc: test.desc, ok: true, closings: test.closings });
  } catch (e) {
    results.push({ desc: test.desc, ok: false, error: e.stderr?.toString()?.substring(0, 100) || e.message?.substring(0, 100) });
  }
}

console.log('Results:');
for (const r of results) {
  console.log(`  ${r.ok ? 'OK' : 'FAIL'}: ${r.desc}${r.error ? ' - ' + r.error : ''}`);
}
