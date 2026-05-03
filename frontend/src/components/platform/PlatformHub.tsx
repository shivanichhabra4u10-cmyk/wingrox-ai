'use client';

import { useState, useEffect } from 'react';
import { PlatformNav } from './PlatformNav';

interface HubArticle {
  slug: string;
  type: string; typeLabel: string; typeColor: string; typeBg: string; typeBorder: string;
  topic: string; topicLabel: string; topicColor: string; topicBg: string; topicBorder: string;
  title: string; description: string; readTimeMin: number; ageLabel: string;
  whatThisMeansForYou: string; saved: boolean;
}

const TOPICS = [
  { key: 'GTM',           label: 'Go-to-Market',    count: 24 },
  { key: 'EXPANSION',     label: 'Global Expansion', count: 18 },
  { key: 'FUNDRAISING',   label: 'Fundraising',      count: 12 },
  { key: 'UNIT_ECONOMICS',label: 'Unit Economics',   count: 9  },
  { key: 'LEADERSHIP',    label: 'Leadership & Org', count: 7  },
  { key: 'REGULATION',    label: 'Regulation',       count: 6  },
];

const CONTENT_TYPES = ['Playbooks', 'Market Intel', 'Benchmarks', 'Case Studies'];
const SOURCES       = ['WinGroX Research', 'Partner Contributions', 'External Syndicated'];
const SORT_OPTIONS  = ['Most relevant to you', 'Newest first', 'Most saved'];

function hubSessionId(): string {
  let sid = localStorage.getItem('wg_hub_session');
  if (!sid) { sid = 'hs_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('wg_hub_session', sid); }
  return sid;
}

export function PlatformHub() {
  const [articles,  setArticles]  = useState<HubArticle[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [sort,      setSort]      = useState(SORT_OPTIONS[0]);
  const [topics,    setTopics]    = useState<Set<string>>(new Set(['GTM', 'EXPANSION']));
  const [types,     setTypes]     = useState<Set<string>>(new Set(['Playbooks', 'Market Intel']));
  const [sources,   setSources]   = useState<Set<string>>(new Set(['WinGroX Research']));
  const [saving,    setSaving]    = useState<Set<string>>(new Set());

  useEffect(() => {
    const aid = localStorage.getItem('wg_assessment_id');
    const sid = hubSessionId();
    const url = '/api/hub/feed?sessionId=' + sid + (aid ? '&assessmentId=' + aid : '');
    fetch(url)
      .then(r => r.json())
      .then(res => { if (res.data?.articles) setArticles(res.data.articles); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSet = (s: Set<string>, key: string): Set<string> => {
    const next = new Set(s);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  };

  const toggleSave = async (slug: string) => {
    const sid = hubSessionId();
    setSaving(prev => new Set([...prev, slug]));
    try {
      const res = await fetch('/api/hub/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleSlug: slug, sessionId: sid }),
      }).then(r => r.json());
      if (res.success) {
        setArticles(prev => prev.map(a => a.slug === slug ? { ...a, saved: res.data.saved } : a));
      }
    } catch { /* silent */ } finally {
      setSaving(prev => { const s = new Set(prev); s.delete(slug); return s; });
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="hub" />

      <section className="module-hero">
        <div className="container">
          <div className="mh-eyebrow">Layer Ⅳ \xb7 Intelligence Hub™</div>
          <h1>Playbooks &amp; intel, with <em>&quot;what this means for you&quot;</em> built in.</h1>
          <p>Every piece of content is filtered through your Digital Twin. No generic news feed — only what matters for your sector, stage, and target markets.</p>
        </div>
      </section>

      <div className="mod-body">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>

            {/* Sidebar */}
            <div className="dash-card" style={{ padding: 22, height: 'fit-content', position: 'sticky', top: 88 }}>
              <div className="dc-label">Topics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
                {TOPICS.map(({ key, label, count }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={topics.has(key)} onChange={() => setTopics(prev => toggleSet(prev, key))} />
                    <span>{label}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-40)' }}>{count}</span>
                  </label>
                ))}
              </div>

              <div className="dc-label">Content Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
                {CONTENT_TYPES.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={types.has(t)} onChange={() => setTypes(prev => toggleSet(prev, t))} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>

              <div className="dc-label">Source</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SOURCES.map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={sources.has(s)} onChange={() => setSources(prev => toggleSet(prev, s))} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 22 }}>Your Personalised Feed</h3>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  style={{ padding: '8px 14px', border: '1px solid var(--ink-15)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', fontSize: 13 }}
                >
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="dash-card" style={{ marginBottom: 16, padding: 28, textAlign: 'center', color: 'var(--ink-50)' }}>
                  Loading your personalised feed…
                </div>
              ) : articles.length === 0 ? (
                <div className="dash-card" style={{ marginBottom: 16, padding: 28, textAlign: 'center', color: 'var(--ink-50)' }}>
                  No articles found.
                </div>
              ) : (
                articles.map(a => (
                  <div key={a.slug} className="dash-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="chip active" style={{ cursor: 'default', fontSize: 11, background: a.typeBg, color: a.typeColor, borderColor: a.typeBorder }}>{a.typeLabel}</span>
                      <span className="chip active" style={{ cursor: 'default', fontSize: 11, background: a.topicBg, color: a.topicColor, borderColor: a.topicBorder }}>{a.topicLabel}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-40)', marginLeft: 'auto' }}>{a.readTimeMin} min \xb7 {a.ageLabel}</span>
                    </div>

                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>{a.title}</h3>
                    <p style={{ fontSize: 13.5, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 16 }}>{a.description}</p>

                    <div style={{ background: 'var(--gold-mist)', borderLeft: '3px solid var(--gold)', padding: '14px 16px', borderRadius: '0 var(--r-sm) var(--r-sm) 0', marginBottom: 14 }}>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 6 }}>◈ What This Means For You</div>
                      <p style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.6, fontStyle: 'italic' }}>&quot;{a.whatThisMeansForYou}&quot;</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-primary btn-sm">{a.type === 'MARKET_INTEL' ? 'Read Intel' : 'Open Playbook'}</button>
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => toggleSave(a.slug)}
                        disabled={saving.has(a.slug)}
                      >
                        {saving.has(a.slug) ? '…' : a.saved ? 'Saved ✓' : 'Save'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
