import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Register.module.css';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Payment Successful — National Sports Academy</title>
      </Head>

      <div className={styles.registerContainer}>
        <div className={styles.registerCard} style={{ textAlign: 'center', maxWidth: '550px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2.5rem', color: 'white',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
            animation: 'slideUp 0.5s ease forwards'
          }}>
            ✓
          </div>

          <h1 className={styles.stepTitle} style={{ color: '#16a34a', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h1>

          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Your registration payment has been received and verified successfully.
            Your profile is now complete and pending admin approval.
          </p>

          <div style={{
            background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem'
          }}>
            <p style={{ color: '#15803d', fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>
              ✅ Payment confirmed &nbsp;·&nbsp; ✅ Profile submitted &nbsp;·&nbsp; ⏳ Awaiting approval
            </p>
          </div>

          <Link href="/profile" className={styles.submitBtn} style={{
            display: 'inline-flex', textDecoration: 'none', justifyContent: 'center'
          }}>
            Go to My Profile →
          </Link>

          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1.5rem' }}>
            Redirecting to your profile in {countdown} seconds...
          </p>
        </div>
      </div>
    </>
  );
}
