import { useState, useEffect } from 'react';
import styles from '../styles/OTPModal.module.css';

export default function OTPModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend, 
  email,
  purpose = 'login' 
}) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, timer]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '']);
      setError('');
      setTimer(300);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && index === 3) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);

    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpValue = null) => {
    const otpString = otpValue || otp.join('');
    
    if (otpString.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(otpString);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      await onResend();
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <h2>Enter OTP</h2>
          <p>
            We've sent a 4-digit OTP to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <div className={styles.otpInputContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={styles.otpInput}
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.timerSection}>
          {timer > 0 ? (
            <p className={styles.timer}>
              OTP expires in <strong>{formatTime(timer)}</strong>
            </p>
          ) : (
            <p className={styles.expired}>OTP expired</p>
          )}
        </div>

        <button
          className={styles.verifyButton}
          onClick={() => handleVerify()}
          disabled={loading || otp.some((digit) => digit === '')}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className={styles.resendSection}>
          {canResend ? (
            <button
              className={styles.resendButton}
              onClick={handleResend}
              disabled={loading}
            >
              Resend OTP
            </button>
          ) : (
            <p className={styles.resendInfo}>
              Didn't receive OTP? Resend in {formatTime(timer)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
