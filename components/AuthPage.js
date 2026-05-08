'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { loginUser, registerUser } from '@/lib/api';
import { storeAuthToken } from '@/lib/auth-client';
import styles from './AuthPage.module.css';

const initialLoginForm = {
  email: '',
  password: '',
};

const initialRegisterForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
};

export default function AuthPage({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState('');
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === 'login';
  const redirectPath = searchParams.get('redirect') || '/';

  function handleChange(name, value) {
    setFeedback('');

    if (isLogin) {
      setLoginForm((current) => ({
        ...current,
        [name]: value,
      }));
      return;
    }

    setRegisterForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const payload = isLogin
          ? await loginUser(loginForm)
          : await registerUser(registerForm);

        storeAuthToken(payload.token);
        router.push(redirectPath);
        router.refresh();
      } catch (error) {
        setFeedback(error.message);
      }
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <Link href="/" className={styles.logo}>
            ACENDA
          </Link>
          <span className={styles.kicker}>{isLogin ? 'Member Login' : 'Create Account'}</span>
          <h1>{isLogin ? 'Login to confirm your booking' : 'Create your account before booking'}</h1>
          <p>
            {isLogin
              ? 'Sign in to continue with booking confirmation, account access, and trip history.'
              : 'Register once, then confirm stays, manage your account, and review every reservation.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <p>{isLogin ? 'Enter your account credentials.' : 'Create your booking profile.'}</p>
          </div>

          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin ? (
              <label>
                Full name
                <input
                  value={registerForm.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            ) : null}

            <label>
              Email
              <input
                type="email"
                value={isLogin ? loginForm.email : registerForm.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>

            {!isLogin ? (
              <label>
                Phone
                <input
                  value={registerForm.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  placeholder="Optional"
                />
              </label>
            ) : null}

            <label>
              Password
              <input
                type="password"
                value={isLogin ? loginForm.password : registerForm.password}
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button type="submit" className="pill-button" disabled={isPending}>
              {isPending ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
            </button>
          </form>

          <div className={styles.footer}>
            {isLogin ? (
              <p>
                Need an account?{' '}
                <Link href={`/register?redirect=${encodeURIComponent(redirectPath)}`}>Create one</Link>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`}>Login</Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
