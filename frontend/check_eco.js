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
console.log('Bridge present:', dec.includes('WINGROX BRIDGE'));
console.log('postMessage present:', dec.includes('wingrox:partner:apply'));
console.log('nextStep wrap:', dec.includes('nextStep=function'));
const fnIdx = dec.indexOf('function nextStep');
const varIdx = dec.indexOf('nextStep=function') !== -1 || dec.indexOf('nextStep = function') !== -1;
console.log('nextStep as declaration (hoistable):', fnIdx > -1, 'at', fnIdx);
console.log('nextStep as var:', varIdx);
// Show the bridge snippet
const bi = dec.indexOf('WINGROX BRIDGE');
if (bi > -1) console.log('Bridge snippet:\n', dec.slice(bi, bi+200));
