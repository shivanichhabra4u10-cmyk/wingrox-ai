/* ─────────────────────────────────────────────────────────────
 * twin.persist.js — backend persistence for the legacy Twin app.
 *
 * Loaded AFTER twin.app.js. Wraps existing global functions and
 * pushes state to the NestJS backend via window.WG (wg-bridge.js).
 *
 * The legacy script declares `const APP = {…}` at top-level which
 * is NOT attached to window. We therefore mirror state into our
 * own `state` object by reading the DOM at call sites — we never
 * dereference `window.APP`.
 *
 * Endpoints (see backend/src/modules/twin-assessment/*):
 *   POST /twin-assessment/otp/send     { email, packageKey }
 *   POST /twin-assessment/otp/verify   { email, code } → { sessionToken, assessmentId }
 *   POST /twin-assessment/progress     { sessionToken, packageKey, company, canvas, answers, aiAnswers, metadata }
 *   POST /twin-assessment/complete     { …progress, report }
 *
 * Failures are logged but never block the legacy UI.
 * ────────────────────────────────────────────────────────── */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__twinPersistInstalled) return;
  if (!window.WG || typeof window.sendOTP !== 'function') {
    // Wait for twin.app.js to attach its globals.
    return setTimeout(arguments.callee, 50);
  }
  window.__twinPersistInstalled = true;

  var WG = window.WG;

  var state = {
    email: null,
    packageKey: 'nucleus',
    sessionToken: null,
    assessmentId: null,
    company: {},
    canvas: { strategic: [], pain: [], obstacle: [], opportunity: [], focus: [] },
    answers: {},
    aiAnswers: {},
    report: null,
  };
  window.__twinState = state; // exposed for debugging

  function val(id) {
    var el = document.getElementById(id);
    return el && typeof el.value === 'string' ? el.value.trim() : '';
  }

  function readCanvasFromDom() {
    ['strategic', 'pain', 'obstacle', 'opportunity', 'focus'].forEach(function (k) {
      var host = document.getElementById('tc-' + k);
      if (!host) return;
      state.canvas[k] = Array.from(host.querySelectorAll('.tf-chip'))
        .map(function (n) { return (n.textContent || '').replace(/\u00d7\s*$/, '').trim(); })
        .filter(Boolean);
    });
  }

  function readCompanyFromDom() {
    state.company = {
      name: val('f-name'),
      industry: val('f-industry'),
      email: val('f-email') || state.email,
      mobile: val('f-mobile'),
      linkedin: val('f-linkedin'),
    };
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, ctx = this;
      if (t) clearTimeout(t);
      t = setTimeout(function () { t = null; fn.apply(ctx, args); }, ms);
    };
  }

  function progressPayload(extra) {
    var p = {
      sessionToken: state.sessionToken || '',
      packageKey: state.packageKey || 'nucleus',
      company: state.company,
      canvas: state.canvas,
      answers: state.answers,
      aiAnswers: state.aiAnswers,
      metadata: { assessmentId: state.assessmentId, ts: Date.now() },
    };
    if (extra) for (var k in extra) p[k] = extra[k];
    return p;
  }

  function saveProgress() {
    if (!state.sessionToken) {
      if (!state.__warnedNoToken) {
        state.__warnedNoToken = true;
        console.warn('[twin.persist] skipping /progress — no sessionToken yet (OTP not verified against backend).');
      }
      return;
    }
    return WG.post('/twin-assessment/progress', progressPayload())
      .then(function () { console.debug('[twin.persist] progress saved'); })
      .catch(function (err) {
        console.warn('[twin.persist] progress failed:', err && err.status, err && err.data);
      });
  }
  var saveProgressDebounced = debounce(saveProgress, 800);

  /* Capture answer state from the legacy DOM. The original script
   * uses input[name="opt-..."] for radio answers and stores them
   * in its own closure; we mirror by snapshotting checked inputs. */
  function snapshotAnswers() {
    var out = {};
    document.querySelectorAll('input[name^="opt-"]:checked').forEach(function (i) {
      out[i.name] = i.value;
    });
    state.answers = out;
    var ai = {};
    document.querySelectorAll('input[name^="ai-opt-"]:checked, textarea[name^="ai-text-"]').forEach(function (i) {
      if (i.value) ai[i.name] = i.value;
    });
    state.aiAnswers = ai;
  }

  /* ── 1. Package selection ───────────────────────────────── */
  var origSelectPackage = window.selectPackage;
  if (typeof origSelectPackage === 'function') {
    window.selectPackage = function (key) {
      if (key) state.packageKey = key;
      return origSelectPackage.apply(this, arguments);
    };
  }
  var origOpenAuth = window.openAuth;
  if (typeof origOpenAuth === 'function') {
    window.openAuth = function (pkgKey) {
      if (pkgKey) state.packageKey = pkgKey;
      return origOpenAuth.apply(this, arguments);
    };
  }

  /* ── 2. OTP send ────────────────────────────────────────── */
  var origSendOTP = window.sendOTP;
  window.sendOTP = function () {
    var email = val('auth-email');
    var r = origSendOTP.apply(this, arguments);
    if (email && /@/.test(email)) {
      state.email = email;
      WG.post('/twin-assessment/otp/send', {
        email: email,
        packageKey: state.packageKey || 'nucleus',
      })
        .then(function (resp) {
          var d = (resp && (resp.data || resp)) || {};
          if (d.assessmentId) state.assessmentId = d.assessmentId;
          if (d.demoOtp) {
            console.info('[twin.persist] demo OTP:', d.demoOtp);
            // Autofill the OTP input so the legacy UI and the backend
            // agree on the same code (dev convenience only).
            var otpEl = document.getElementById('auth-otp');
            if (otpEl && !otpEl.value) {
              otpEl.value = d.demoOtp;
              otpEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        })
        .catch(function (err) {
          console.warn('[twin.persist] OTP send failed:', err && err.status, err && err.data);
        });
    }
    return r;
  };

  /* ── 3. OTP verify → capture sessionToken ──────────────── */
  var origVerifyOTP = window.verifyOTP;
  window.verifyOTP = function () {
    var otp = (val('auth-otp') || '').replace(/\s/g, '');
    var email = state.email || val('auth-email');
    var r = origVerifyOTP.apply(this, arguments);
    if (email && /^\d{6}$/.test(otp)) {
      WG.post('/twin-assessment/otp/verify', { email: email, code: otp })
        .then(function (resp) {
          var d = (resp && (resp.data || resp)) || {};
          if (d.sessionToken) state.sessionToken = d.sessionToken;
          if (d.assessmentId) state.assessmentId = d.assessmentId;
          if (d.packageKey) state.packageKey = d.packageKey;
          console.info('[twin.persist] verified, session active');
        })
        .catch(function (err) {
          console.warn('[twin.persist] OTP verify failed:', err && err.status, err && err.data);
        });
    }
    return r;
  };

  /* ── 4. Company form ───────────────────────────────────── */
  var origValidateCompany = window.validateCompany;
  window.validateCompany = function () {
    var r = origValidateCompany.apply(this, arguments);
    readCompanyFromDom();
    readCanvasFromDom();
    if (state.company.email) saveProgressDebounced();
    return r;
  };

  /* ── 5. Answer / canvas changes ────────────────────────── */
  ['selectOpt', 'selectAIOpt', 'selectScale', 'addTag', 'removeTag', 'submitAI', 'nextQ', 'prevQ'].forEach(function (name) {
    var orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      var r = orig.apply(this, arguments);
      try { snapshotAnswers(); readCanvasFromDom(); } catch (_) {}
      saveProgressDebounced();
      return r;
    };
  });

  /* ── 6. Final report → complete ────────────────────────── */
  var origBuildReport = window.buildReport;
  window.buildReport = function () {
    var r = origBuildReport.apply(this, arguments);
    if (!state.sessionToken) return r;
    snapshotAnswers();
    readCanvasFromDom();
    var payload = progressPayload({ report: { generatedAt: new Date().toISOString() } });
    WG.post('/twin-assessment/complete', payload).catch(function (err) {
      console.warn('[twin.persist] complete failed:', err && err.status, err && err.data);
    });
    return r;
  };

  console.info('[twin.persist] installed');
})();
