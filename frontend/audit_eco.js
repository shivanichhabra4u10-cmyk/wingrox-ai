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

// 1. Count postMessage calls
const pmLines = lines.filter(l => l.includes("wingrox:partner:apply"));
console.log('=== postMessage occurrences:', pmLines.length);
pmLines.forEach((l,i) => console.log(i, l.trim().slice(0,100)));

// 2. Show submitApplication function
const sai = lines.findIndex(l => l.includes('function submitApplication'));
console.log('\n=== submitApplication:');
lines.slice(sai, sai+35).forEach((l,i) => console.log(sai+1+i, l));

// 3. Show validateStep step 1 block
const vi = lines.findIndex(l => l.includes('function validateStep'));
console.log('\n=== validateStep:');
lines.slice(vi, vi+30).forEach((l,i) => console.log(vi+1+i, l));
