import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "@/styles/Auth.module.css";
import { authAPI } from "@/services/api/auth.api";
import OTPModal from "@/components/OTPModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await authAPI.sendOTP(email);
      setShowOTPModal(true);
      setSuccessMessage("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const response = await authAPI.verifyOTP(email, otp);

      setShowOTPModal(false);
      setSuccessMessage("Login successful! Redirecting...");

      // Redirect based on registration status
      const redirectTo = response.redirectTo || '/profile';
      setTimeout(() => {
        router.push(redirectTo);
      }, 800);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email);
      setSuccessMessage("OTP resent successfully!");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <>
      <Head>
        <title>Login — Football Registration</title>
        <meta name="description" content="Login to your football registration account" />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.formsWrapper}>
          <div className={styles.formsInner}>
            <form className={`${styles.form} ${styles.loginForm}`} onSubmit={handleSendOTP}>
              <h2>Welcome Back 👋</h2>
              <p className={styles.subtitle}>Enter your email to receive a login OTP</p>

              <div className={styles.inputGroup}>
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
              >
                {loading && <span className={styles.spinner} />}
                <span>{loading ? "Sending OTP..." : "Send OTP"}</span>
              </button>

              <p className={styles.switchText}>
                New here? Enter your email and we&apos;ll get you started!
              </p>
            </form>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className={styles.sidePanel}>
          <div className={styles.panelContent}>
            <h2>Join the Game! ⚽</h2>
            <p>
              Register as a Player, Coach, or Referee.
              Get your Football UID and join the community.
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        {/* OTP Modal */}
        {showOTPModal && (
          <OTPModal
            isOpen={showOTPModal}
            email={email}
            purpose="login"
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onClose={() => setShowOTPModal(false)}
          />
        )}
      </div>
    </>
  );
}
