const fs = require('fs');
const html = fs.readFileSync('wingrox-os.html', 'utf8');
const match = html.match(/var PLATFORM_ECOSYSTEM=([\s\S]*?);\s*\n/);
if (!match) { console.log('NOT FOUND'); process.exit(1); }
// Reassemble base64 from concatenated quoted chunks
const raw = match[1]
  .replace(/\n/g, '')
  .replace(/\s*\+\s*/g, '')
  .replace(/^"/, '')
  .replace(/"$/, '');
const decoded = Buffer.from(raw, 'base64').toString('utf8');
fs.writeFileSync('_eco_decoded.html', decoded, 'utf8');
console.log('Decoded length:', decoded.length, 'lines:', decoded.split('\n').length);
