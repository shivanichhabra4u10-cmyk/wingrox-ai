'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { PlatformAuthShell } from '@/components/platform/PlatformAuthShell';
import styles from '@/components/platform/PlatformView.module.css';

export default function LoginPage() {
  const router = useRouter();

  return (
    <PlatformAuthShell
      eyebrow="Access · Secure Sign-In"
      title={<>Enter the platform with <em>your account.</em></>}
      subtitle="Access your Growth Intelligence OS, Digital Twin, strategic reports, and personalised operating views."
    >
        <div className={`${styles.formCard} ${styles.authFormCard}`}>
          <LoginForm onSuccess={() => router.push('/')} />
      </div>
    </PlatformAuthShell>
  );
}
