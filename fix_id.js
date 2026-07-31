const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
const searchStr = '<!-- Opção 2: PDF -->\r\n        <div class="config-group session-config-card primary"';
const replaceStr = '<!-- Opção 2: PDF -->\r\n        <div id="free-upload-area" class="config-group session-config-card primary"';

if (c.includes(searchStr)) {
  c = c.replace(searchStr, replaceStr);
  fs.writeFileSync('index.html', c);
  console.log("Success with \\r\\n");
} else {
  const searchStrLF = searchStr.replace('\r\n', '\n');
  const replaceStrLF = replaceStr.replace('\r\n', '\n');
  if (c.includes(searchStrLF)) {
    c = c.replace(searchStrLF, replaceStrLF);
    fs.writeFileSync('index.html', c);
    console.log("Success with \\n");
  } else {
    console.log("Could not find the string to replace!");
  }
}
