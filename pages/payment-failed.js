import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Register.module.css';

const REASON_MESSAGES = {
  missing_params: 'Payment information was incomplete. Please try again.',
  verification_failed: 'Payment could not be verified. If money was deducted, it will be refunded automatically.',
  record_not_found: 'Payment record was not found. Please contact support.',
  server_error: 'An unexpected error occurred. Please try again or contact support.',
};

export default function PaymentFailedPage() {
  const router = useRouter();
  const { reason, status } = router.query;

  const message = REASON_MESSAGES[reason] || 'Your payment could not be completed. Please try again.';

  return (
    <>
      <Head>
        <title>Payment Failed — National Sports Academy</title>
      </Head>

      <div className={styles.registerContainer}>
        <div className={styles.registerCard} style={{ textAlign: 'center', maxWidth: '550px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2.5rem', color: 'white',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            animation: 'slideUp 0.5s ease forwards'
          }}>
            ✕
          </div>

          <h1 className={styles.stepTitle} style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
            Payment Failed
          </h1>

          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {message}
          </p>

          {status && (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Status: {status}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/profile" className={styles.submitBtn} style={{
              display: 'inline-flex', textDecoration: 'none', justifyContent: 'center'
            }}>
              Try Again from Profile →
            </Link>

            <Link href="/" className={styles.backBtn} style={{
              display: 'inline-flex', textDecoration: 'none', justifyContent: 'center'
            }}>
              ← Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
