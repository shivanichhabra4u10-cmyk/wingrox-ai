import { PlatformHtmlViewFrame } from '@/components/platform/PlatformHtmlViewFrame';

export default function TwinPage() {
  return (
    <PlatformHtmlViewFrame
      active="twin"
      title="Digital Twin Intelligence Engine"
      loadingText="Loading Digital Twin Engine..."
      viewName="twin"
    />
  );
}
