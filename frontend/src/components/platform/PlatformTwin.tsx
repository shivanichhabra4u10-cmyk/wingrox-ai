'use client';

import { useEffect, useRef } from 'react';
// Load the verbatim CSS extracted from the original twin design
// (frontend/public/platforms/twin.html → split by scripts/extract-twin.ps1)
import '@/styles/twin.css';
import { PlatformNav } from './PlatformNav';

type PlatformTwinProps = {
  /** Verbatim inner HTML of the original `<body>` (provided by the server component). */
  bodyHtml: string;
};

const CHARTJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
const BRIDGE_SRC = '/platforms/wg-bridge.js';
const APP_SRC = '/platforms/twin.app.js';
const PERSIST_SRC = '/platforms/twin.persist.js';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-twin-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false; // preserve order: Chart.js must load before the app script
    s.dataset.twinSrc = src;
    s.addEventListener('load', () => {
      s.dataset.loaded = '1';
      resolve();
    });
    s.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(s);
  });
}

/**
 * PlatformTwin
 *
 * Hosts the original Digital Twin Engine UI inside a normal React tree
 * (no iframe). The body HTML is server-rendered for a fast first paint;
 * the original CSS is bundled by Next.js; the original JS is loaded
 * dynamically on the client after Chart.js.
 *
 * Backend integration: any future API calls inside `twin.app.js` should
 * use relative `/api/...` paths — Next.js rewrites them to the NestJS
 * backend (see frontend/next.config.js).
 */
export function PlatformTwin({ bodyHtml }: PlatformTwinProps) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    // Note: no `cancelled` flag here — under React StrictMode the effect
    // runs twice (mount → cleanup → mount). The script loader is already
    // idempotent (it checks for an existing tag via data-twin-src), so we
    // simply let the chain run to completion. Errors are surfaced via
    // console.error for dev visibility.
    (async () => {
      try {
        // Order matters: Chart.js + WG bridge must be defined globally
        // before twin.app.js executes (it references both).
        await Promise.all([loadScript(CHARTJS_SRC), loadScript(BRIDGE_SRC)]);
        await loadScript(APP_SRC);
        // Persistence layer wraps legacy globals — must come last.
        await loadScript(PERSIST_SRC);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[PlatformTwin] script load failed:', err);
      }
    })();
  }, []);

  return (
    <>
      <PlatformNav active="twin" />
      <div
        className="twin-root"
        // The HTML comes from a trusted, build-time file checked into the repo
        // (extracted from frontend/public/platforms/twin.html). It is not user
        // input, so dangerouslySetInnerHTML is safe here.
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </>
  );
}
