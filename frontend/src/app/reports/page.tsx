import { PlatformHtmlViewFrame } from '@/components/platform/PlatformHtmlViewFrame';

export default function ReportsPage() {
  return (
    <PlatformHtmlViewFrame
      active="hub"
      title="Signal Hub"
      loadingText="Loading Signal Hub..."
      viewName="hub"
    />
  );
}
