'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

const PlatformViewNameSchema = z.enum(['dashboard', 'intel', 'match', 'hub', 'sim']);

const PlatformHtmlViewFramePropsSchema = z.object({
  active: PlatformViewNameSchema,
  title: z.string().min(1),
  loadingText: z.string().min(1),
  viewName: PlatformViewNameSchema,
});

type PlatformViewName = z.infer<typeof PlatformViewNameSchema>;
type PlatformHtmlViewFrameProps = z.infer<typeof PlatformHtmlViewFramePropsSchema>;

let htmlSourcePromise: Promise<string> | null = null;

function getHtmlSource() {
  if (!htmlSourcePromise) {
    htmlSourcePromise = fetch('/wingrox-os.html').then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load HTML reference (${response.status})`);
      }

      return response.text();
    });
  }

  return htmlSourcePromise;
}

function buildEmbeddedHtml(html: string, viewName: PlatformViewName) {
  const styleOverride = `
<style id="wingrox-embed-override">
  body > nav,
  nav,
  #chat-fab,
  #chat-window,
  #intel-modal,
  #sim-paywall-modal {
    display: none !important;
  }

  body {
    padding-top: 0 !important;
    overflow: auto !important;
  }

  .view {
    display: none !important;
    padding-top: 0 !important;
  }

  #view-${viewName} {
    display: block !important;
  }

  .view-iframe {
    padding-top: 0 !important;
    height: 100vh !important;
    overflow: hidden !important;
  }

  .view-iframe .platform-frame {
    height: 100vh !important;
  }
</style>`;

  const bootScript = `
<script>
  window.addEventListener('load', () => {
    const ensureView = () => {
      if (typeof window.showView === 'function') {
        window.showView('${viewName}');
        return;
      }

      window.setTimeout(ensureView, 50);
    };

    ensureView();
  });
</script>`;

  return html.replace('</head>', `${styleOverride}</head>`).replace('</body>', `${bootScript}</body>`);
}

export function PlatformHtmlViewFrame({ active, title, loadingText, viewName }: PlatformHtmlViewFrameProps) {
  PlatformHtmlViewFramePropsSchema.parse({ active, title, loadingText, viewName });

  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let disposed = false;

    setLoaded(false);
    setError(null);

    getHtmlSource()
      .then((html) => {
        if (!disposed) {
          setSrcDoc(buildEmbeddedHtml(html, viewName));
        }
      })
      .catch((cause: unknown) => {
        if (!disposed) {
          setError(cause instanceof Error ? cause.message : 'Unknown loading error');
        }
      });

    return () => {
      disposed = true;
    };
  }, [viewName]);

  return (
    <main className={styles.page}>
      <PlatformNav active={active} />

      <section className={styles.moduleFrameWrap}>
        {!loaded && (
          <div className={styles.frameLoader}>
            <div className={styles.frameSpinner} />
            <div className={styles.frameLoaderText}>{error ?? loadingText}</div>
          </div>
        )}

        {srcDoc ? (
          <iframe
            className={styles.frame}
            loading="eager"
            srcDoc={srcDoc}
            title={title}
            onLoad={() => setLoaded(true)}
          />
        ) : null}
      </section>
    </main>
  );
}