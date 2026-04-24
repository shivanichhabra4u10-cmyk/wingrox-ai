'use client';

import { FormEvent, useState } from 'react';
import { z } from 'zod';
import styles from './LoginForm.module.css';
import { Button } from '../ui/Button';
import { apiClient } from '@/lib/api-client';

const LoginFormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

interface LoginFormProps {
  onSuccess?: (user: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

/**
 * Login Form Component
 * Handles user authentication with email and password
 */
export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    try {
      // Validate form data
      const validated = LoginFormSchema.parse(formData);

      // Call API
      const response = await apiClient.login(validated.email, validated.password);

      if (response.success && response.data?.user) {
        onSuccess?.(response.data.user);
      } else {
        setApiError(response.error?.message || 'Login failed');
        onError?.(response.error?.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormData;
          fieldErrors[path] = err.message as never;
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setApiError(error.message);
        onError?.(error.message);
      } else {
        setApiError('An unexpected error occurred');
        onError?.('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Sign In</h2>
      <p className={styles.subtitle}>Enter your credentials to access your account</p>

      {apiError && <div className={styles.errorAlert}>{apiError}</div>}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="you@example.com"
          disabled={loading}
        />
        {errors.email && <span className={styles.errorText}>{errors.email as string}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          placeholder="••••••••"
          disabled={loading}
        />
        {errors.password && <span className={styles.errorText}>{errors.password as string}</span>}
      </div>

      <Button
        type="submit"
        label={loading ? 'Signing in...' : 'Sign In'}
        variant="primary"
        disabled={loading}
        className={styles.submitBtn}
      />

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <a href="/signup" className={styles.link}>
          Sign up
        </a>
      </p>
    </form>
  );
}
