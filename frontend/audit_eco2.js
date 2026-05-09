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
// Find all .active class usages on views
lines.forEach((l,i) => { if (/class=.*active|view-success|id="view-success|currentView|showView\('landing'\)|showView\('success'\)/.test(l)) console.log(i+1, l.trim().slice(0,120)); });
