import { Suspense } from 'react';
import AuthPage from '@/components/AuthPage';

export const metadata = {
  title: 'Register | Acenda Booking',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="register" />
    </Suspense>
  );
}
