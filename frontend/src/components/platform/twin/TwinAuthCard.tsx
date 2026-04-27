import { memo } from 'react';
import styles from '../PlatformView.module.css';

type TwinAuthCardProps = {
  packageName: string;
  email: string;
  otpCode: string;
  otpSent: boolean;
  sending: boolean;
  verifying: boolean;
  error: string | null;
  notice: string | null;
  sessionToken: string | null;
  onEmailChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
};

export const TwinAuthCard = memo(function TwinAuthCard({
  packageName,
  email,
  otpCode,
  otpSent,
  sending,
  verifying,
  error,
  notice,
  sessionToken,
  onEmailChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
}: TwinAuthCardProps) {
  return (
    <div className="dash-card" style={{ marginTop: 28 }}>
      <div className="dc-label">Access your Digital Twin</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 26, marginBottom: 8 }}>
        Start your assessment with <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{packageName}</em>
      </h2>
      <p style={{ fontSize: 13.5, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 20 }}>
        Enter your work email. We send a one-time code. Human-verified access with backend persistence enabled.
      </p>

      <div className="field">
        <label htmlFor="twin-email">Work Email</label>
        <input
          id="twin-email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>

      {!otpSent ? (
        <button className="btn-primary" type="button" onClick={onSendOtp} disabled={sending}>
          {sending ? 'Sending code...' : 'Send Access Code'} <span className="arr">→</span>
        </button>
      ) : (
        <>
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="twin-otp">OTP Code</label>
            <input
              id="twin-otp"
              value={otpCode}
              onChange={(e) => onOtpChange(e.target.value)}
              placeholder="_ _ _ _ _ _"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          <button className="btn-primary" type="button" onClick={onVerifyOtp} disabled={verifying}>
            {verifying ? 'Verifying...' : 'Verify & Start Diagnostic'} <span className="arr">→</span>
          </button>
        </>
      )}

      {error ? <div className={styles.twinError}>{error}</div> : null}
      {notice ? <div className={styles.twinNotice}>{notice}</div> : null}
      {sessionToken ? <div className={styles.twinSession}>Session established securely.</div> : null}
    </div>
  );
});
