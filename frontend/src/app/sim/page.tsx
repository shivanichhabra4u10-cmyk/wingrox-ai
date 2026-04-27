import { PlatformHtmlViewFrame } from '@/components/platform/PlatformHtmlViewFrame';

export default function SimulatorsPage() {
  return (
    <PlatformHtmlViewFrame
      active="sim"
      title="Growth Simulator Suite"
      loadingText="Loading Simulator Suite..."
      viewName="sim"
    />
  );
}
