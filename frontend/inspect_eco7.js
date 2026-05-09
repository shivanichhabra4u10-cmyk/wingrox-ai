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
const s = dec.indexOf('<script');
const se = dec.indexOf('>', s);
const e = dec.indexOf('</script>', se);
const code = dec.slice(se+1, e);
const lines = code.split('\n');
// Show around the validateStep area
const vi = lines.findIndex(l => l.includes('function validateStep'));
console.log('validateStep at code line:', vi+1);
lines.slice(Math.max(0,vi-2), vi+35).forEach((l,i) => console.log(vi-1+i, l));
