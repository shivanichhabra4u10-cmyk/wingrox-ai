'use client';

import { useRouter } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { PlatformAuthShell } from '@/components/platform/PlatformAuthShell';
import styles from '@/components/platform/PlatformView.module.css';

export default function SignupPage() {
  const router = useRouter();

  return (
    <PlatformAuthShell
      eyebrow="Account Setup · Start Here"
      title={<>Create your <em>WinGroX AI</em> account.</>}
      subtitle="Set up secure access to your digital twin, intelligence layers, global expansion workflows, and operating dashboard."
    >
      <div className={`${styles.formCard} ${styles.authFormCard}`}>
        <SignupForm onSuccess={() => router.push('/')} />
      </div>
    </PlatformAuthShell>
  );
}
