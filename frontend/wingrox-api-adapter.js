/* ═══════════════════════════════════════════════════════════════════════
   WINGROX BACKEND ADAPTER
   
   Drop this file into your wingrox-os.html as the LAST script tag:
     <script src="wingrox-api-adapter.js"></script>
   
   It overrides four behaviours of the existing Digital Twin engine:
     1. Saves diagnostic state to backend (instead of just memory)
     2. Hydrates state from backend on page load (resumes sessions)
     3. Sends advisor leads via API (instead of mailto:)
     4. Uploads files via multipart (instead of just tracking filenames)
   
   The original DT_STATE remains as an optimistic in-memory cache —
   the UI stays snappy, and the backend syncs in the background.
══════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';
  
  // ── Configuration ────────────────────────────────────────
  const API_BASE = window.WINGROX_API_BASE || 'http://localhost:4000/api';
  const TOKEN_KEY = 'wingrox_token';
  const SESSION_KEY = 'wingrox_session_id';
  
  // ── Token storage ────────────────────────────────────────
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setToken(t) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }
  function getSessionId() {
    return localStorage.getItem(SESSION_KEY);
  }
  function setSessionId(id) {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  }
  
  // ── HTTP helper ──────────────────────────────────────────
  async function api(path, options = {}) {
    const token = getToken();
    const headers = { 
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    // Don't override Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
    
    const res = await fetch(API_BASE + path, { ...options, headers });
    
    if (res.status === 401) {
      setToken(null);
      throw new Error('Session expired — please sign in again');
    }
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed: ${res.status}`);
    }
    return data;
  }
  
  // ── Auth API ─────────────────────────────────────────────
  window.wingroxAuth = {
    async signup(email, password, name) {
      const data = await api('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      setToken(data.token);
      return data.user;
    },
    async login(email, password) {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      return data.user;
    },
    async me() {
      if (!getToken()) return null;
      try {
        const { user } = await api('/auth/me');
        return user;
      } catch {
        return null;
      }
    },
    logout() {
      setToken(null);
      setSessionId(null);
    },
    isLoggedIn: () => !!getToken(),
    async upgradeTier(tier) {
      const data = await api('/auth/upgrade', {
        method: 'PATCH',
        body: JSON.stringify({ tier: tier.toUpperCase() }),
      });
      return data.user;
    },
  };
  
  // ── Session sync ─────────────────────────────────────────
  // Debounced save — coalesces rapid answer clicks into one API call
  let saveTimer = null;
  let saveQueue = { profile: null, answers: null };
  
  function queueSave(updates) {
    if (updates.profile) saveQueue.profile = { ...(saveQueue.profile || {}), ...updates.profile };
    if (updates.answers) saveQueue.answers = { ...(saveQueue.answers || {}), ...updates.answers };
    
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 800); // save after 800ms of inactivity
  }
  
  async function flushSave() {
    const sessionId = getSessionId();
    if (!sessionId || (!saveQueue.profile && !saveQueue.answers)) return;
    
    const payload = saveQueue;
    saveQueue = { profile: null, answers: null };
    
    try {
      await api(`/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Save failed (will retry on next change):', err.message);
      // Re-queue on failure
      saveQueue.profile = { ...(saveQueue.profile || {}), ...(payload.profile || {}) };
      saveQueue.answers = { ...(saveQueue.answers || {}), ...(payload.answers || {}) };
    }
  }
  
  window.wingroxSession = {
    async create(tier, profile) {
      const data = await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({ tier: tier.toUpperCase(), profile }),
      });
      setSessionId(data.session.id);
      return data.session;
    },
    async load(id) {
      const data = await api(`/sessions/${id}`);
      return data.session;
    },
    async listMine() {
      const data = await api('/sessions');
      return data.sessions;
    },
    async complete(results) {
      const sessionId = getSessionId();
      if (!sessionId) throw new Error('No active session');
      // Flush any pending changes first
      clearTimeout(saveTimer);
      await flushSave();
      const data = await api(`/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ results }),
      });
      return data.session;
    },
    queueSave,
    flushSave,
  };
  
  // ── File upload ──────────────────────────────────────────
  window.wingroxFiles = {
    async upload(files) {
      const sessionId = getSessionId();
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      if (sessionId) fd.append('sessionId', sessionId);
      const data = await api('/files', { method: 'POST', body: fd });
      return data.files;
    },
    async list() {
      const data = await api('/files' + (getSessionId() ? `?sessionId=${getSessionId()}` : ''));
      return data.files;
    },
    async delete(id) {
      return api(`/files/${id}`, { method: 'DELETE' });
    },
  };
  
  // ── Lead capture ─────────────────────────────────────────
  window.wingroxLeads = {
    async submit(context, extra = {}) {
      // Pull data from current DT_STATE if available
      const state = window.DT_STATE || {};
      const profile = state.profile || {};
      const results = state.results || {};
      
      const payload = {
        context,
        email: extra.email || profile.email || '',
        name: extra.name || profile.name,
        mobile: extra.mobile || profile.mobile,
        message: extra.message,
        sessionId: getSessionId() || undefined,
        masterScore: results.masterScore,
        tier: state.tier?.toUpperCase(),
      };
      
      if (!payload.email) {
        throw new Error('Email is required to contact an advisor');
      }
      
      return api('/leads', { method: 'POST', body: JSON.stringify(payload) });
    },
  };
  
  // ── Payment modal (dummy, test mode) ────────────────────
  const TIER_INFO = {
    vanguard: {
      label: '◈ VANGUARD',
      price: 199,
      features: [
        '100 full diagnostic questions',
        'Sector intelligence engine',
        'Personalised expansion map',
        'Progress saved to your account',
      ],
    },
    apex: {
      label: '◆ APEX',
      price: 499,
      features: [
        'Everything in Vanguard, plus:',
        'Boardroom-grade report',
        'Pitch coaching session',
        'Written action brief in 7 days',
      ],
    },
  };

  let _paymentCallback = null;

  function dtShowPaymentModal(tier, callback) {
    _paymentCallback = callback;
    const info = TIER_INFO[tier];
    if (!info) { callback(); return; }

    if (!document.getElementById('dt-payment-styles')) {
      const s = document.createElement('style');
      s.id = 'dt-payment-styles';
      s.textContent = [
        '#dt-payment-overlay{position:fixed;inset:0;background:rgba(10,10,14,.78);backdrop-filter:blur(4px);z-index:9000;display:flex;align-items:center;justify-content:center}',
        '#dt-payment-modal{background:#12121e;border:1px solid rgba(212,175,55,.25);border-radius:16px;padding:36px 40px;width:420px;max-width:90vw;font-family:var(--f-sans,sans-serif);color:#F0EAD6;box-shadow:0 24px 64px rgba(0,0,0,.6)}',
        '.dt-pm-badge{background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.3);color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:.08em;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:16px}',
        '.dt-pm-price{font-size:44px;font-weight:800;color:#fff;margin:0 0 4px}',
        '.dt-pm-price sup{font-size:20px;vertical-align:top;margin-top:10px;display:inline-block}',
        '.dt-pm-features{list-style:none;padding:0;margin:14px 0 20px}',
        '.dt-pm-features li{padding:5px 0;font-size:14px;color:#c8bfa0}',
        '.dt-pm-features li::before{content:"✓ ";color:#D4AF37}',
        '.dt-pm-test{background:#0d2035;border:1px solid #1e4a70;border-radius:8px;padding:10px 14px;font-size:12px;color:#7eb8f7;margin-bottom:20px}',
        '.dt-pm-field{margin-bottom:14px}',
        '.dt-pm-field label{display:block;font-size:11px;font-weight:600;letter-spacing:.06em;color:#8a8070;margin-bottom:6px;text-transform:uppercase}',
        '.dt-pm-field input{width:100%;box-sizing:border-box;background:#0a0a14;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 14px;color:#fff;font-size:15px;outline:none;font-family:monospace}',
        '.dt-pm-field input:focus{border-color:rgba(212,175,55,.5)}',
        '.dt-pm-row{display:flex;gap:12px}',
        '.dt-pm-row .dt-pm-field{flex:1}',
        '.dt-pm-btn{width:100%;padding:14px;background:linear-gradient(135deg,#D4AF37,#A67C00);color:#0a0a0e;font-weight:800;font-size:15px;border:none;border-radius:10px;cursor:pointer;margin-top:8px;transition:.15s}',
        '.dt-pm-btn:hover:not(:disabled){opacity:.88}',
        '.dt-pm-btn:disabled{opacity:.5;cursor:not-allowed}',
        '.dt-pm-cancel{display:block;text-align:center;margin-top:14px;font-size:13px;color:#6b6456;cursor:pointer;text-decoration:underline}',
        '.dt-pm-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:dt-spin .6s linear infinite;margin-right:8px;vertical-align:middle}',
        '@keyframes dt-spin{to{transform:rotate(360deg)}}',
        '.dt-pm-success{text-align:center;padding:24px 0}',
        '.dt-pm-success .dt-pm-check{font-size:52px;margin-bottom:14px}',
        '.dt-pm-success h3{color:#D4AF37;margin:0 0 8px;font-size:20px}',
        '.dt-pm-success p{color:#c8bfa0;font-size:14px;margin:0}',
      ].join('');
      document.head.appendChild(s);
    }

    const existing = document.getElementById('dt-payment-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dt-payment-overlay';
    overlay.innerHTML = `
      <div id="dt-payment-modal">
        <div class="dt-pm-badge">${info.label}</div>
        <p class="dt-pm-price"><sup>$</sup>${info.price}<span style="font-size:16px;font-weight:400;color:#8a8070"> / one-time</span></p>
        <ul class="dt-pm-features">${info.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <div class="dt-pm-test">🧪 <strong>TEST MODE</strong> — Use any card details. No real charge will be made.</div>
        <div class="dt-pm-field">
          <label>Card number</label>
          <input id="dt-pm-cardnum" type="text" value="4242 4242 4242 4242" maxlength="19" placeholder="1234 5678 9012 3456">
        </div>
        <div class="dt-pm-row">
          <div class="dt-pm-field"><label>Expiry</label><input id="dt-pm-expiry" type="text" value="12/28" maxlength="5" placeholder="MM/YY"></div>
          <div class="dt-pm-field"><label>CVV</label><input id="dt-pm-cvv" type="text" value="123" maxlength="4" placeholder="123"></div>
        </div>
        <button class="dt-pm-btn" id="dt-pm-pay-btn" onclick="window.dtProcessPayment('${tier}')">Pay $${info.price} →</button>
        <span class="dt-pm-cancel" onclick="window.dtClosePaymentModal()">Cancel — continue without upgrading</span>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  window.dtClosePaymentModal = function() {
    const el = document.getElementById('dt-payment-overlay');
    if (el) el.remove();
    _paymentCallback = null;
  };

  window.dtProcessPayment = async function(tier) {
    const btn = document.getElementById('dt-pm-pay-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="dt-pm-spinner"></span>Processing…'; }

    try {
      // Simulate payment gateway delay
      await new Promise(r => setTimeout(r, 1500));

      // Upgrade tier in DB
      await window.wingroxAuth.upgradeTier(tier);

      // Show success state inside the modal
      const modal = document.getElementById('dt-payment-modal');
      if (modal) {
        modal.innerHTML = `
          <div class="dt-pm-success">
            <div class="dt-pm-check">✓</div>
            <h3>Payment successful!</h3>
            <p>Your account has been upgraded to ${tier.toUpperCase()}.</p>
          </div>
        `;
      }

      await new Promise(r => setTimeout(r, 1100));
      window.dtClosePaymentModal();

      if (window.dtToast) window.dtToast(`✓ Upgraded to ${tier.toUpperCase()}! Starting diagnostic…`);

      const cb = _paymentCallback;
      _paymentCallback = null;
      if (cb) cb();
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Pay $${TIER_INFO[tier]?.price || ''} →`;
      }
      if (window.dtToast) window.dtToast('⚠ ' + err.message);
      console.warn('Payment/upgrade error:', err.message);
    }
  };

  // ── Override existing DT engine functions ────────────────
  // These wrap the originals so the UI stays identical but persistence flows through API
  
  function wireOverrides() {
    if (!window.dtAnswer1Q || !window.dtSaveProfile) {
      // Engine not loaded yet — retry
      setTimeout(wireOverrides, 200);
      return;
    }
    
    // 1. Wrap dtAnswer1Q to also persist
    const origAnswer = window.dtAnswer1Q;
    window.dtAnswer1Q = function(qId, optIdx) {
      origAnswer(qId, optIdx);
      if (getSessionId() && getToken()) {
        queueSave({ answers: { [qId]: optIdx } });
      }
    };
    
    // 2. Wrap dtSaveProfile to also persist
    const origSaveProfile = window.dtSaveProfile;
    window.dtSaveProfile = function() {
      origSaveProfile();
      if (getSessionId() && getToken() && window.DT_STATE?.profile) {
        // Strip out 'files' (those go via separate upload API)
        const { files, ...profileToSave } = window.DT_STATE.profile;
        queueSave({ profile: profileToSave });
      }
    };
    
    // 3. Wrap dtBeginDiagnostic to create a backend session first (only if none exists)
    const origBegin = window.dtBeginDiagnostic;
    window.dtBeginDiagnostic = async function() {
      // Run original validation/state setup
      origBegin();

      // Create backend session only if logged in and no active session already
      if (getToken() && window.DT_STATE?.tier && !getSessionId()) {
        try {
          const { files, ...profileToSave } = window.DT_STATE.profile || {};
          // Fetch account tier — backend enforces eligibility, only store if tier matches
          const user = await window.wingroxAuth.me();
          const tierRank = { nucleus: 0, vanguard: 1, apex: 2 };
          const selectedTier = window.DT_STATE.tier.toLowerCase();
          const accountTier = (user?.tier || 'NUCLEUS').toLowerCase();
          if (tierRank[selectedTier] > tierRank[accountTier]) {
            console.info(`Session not stored — selected tier (${selectedTier}) exceeds account tier (${accountTier}). Upgrade required.`);
            return;
          }
          await window.wingroxSession.create(selectedTier, profileToSave);
        } catch (err) {
          console.warn('Could not create backend session:', err.message);
        }
      }
    };
    
    // 4. Wrap dtFinishDiagnostic to mark session complete with user feedback
    const origFinish = window.dtFinishDiagnostic;

    async function attemptSave() {
      const banner = document.getElementById('dt-save-banner');
      if (banner) { banner.className = 'dt-save-banner dt-save-saving'; banner.innerHTML = '⏳ Saving diagnostic to your account…'; }
      try {
        await window.wingroxSession.complete(window.DT_STATE.results);
        if (banner) { banner.className = 'dt-save-banner dt-save-ok'; banner.innerHTML = '✓ Diagnostic saved to your account.'; setTimeout(() => { if (banner) banner.style.display = 'none'; }, 4000); }
        if (window.dtToast) window.dtToast('✓ Diagnostic saved to your account.');
      } catch (err) {
        console.warn('Could not save session:', err.message);
        if (banner) {
          banner.className = 'dt-save-banner dt-save-err';
          banner.textContent = `⚠ Save failed: ${err.message}. Please check your connection and try again later.`;
        }
        if (window.dtToast) window.dtToast('⚠ Save failed — check your connection.');
      }
    }
    window.attemptSave = attemptSave;

    window.dtFinishDiagnostic = async function() {
      origFinish(); // navigates to report and sets DT_STATE.results synchronously via dtRenderReport

      if (!getSessionId() || !getToken()) return; // not logged in — silent

      // Inject a save-status banner at the top of the report content
      await new Promise(r => setTimeout(r, 120)); // wait for dtRenderReport to finish painting
      const reportContent = document.getElementById('dt-report-content');
      if (reportContent && !document.getElementById('dt-save-banner')) {
        if (!document.getElementById('dt-save-banner-styles')) {
          const s = document.createElement('style');
          s.id = 'dt-save-banner-styles';
          s.textContent = [
            '.dt-save-banner{padding:12px 20px;border-radius:var(--r-sm);font-family:var(--f-mono);font-size:12px;font-weight:600;letter-spacing:0.04em;margin-bottom:20px;transition:all .3s}',
            '.dt-save-saving{background:#FFF9EC;color:#8A6A1A;border:1px solid #E8C96A}',
            '.dt-save-ok{background:#EFF9F0;color:#2E7D32;border:1px solid #81C784}',
            '.dt-save-err{background:#FEF0F0;color:#C0392B;border:1px solid #EF9A9A;display:flex;align-items:center}',
          ].join('');
          document.head.appendChild(s);
        }
        const banner = document.createElement('div');
        banner.id = 'dt-save-banner';
        banner.className = 'dt-save-banner dt-save-saving';
        banner.textContent = '⏳ Saving diagnostic to your account…';
        reportContent.insertBefore(banner, reportContent.firstChild);
      }

      if (window.DT_STATE?.results) {
        await attemptSave();
      }
    };
    
    // 5. Wrap dtAdvisorEmail and dtBookCall — replace mailto with API
    const origAdvisor = window.dtAdvisorEmail;
    window.dtAdvisorEmail = function(context) {
      // If user is logged in & has email, submit via API
      if (getToken() && window.DT_STATE?.profile?.email) {
        window.wingroxLeads.submit(context).then(() => {
          if (window.dtToast) window.dtToast('Advisor notified — they will reach out shortly.');
        }).catch(err => {
          console.warn('Lead submit failed, falling back to mailto:', err.message);
          origAdvisor(context); // fallback to original mailto
        });
      } else {
        // Not logged in — use original mailto
        origAdvisor(context);
      }
    };
    
    // 6. Wrap dtFilesUploaded for real upload
    const origFilesUploaded = window.dtFilesUploaded;
    window.dtFilesUploaded = function(e) {
      // Run original (updates UI immediately)
      origFilesUploaded(e);
      // Upload to backend if logged in
      if (getToken() && e.target.files.length > 0) {
        window.wingroxFiles.upload(Array.from(e.target.files)).then(uploaded => {
          if (window.dtToast) window.dtToast(`${uploaded.length} file(s) uploaded`);
        }).catch(err => {
          if (window.dtToast) window.dtToast('Upload failed: ' + err.message);
        });
      }
    };
    
    // 7. Wrap dtSelectTier — show payment modal if selected tier exceeds account tier
    const origSelectTier = window.dtSelectTier;
    window.dtSelectTier = async function(tier) {
      // Apex keeps its special mailto flow — skip payment intercept
      if (tier === 'apex') { origSelectTier(tier); return; }

      const tierRank = { nucleus: 0, vanguard: 1, apex: 2 };

      // Nucleus is free — no payment needed
      if (!tierRank[tier]) { origSelectTier(tier); return; }

      if (getToken()) {
        const user = await window.wingroxAuth.me();
        const accountTier = (user?.tier || 'NUCLEUS').toLowerCase();
        if (tierRank[tier] > tierRank[accountTier]) {
          // User needs to upgrade — show payment modal
          dtShowPaymentModal(tier, () => origSelectTier(tier));
          return;
        }
      }

      // Not logged in, or already has this tier — proceed normally
      origSelectTier(tier);
    };

    console.log('✓ WinGroX backend adapter wired');
  }
  
  // Try to hydrate on load
  async function hydrate() {
    if (!getToken()) return;
    
    const user = await window.wingroxAuth.me();
    if (!user) return;
    
    // Resume the most recent in-progress session if any
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        const session = await window.wingroxSession.load(sessionId);
        if (session.status === 'IN_PROGRESS' && window.DT_STATE) {
          // Use the higher of session tier vs account tier (handles upgrades)
          const tierRank = { nucleus: 0, vanguard: 1, apex: 2 };
          const sessionTier = session.tier.toLowerCase();
          const accountTier = (user.tier || 'NUCLEUS').toLowerCase();
          const effectiveTier = tierRank[accountTier] >= tierRank[sessionTier] ? accountTier : sessionTier;
          window.DT_STATE.tier = effectiveTier;
          window.DT_STATE.profile = { ...window.DT_STATE.profile, ...(session.profile || {}) };
          window.DT_STATE.answers = session.answers || {};
          console.log(`✓ Resumed session ${session.id} (tier: ${effectiveTier}, ${Object.keys(session.answers || {}).length} answers)`);
        }
      } catch (err) {
        console.warn('Could not resume session:', err.message);
        setSessionId(null);
      }
    }
  }
  
  // Wire up after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      wireOverrides();
      hydrate();
    });
  } else {
    wireOverrides();
    hydrate();
  }
})();
