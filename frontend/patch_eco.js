// patch_eco.js — injects postMessage bridge into submitApplication() in PLATFORM_ECOSYSTEM
const fs = require('fs');
const html = fs.readFileSync('wingrox-os.html', 'utf8');

const startTag = 'var PLATFORM_ECOSYSTEM=';
const startIdx = html.indexOf(startTag);
if (startIdx === -1) { console.error('NOT FOUND'); process.exit(1); }
let pos = startIdx + startTag.length, raw = '';
while (pos < html.length) {
  if (html[pos] === '"') { const e = html.indexOf('"', pos+1); raw += html.slice(pos+1,e); pos=e+1; }
  else if (['+','\n','\r',' '].includes(html[pos])) { pos++; }
  else break;
}

let dec = Buffer.from(raw, 'base64').toString('utf8');
console.log('Decoded len:', dec.length);

// Strip any previously injected nextStep bridges
dec = dec.replace(/\n\/\/ WINGROX BRIDGE[\s\S]{0,2000}?\}\)\(\);\n/g, '\n');
console.log('After cleanup len:', dec.length);

const TARGET = "showToast('Application submitted! Generating certificate...');";
if (!dec.includes(TARGET)) { console.error('Target line not found'); process.exit(1); }

const INJECT = [
  '',
  '  // WinGroX bridge: send to parent → backend',
  '  (function(){',
  '    try {',
  '      var _exp = [];',
  '      document.querySelectorAll(".chip.selected,.chip.active,.custom-chip").forEach(function(el){',
  '        var t = el.textContent.replace(/\\u2715|\\u00d7/g,"").trim(); if(t) _exp.push(t);',
  '      });',
  '      window.parent.postMessage({',
  "        type: 'wingrox:partner:apply',",
  '        payload: {',
  '          name:              (document.getElementById("f-name")    ||{}).value||"",',
  '          email:             (document.getElementById("sig-email") ||{}).value||"",',
  '          linkedin:          (document.getElementById("f-linkedin")||{}).value||"",',
  '          website:           (document.getElementById("f-website") ||document.getElementById("f-url")||{}).value||"",',
  '          expertise:         _exp,',
  '          otpVerified:       typeof otpVerified  !=="undefined"?!!otpVerified :true,',
  '          ndaSigned:         typeof ndaScrolled  !=="undefined"?!!ndaScrolled :true,',
  '          signatureProvided: true',
  '        }',
  "      }, '*');",
  '    } catch(_e){ console.warn("WinGroX bridge error:",_e); }',
  '  })();',
].join('\n');

dec = dec.replace(TARGET, TARGET + INJECT);
console.log('Bridge injected OK');

const encoded = Buffer.from(dec, 'utf8').toString('base64');
const chunks = encoded.match(/.{1,80}/g);
const jsVar = 'var PLATFORM_ECOSYSTEM=' + chunks.map(function(c){ return '"'+c+'"'; }).join('\n+') + ';';
const endIdx = html.indexOf(';', startIdx + startTag.length);
const updated = html.slice(0, startIdx) + jsVar + html.slice(endIdx + 1);
fs.writeFileSync('wingrox-os.html', updated, 'utf8');
console.log('Done. Encoded length:', encoded.length);
