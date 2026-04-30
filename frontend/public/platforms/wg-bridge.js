/* ─────────────────────────────────────────────────────────────
 * WG — WinGroX backend bridge for the legacy Twin app script.
 *
 * Loaded BEFORE twin.app.js by PlatformTwin.tsx. Exposes a tiny
 * fetch wrapper at `window.WG` so the legacy code can persist
 * state to the NestJS backend without any other rewiring.
 *
 * All paths are RELATIVE (`/api/...`). Next.js rewrites in
 * frontend/next.config.js proxy them to the NestJS server, so:
 *   - same origin (no CORS)
 *   - cookies / JWT flow automatically
 *   - works identically in dev and prod
 * ────────────────────────────────────────────────────────── */
(function () {
  if (typeof window === 'undefined' || window.WG) return;

  async function request(method, path, body) {
    const res = await fetch('/api' + path, {
      method: method,
      credentials: 'include',
      headers: body
        ? { 'Content-Type': 'application/json', Accept: 'application/json' }
        : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    var data = null;
    if (text) {
      try { data = JSON.parse(text); } catch (_) { data = text; }
    }
    if (!res.ok) {
      var err = new Error(
        'WG ' + method + ' ' + path + ' failed: ' + res.status,
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.WG = {
    get:    function (p)        { return request('GET',    p);       },
    post:   function (p, body)  { return request('POST',   p, body); },
    put:    function (p, body)  { return request('PUT',    p, body); },
    patch:  function (p, body)  { return request('PATCH',  p, body); },
    delete: function (p)        { return request('DELETE', p);       },
  };
})();
