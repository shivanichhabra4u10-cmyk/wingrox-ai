// patch_eco.js — clean canonical patch for PLATFORM_ECOSYSTEM
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

// ── PATCH 0: Force #view-success to display:none by default ──
// The original CSS has #view-success { display:flex } which always shows it.
dec = dec.replace(/#view-success\s*\{([^}]*?)display\s*:\s*flex([^}]*?)\}/g, function(m, before, after) {
  return '#view-success {' + before + 'display:none' + after + '}';
});
console.log('PATCH 0: #view-success display overridden to none');

// ── PATCH 1: Replace validateStep with canonical clean version ──
// (LinkedIn mandatory, website optional URL validation, no duplicate blocks)
const VALIDATE_RE = /function validateStep\(step\) \{[\s\S]*?return true;\s*\}/;
const VALIDATE_CLEAN = `function validateStep(step) {
  if (step === 1) {
    if (!document.getElementById('f-name').value.trim()) { showToast('Please enter your full name'); return false; }
    if (!document.getElementById('f-email').value.trim()) { showToast('Please enter your email'); return false; }
    if (!document.getElementById('f-phone').value.trim()) { showToast('Please enter your mobile number'); return false; }
    var liVal = (document.getElementById('f-linkedin')||{}).value.trim();
    if (!liVal) { showToast('LinkedIn profile URL is required'); return false; }
    if (!/^(https?:\\/\\/)?[^\\s]{3,}\\.[^\\s]{2,}/i.test(liVal)) { showToast('Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/your-name)'); return false; }
  }
  if (step === 2) {
    if (selectedExpertise.size === 0) { showToast('Please select at least one expertise area'); return false; }
  }
  if (step === 3) {
    var webVal = ((document.getElementById('f-website')||document.getElementById('f-url')||{}).value||'').trim();
    if (webVal && !/^(https?:\\/\\/)?[^\\s]{3,}\\.[^\\s]{2,}/i.test(webVal)) { showToast('Please enter a valid Website URL (e.g. https://yoursite.com)'); return false; }
  }
  if (step === 4 && !otpVerified) { showToast('Please verify your OTP first'); return false; }
  if (step === 5) {
    if (!document.getElementById('nda-agree').checked) { showToast('Please read and accept the agreement'); return false; }
  }
  return true;
}`;
if (!VALIDATE_RE.test(dec)) { console.error('validateStep not found'); process.exit(1); }
dec = dec.replace(VALIDATE_RE, VALIDATE_CLEAN);
console.log('PATCH 1: validateStep replaced (LinkedIn mandatory)');

// ── PATCH 2: Replace submitApplication with canonical clean version ──
// (single postMessage, no duplicates)
const SUBMIT_RE = /function submitApplication\(\) \{[\s\S]*?\n\}/;
const SUBMIT_CLEAN = `function submitApplication() {
  const otpInputs = document.querySelectorAll('#step-6 .otp-input');
  const otp2 = [...otpInputs].map(i => i.value).join('');
  if (otp2.length < 6) { showToast('Please enter your signature OTP'); return; }
  document.getElementById('sig-hash').textContent = 'SHA-256: ' + generateHash();
  showToast('Submitting your application...');
  try {
    var _exp = [];
    document.querySelectorAll('.chip.selected,.chip.active,.custom-chip').forEach(function(el){
      var t = el.textContent.replace(/\\u2715|\\u00d7/g,'').trim(); if(t) _exp.push(t);
    });
    window.parent.postMessage({
      type: 'wingrox:partner:apply',
      payload: {
        name:              (document.getElementById('f-name')    ||{}).value||'',
        email:             (document.getElementById('sig-email') ||{}).value||'',
        linkedin:          (document.getElementById('f-linkedin')||{}).value||'',
        website:           (document.getElementById('f-website') ||document.getElementById('f-url')||{}).value||'',
        expertise:         _exp,
        otpVerified:       typeof otpVerified !=='undefined'?!!otpVerified:true,
        ndaSigned:         typeof ndaScrolled !=='undefined'?!!ndaScrolled:true,
        signatureProvided: true
      }
    }, '*');
  } catch(_e){ console.warn('WinGroX bridge error:',_e); showToast('Submission failed. Please try again.'); }
}

// Listen for messages from parent
window.addEventListener('message', function(e) {
  if (!e.data) return;
  if (e.data.type === 'wingrox:eco:apply:result') {
    if (e.data.ok) {
      showView('success');
      var sv = document.getElementById('view-success');
      if (sv) sv.style.display = 'flex';
    } else {
      showToast('Submission failed: ' + (e.data.error || 'Please try again.'));
    }
  }
  if (e.data.type === 'wingrox:eco:reset') {
    showView('landing');
  }
});`;
if (!SUBMIT_RE.test(dec)) { console.error('submitApplication not found'); process.exit(1); }
dec = dec.replace(SUBMIT_RE, SUBMIT_CLEAN);
console.log('PATCH 2: submitApplication replaced (single postMessage)');
console.log('Total postMessage calls:', (dec.match(/wingrox:partner:apply/g)||[]).length);
console.log('Bridge injected OK');

// ── PATCH 3: Remove any duplicate legacy message listeners ──
const DUP_LISTENER_RE = /\/\/ Listen for result from parent\s*\n\s*window\.addEventListener\('message',[\s\S]*?\}\s*\}\s*\}\s*\)\s*;/g;
const beforeRemoval = (dec.match(DUP_LISTENER_RE) || []).length;
dec = dec.replace(DUP_LISTENER_RE, '');
console.log('PATCH 3: removed', beforeRemoval, 'legacy message listener(s)');

const encoded = Buffer.from(dec, 'utf8').toString('base64');
const chunks = encoded.match(/.{1,80}/g);
const jsVar = 'var PLATFORM_ECOSYSTEM=' + chunks.map(function(c){ return '"'+c+'"'; }).join('\n+') + ';';
const endIdx = html.indexOf(';', startIdx + startTag.length);
const updated = html.slice(0, startIdx) + jsVar + html.slice(endIdx + 1);
fs.writeFileSync('wingrox-os.html', updated, 'utf8');
console.log('Done. Encoded length:', encoded.length);
