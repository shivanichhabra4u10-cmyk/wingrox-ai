'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { ReportsTrendsChart } from './ReportsTrendsChart';

type Range = '7d' | '30d' | '90d';

type ReportSummary = {
  range: Range;
  filters: {
    country?: string;
    industry?: string;
    stage?: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalPoints: number;
    hasMore: boolean;
  };
  totals: {
    pipelineEur: number;
    matches: number;
    avgConversionRate: number;
  };
  trend: Array<{ date: string; pipeline: number; matches: number; conversionRate: number }>;
};

type SegmentItem = {
  key: string;
  pipelineEur: number;
  matches: number;
  avgConversionRate: number;
};

type SegmentResponse = {
  byCountry: SegmentItem[];
  byIndustry: SegmentItem[];
  byStage: SegmentItem[];
};

export function ReportsWorkspace() {
  const [range, setRange] = useState<Range>('30d');
  const [realtime, setRealtime] = useState('connecting');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(30);

  const queryKey = useMemo(
    () => ['reports-summary', range, country, industry, stage, page, limit],
    [range, country, industry, stage, page, limit],
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ range });
      if (country) params.set('country', country);
      if (industry) params.set('industry', industry);
      if (stage) params.set('stage', stage);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await apiClient.get(`/reports/summary?${params.toString()}`);
      return res.data.data as ReportSummary;
    },
  });

  const { data: segments } = useQuery({
    queryKey: ['reports-segments', range, country, industry, stage],
    queryFn: async () => {
      const params = new URLSearchParams({ range });
      if (country) params.set('country', country);
      if (industry) params.set('industry', industry);
      if (stage) params.set('stage', stage);
      const res = await apiClient.get(`/reports/segments?${params.toString()}`);
      return res.data.data as SegmentResponse;
    },
  });

  useEffect(() => {
    setPage(1);
  }, [range, country, industry, stage]);

  useEffect(() => {
    let source: EventSource | null = null;

    const connect = async () => {
      try {
        const accessToken = apiClient.getAccessToken();
        if (!accessToken) {
          setRealtime('unauthenticated');
          return;
        }

        const streamTokenRes = await apiClient.createReportsStreamToken();
        const streamToken = streamTokenRes?.data?.streamToken as string | undefined;
        const nonce = streamTokenRes?.data?.nonce as string | undefined;

        if (!streamToken || !nonce) {
          setRealtime('disconnected');
          return;
        }

        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
        source = new EventSource(
          `${base}/reports/realtime?streamToken=${encodeURIComponent(streamToken)}&nonce=${encodeURIComponent(nonce)}`,
        );

        source.onopen = () => setRealtime('connected');
        source.onerror = () => setRealtime('disconnected');
        source.onmessage = () => {
          refetch();
        };
      } catch {
        setRealtime('disconnected');
      }
    };

    connect();

    return () => {
      if (source) {
        source.close();
      }
    };
  }, [refetch]);

  const exportCsv = async () => {
    const params = new URLSearchParams({ range, page: String(page), limit: String(limit) });
    if (country) params.set('country', country);
    if (industry) params.set('industry', industry);
    if (stage) params.set('stage', stage);

    const response = await apiClient.get(`/reports/export/csv?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wingrox-report-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    const params = new URLSearchParams({ range, page: String(page), limit: String(limit) });
    if (country) params.set('country', country);
    if (industry) params.set('industry', industry);
    if (stage) params.set('stage', stage);

    const response = await apiClient.get(`/reports/export/pdf?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wingrox-report-${range}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section style={{ background: 'var(--bg-warm)', minHeight: 'calc(100vh - 72px)', padding: '40px 0 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: 1.1, marginBottom: 8 }}>
              Reporting <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Workspace</em>
            </h1>
            <p style={{ color: 'var(--ink-70)', fontSize: 14 }}>
              Realtime status: {realtime} · Range: {range}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button label="7D" variant={range === '7d' ? 'gold' : 'outline'} size="sm" onClick={() => setRange('7d')} />
            <Button label="30D" variant={range === '30d' ? 'gold' : 'outline'} size="sm" onClick={() => setRange('30d')} />
            <Button label="90D" variant={range === '90d' ? 'gold' : 'outline'} size="sm" onClick={() => setRange('90d')} />
            <Button label="Export CSV" variant="outline" size="sm" onClick={exportCsv} />
            <Button label="Export PDF" variant="primary" size="sm" onClick={exportPdf} />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Filter country (e.g. Germany)"
            style={{ padding: 10, border: '1px solid var(--ink-15)', borderRadius: 'var(--r-sm)' }}
          />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Filter industry (e.g. SaaS)"
            style={{ padding: 10, border: '1px solid var(--ink-15)', borderRadius: 'var(--r-sm)' }}
          />
          <input
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            placeholder="Filter stage (e.g. Seed)"
            style={{ padding: 10, border: '1px solid var(--ink-15)', borderRadius: 'var(--r-sm)' }}
          />
        </div>

        {isLoading || !data ? (
          <div style={{ color: 'var(--ink-70)', fontSize: 14 }}>Loading reports...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--ink-40)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Pipeline (EUR)</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 32 }}>{data.totals.pipelineEur}</div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--ink-40)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Matches</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 32, color: 'var(--sage)' }}>{data.totals.matches}</div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                <div style={{ fontFamily: 'var(--f-mono)', color: 'var(--ink-40)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Avg Conversion</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 32, color: 'var(--gold)' }}>{data.totals.avgConversionRate}%</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 20 }}>
              <ReportsTrendsChart trend={data.trend} />
            </div>

            {segments ? (
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 16 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>By Country</div>
                  {segments.byCountry.map((s) => (
                    <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                      <span>{s.key}</span>
                      <span>{s.pipelineEur}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 16 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>By Industry</div>
                  {segments.byIndustry.map((s) => (
                    <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                      <span>{s.key}</span>
                      <span>{s.matches} matches</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', padding: 16 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>By Stage</div>
                  {segments.byStage.map((s) => (
                    <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                      <span>{s.key}</span>
                      <span>{s.avgConversionRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-50)', fontSize: 12 }}>
                Page {data.pagination.page} · Showing {data.trend.length} of {data.pagination.totalPoints} points
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button label="Prev" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
                <Button label="Next" size="sm" variant="outline" disabled={!data.pagination.hasMore} onClick={() => setPage((p) => p + 1)} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
