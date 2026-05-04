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
    
    // 3. Wrap dtBeginDiagnostic to create a backend session first
    const origBegin = window.dtBeginDiagnostic;
    window.dtBeginDiagnostic = async function() {
      // Run original validation/state setup
      origBegin();
      
      // Create backend session if user is logged in
      if (getToken() && window.DT_STATE?.tier) {
        try {
          const { files, ...profileToSave } = window.DT_STATE.profile || {};
          await window.wingroxSession.create(window.DT_STATE.tier, profileToSave);
        } catch (err) {
          console.warn('Could not create backend session:', err.message);
          // UI still works — user just won't have persistence
        }
      }
    };
    
    // 4. Wrap dtFinishDiagnostic to mark session complete
    const origFinish = window.dtFinishDiagnostic;
    window.dtFinishDiagnostic = async function() {
      origFinish();
      // If we have a session and results, persist completion
      if (getSessionId() && getToken() && window.DT_STATE?.results) {
        try {
          await window.wingroxSession.complete(window.DT_STATE.results);
        } catch (err) {
          console.warn('Could not mark session complete:', err.message);
        }
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
          window.DT_STATE.tier = session.tier.toLowerCase();
          window.DT_STATE.profile = { ...window.DT_STATE.profile, ...(session.profile || {}) };
          window.DT_STATE.answers = session.answers || {};
          console.log(`✓ Resumed session ${session.id} (${Object.keys(session.answers || {}).length} answers)`);
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
