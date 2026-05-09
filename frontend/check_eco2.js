const fs = require('fs');
const d = fs.readFileSync('_eco_decoded.html', 'utf8');
const keywords = ['#view-success', '#step-success', '.page-success', 'id="success"', 'display:none', 'display:block', 'current-view', 'active-view'];
keywords.forEach(kw => {
  const idx = d.indexOf(kw);
  if (idx > -1) {
    const ctx = d.slice(Math.max(0, idx-80), idx+120).replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
    console.log(JSON.stringify(kw), '@', idx, ':', ctx);
  } else {
    console.log(JSON.stringify(kw), ': NOT FOUND');
  }
});
