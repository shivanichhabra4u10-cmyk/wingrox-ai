import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { QueryProvider } from '@/lib/query-provider';
import { JetBrains_Mono, Outfit, Playfair_Display } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WinGroX AI — Growth Intelligence OS™',
  description: 'Enterprise Growth Intelligence Operating System',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          ['--f-display' as string]: `${playfairDisplay.style.fontFamily}, Georgia, serif`,
          ['--f-body' as string]: `${outfit.style.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
          ['--f-mono' as string]: `${jetBrainsMono.style.fontFamily}, 'SF Mono', monospace`,
        }}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
