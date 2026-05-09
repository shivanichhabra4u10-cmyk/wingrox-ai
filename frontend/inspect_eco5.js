const fs = require('fs');
const html = fs.readFileSync('wingrox-os.html', 'utf8');
const si = html.indexOf('var PLATFORM_ECOSYSTEM=');
let pos = si + 23, raw = '';
while (pos < html.length) {
  if (html[pos] === '"') { const e = html.indexOf('"', pos+1); raw += html.slice(pos+1,e); pos=e+1; }
  else if (['+','\n','\r',' '].includes(html[pos])) { pos++; }
  else break;
}
const dec = Buffer.from(raw, 'base64').toString('utf8');
const lines = dec.split('\n');
const ni = lines.findIndex(l => l.includes('function showView('));
console.log('showView defined at line:', ni+1);
if (ni > -1) lines.slice(ni, ni+15).forEach((l,i) => console.log(ni+1+i, l));
// Also check for syntax errors near our injected code
const ui = lines.findIndex(l => l.includes('URL validation'));
console.log('\nURL validation at line:', ui+1);
if (ui > -1) lines.slice(ui, ui+20).forEach((l,i) => console.log(ui+1+i, l));
