'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navigation } from '@/components/layout/Navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main>
      <Navigation
        links={[
          { label: 'Platform', href: '#', active: false },
          { label: 'Modules', href: '#', active: false },
        ]}
        showAuthButtons={false}
      />
      <section style={{ minHeight: '100vh', paddingTop: '120px', background: 'var(--bg-warm)' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 20px' }}>
          <LoginForm onSuccess={() => router.push('/')} />
        </div>
      </section>
    </main>
  );
}
