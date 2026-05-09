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
// Try parsing all script blocks for syntax errors
const scriptBlocks = [];
let idx = 0;
while (true) {
  const s = dec.indexOf('<script', idx);
  if (s === -1) break;
  const se = dec.indexOf('>', s);
  const e = dec.indexOf('</script>', se);
  if (e === -1) break;
  scriptBlocks.push({ start: s, code: dec.slice(se+1, e) });
  idx = e + 9;
}
console.log('Script blocks found:', scriptBlocks.length);
scriptBlocks.forEach((b, i) => {
  try {
    new Function(b.code);
    console.log('Block', i+1, 'OK, len:', b.code.length);
  } catch(e) {
    const line = (dec.slice(0, b.start).match(/\n/g)||[]).length + 1;
    console.error('Block', i+1, 'SYNTAX ERROR at approx HTML line', line, ':', e.message);
    // Show context around error
    const errLine = parseInt((e.message.match(/line (\d+)/)||[])[1]);
    if (errLine) {
      const lines = b.code.split('\n');
      lines.slice(Math.max(0,errLine-3), errLine+2).forEach((l,j) => console.log(errLine-2+j, l));
    }
  }
});
