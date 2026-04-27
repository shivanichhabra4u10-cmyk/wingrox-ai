'use client';

import { FormEvent, useState } from 'react';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Button } from '../ui/Button';
import styles from './SignupForm.module.css';

const SignupFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupFormData = z.infer<typeof SignupFormSchema>;

type SignupFormProps = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function SignupForm({ onSuccess, onError }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    try {
      const validated = SignupFormSchema.parse(formData);
      await apiClient.signup(validated.email, validated.password, validated.name);
      onSuccess?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignupFormData;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setApiError(error.message);
        onError?.(error.message);
      } else {
        setApiError('Signup failed');
        onError?.('Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Create Account</h2>
      <p className={styles.subtitle}>Create your WinGroX AI account and enter the operating system.</p>

      {apiError ? <div className={styles.errorAlert}>{apiError}</div> : null}

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          disabled={loading}
        />
        {errors.name ? <span className={styles.errorText}>{errors.name}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          disabled={loading}
        />
        {errors.email ? <span className={styles.errorText}>{errors.email}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          disabled={loading}
        />
        {errors.password ? <span className={styles.errorText}>{errors.password}</span> : null}
      </div>

      <Button
        type="submit"
        label={loading ? 'Creating...' : 'Create Account'}
        variant="primary"
        disabled={loading}
        className={styles.submitBtn}
      />

      <p className={styles.footer}>
        Already have an account? <a href="/login" className={styles.link}>Sign in</a>
      </p>
    </form>
  );
}
