import { Injectable } from '@nestjs/common';
import { DashboardOverviewResponse } from './dashboard.dto';

@Injectable()
export class DashboardService {
  getOverview(): DashboardOverviewResponse {
    return {
      greeting: 'Welcome back, Founder',
      stage: 'Experimenter',
      metrics: [
        { value: '64', label: 'Twin Score', variant: 'accent' },
        { value: 'Experimenter', label: 'Cluster Stage', variant: 'accent' },
        { value: '42', label: 'Matches', variant: 'good' },
        { value: 'EUR 180K', label: 'Pipeline Est.' },
        { value: 'Demand', label: 'Primary Constraint', variant: 'alert' },
      ],
      readiness: [
        { name: 'Demand', score: 58, color: 'var(--rose)' },
        { name: 'Strategy', score: 62, color: 'var(--amber)' },
        { name: 'Competition', score: 60, color: 'var(--amber)' },
        { name: 'Economics', score: 66, color: 'var(--gold)' },
        { name: 'Customer', score: 59, color: 'var(--rose)' },
        { name: 'Execution', score: 70, color: 'var(--sage)' },
      ],
      actions: [
        { icon: '🤝', title: 'Review 42 Matches', description: 'Book Discovery Call', href: '/dashboard/matches' },
        { icon: '📊', title: 'Model Revenue', description: '+2x scenario', href: '/dashboard/simulator' },
        { icon: '🌍', title: 'Enter Germany', description: 'Top-ranked country', href: '/dashboard/expansion' },
        { icon: '📚', title: 'Read Playbook', description: 'Distribution partnerships', href: '/dashboard/hub' },
      ],
      feed: [
        {
          type: 'insight',
          title: '3 new playbooks matched to your GTM needs',
          description:
            'Distribution-led entry for industrial SaaS in Germany and 2 others just published in the Intelligence Hub.',
          time: '15 minutes ago',
          source: 'Intelligence Hub',
        },
        {
          type: 'match',
          title: '7 new matches added in last 48 hours',
          description:
            'Including 2 Tier-1 VCs in London and 3 industrial distributors in DACH region.',
          time: '2 hours ago',
          source: 'Match Engine',
        },
        {
          type: 'milestone',
          title: 'You are now expansion-ready for Netherlands',
          description:
            'Your recent answers unlocked Netherlands as a viable secondary entry market.',
          time: 'Yesterday',
          source: 'Expansion Engine',
        },
        {
          type: 'alert',
          title: 'Risk alert: Demand pipeline below threshold',
          description:
            'Your demand score of 58 is the primary blocker to first deal. Run 15 structured EU prospect calls in 30 days.',
          time: 'Yesterday',
          source: 'AI Advisor',
        },
      ],
    };
  }
}
