'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsed = SignupSchema.parse({ name, email, password });
      await apiClient.signup(parsed.email, parsed.password, parsed.name);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Navigation showAuthButtons={false} />
      <section style={{ minHeight: '100vh', paddingTop: '120px', background: 'var(--bg-warm)' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 20px' }}>
          <form onSubmit={submit} style={{ background: 'var(--surface)', border: '1px solid var(--ink-08)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-lg)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '28px', marginBottom: '8px' }}>Create Account</h2>
            <p style={{ color: 'var(--ink-70)', marginBottom: '20px' }}>Start using WinGroX AI</p>
            {error ? <div style={{ marginBottom: '12px', color: 'var(--rose)' }}>{error}</div> : null}
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase' }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: '12px', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-15)' }} />
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase' }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: '100%', marginBottom: '12px', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-15)' }} />
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase' }}>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={{ width: '100%', marginBottom: '20px', padding: '12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-15)' }} />
            <Button label={loading ? 'Creating...' : 'Create Account'} type="submit" disabled={loading} />
          </form>
        </div>
      </section>
    </main>
  );
}
