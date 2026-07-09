const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

let changes = 0;

// 1. Replace ✔️ and ❌ emojis in the history answer icon with data-lucide
const emojiRegex = /const icon = answer\.correct \? '✔️' : '❌';/;
if (emojiRegex.test(content)) {
  content = content.replace(
    emojiRegex,
    `const icon = answer.correct ? '<i data-lucide="check-circle-2" width="12" height="12"></i>' : '<i data-lucide="x-circle" width="12" height="12"></i>';`
  );
  changes++;
  console.log('✅ Replaced ✔️❌ emojis with Lucide icons');
} else {
  console.log('⚠️ Pattern for ✔️❌ not found');
}

// 2. Replace 🧠 emoji in CSS comments
const brain1 = content.indexOf('/* 🧠 MENTOR CEREBRO');
if (brain1 !== -1) {
  content = content.replace('/* 🧠 MENTOR CEREBRO', '/* MENTOR CEREBRO');
  changes++;
  console.log('✅ Replaced 🧠 in MENTOR CEREBRO comment');
} else {
  console.log('⚠️ Pattern for 🧠 MENTOR CEREBRO not found');
}

const brain2 = content.indexOf('/* 🧠 Indicador de Cerebro');
if (brain2 !== -1) {
  content = content.replace('/* 🧠 Indicador de Cerebro', '/* Indicador de Cerebro');
  changes++;
  console.log('✅ Replaced 🧠 in Indicador de Cerebro comment');
} else {
  console.log('⚠️ Pattern for 🧠 Indicador de Cerebro not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Total changes: ${changes}`);
process.exit(0);
