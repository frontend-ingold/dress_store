import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export const metadata = {
  title: 'Login | Acenda Booking',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="login" />
    </Suspense>
  );
}
