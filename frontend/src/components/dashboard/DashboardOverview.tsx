'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import styles from './DashboardOverview.module.css';
import { Button } from '@/components/ui/Button';
import { DashboardReadinessChart } from './DashboardReadinessChart';

type DashboardOverviewData = {
  greeting: string;
  stage: string;
  metrics: Array<{ value: string; label: string; variant?: 'default' | 'good' | 'alert' | 'accent' }>;
  readiness: Array<{ name: string; score: number; color: string }>;
  actions: Array<{ icon: string; title: string; description: string; href: string }>;
  feed: Array<{ type: 'insight' | 'match' | 'milestone' | 'alert'; title: string; description: string; time: string; source: string }>;
};

function iconClass(type: DashboardOverviewData['feed'][number]['type']): string {
  if (type === 'insight') return styles.fiIconInsight;
  if (type === 'match') return styles.fiIconMatch;
  if (type === 'milestone') return styles.fiIconMilestone;
  return styles.fiIconAlert;
}

export function DashboardOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/overview');
      return res.data.data as DashboardOverviewData;
    },
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  if (isError || !data) {
    return <div className={styles.error}>Unable to load dashboard data.</div>;
  }

  return (
    <div className={styles.dashWrap}>
      <div className={styles.container}>
        <div className={styles.dashHeader}>
          <div>
            <div className={styles.dashGreeting}>{data.greeting.replace('Founder', '')}<em>Founder</em></div>
            <div className={styles.dashSub}>Your Growth Intelligence OS · Last updated just now</div>
          </div>
          <div className={styles.dashActions}>
            <Button label="Run Simulator" variant="outline" size="sm" />
            <Button label="View Matches" size="sm" />
          </div>
        </div>

        <div className={styles.dashMetricRow}>
          {data.metrics.map((m) => (
            <div key={m.label} className={styles.dmCell}>
              <div className={`${styles.dmVal} ${m.variant === 'good' ? styles.dmValGood : m.variant === 'alert' ? styles.dmValAlert : m.variant === 'accent' ? styles.dmValAccent : ''}`}>
                {m.value}
              </div>
              <div className={styles.dmLbl}>{m.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.dashGrid}>
          <div className={styles.dashCard}>
            <div className={styles.dcLabel}>Growth Intelligence Overview</div>
            <h3 className={styles.overviewTitle}>You are at the <em>{data.stage}</em> stage.</h3>
            <div className={styles.readinessGrid}>
              {data.readiness.map((r) => (
                <div key={r.name} className={styles.barRow}>
                  <span className={styles.barLabel}>{r.name}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${r.score}%`, background: r.color }} />
                  </div>
                  <span className={styles.barValue}>{r.score}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartWrap}>
              <div className={styles.dcLabel}>Readiness Chart</div>
              <DashboardReadinessChart readiness={data.readiness.map((r) => ({ name: r.name, score: r.score }))} />
            </div>
          </div>

          <div className={styles.dashCard}>
            <div className={styles.dcLabel}>Recommended Next Actions</div>
            <div className={styles.qaGrid}>
              {data.actions.map((a) => (
                <button key={a.title} className={styles.qaTile}>
                  <div className={styles.qaIcon}>{a.icon}</div>
                  <div className={styles.qaTitle}>{a.title}</div>
                  <div className={styles.qaDesc}>{a.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.dashCard}>
          <div className={styles.dcLabel}>Personalized Insights Feed</div>
          {data.feed.map((f) => (
            <div key={f.title} className={styles.feedItem}>
              <div className={`${styles.fiIcon} ${iconClass(f.type)}`}>◈</div>
              <div>
                <div className={styles.fiTitle}>{f.title}</div>
                <div className={styles.fiDesc}>{f.description}</div>
                <div className={styles.fiTime}>{f.time} · {f.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
