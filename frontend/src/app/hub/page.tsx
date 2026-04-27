import { PlatformHtmlViewFrame } from '@/components/platform/PlatformHtmlViewFrame';

export default function HubPage() {
  return (
    <PlatformHtmlViewFrame
      active="hub"
      title="Signal Hub"
      loadingText="Loading Signal Hub..."
      viewName="hub"
    />
  );
}
