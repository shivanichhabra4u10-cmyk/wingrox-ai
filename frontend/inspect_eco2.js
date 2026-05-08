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
const si2 = lines.findIndex(l => l.includes('function submitApplication'));
console.log('submitApplication at line:', si2+1);
lines.slice(si2, si2+30).forEach((l,i) => console.log(si2+1+i, l));
