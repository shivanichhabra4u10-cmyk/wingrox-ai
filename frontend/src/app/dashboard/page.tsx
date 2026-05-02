import { PlatformHtmlViewFrame } from '@/components/platform/PlatformHtmlViewFrame';

export default function DashboardPage() {
  return (
    <PlatformHtmlViewFrame
      active="dashboard"
      title="Growth Intelligence Dashboard"
      loadingText="Loading Dashboard..."
      viewName="dashboard"
    />
  );
}
