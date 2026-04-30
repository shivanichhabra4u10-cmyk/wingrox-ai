import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import { PlatformTwin } from '@/components/platform/PlatformTwin';

// Read the verbatim HTML body once per server process and reuse it across
// requests. `cache()` deduplicates within a single render; the module-level
// promise deduplicates across renders.
const readTwinBody = cache(async () => {
  const htmlPath = path.join(
    process.cwd(),
    'src',
    'components',
    'platform',
    'twin',
    'twin-body.html',
  );
  return fs.readFile(htmlPath, 'utf8');
});

export default async function TwinPage() {
  const bodyHtml = await readTwinBody();
  return <PlatformTwin bodyHtml={bodyHtml} />;
}
