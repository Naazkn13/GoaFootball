import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Auth.module.css";
import { authAPI } from "@/services/api/auth.api";
import OTPModal from "@/components/OTPModal";
import { useAuth } from "@/store/AuthContext";
import axiosInstance from "@/services/axios";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false);

  // Password login state (for clubs and superadmins)
  const [passwordAuth, setPasswordAuth] = useState({ isRequired: false, type: null });
  const [password, setPassword] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // If password login is required and password provided, do password login
      if (passwordAuth.isRequired && password) {
        const endpoint = passwordAuth.type === 'superadmin' ? '/api/auth/admin-login' : '/api/auth/club-login';
        const response = await axiosInstance.post(endpoint, {
          email,
          password,
        });

        if (response.data.success) {
          setSuccessMessage("Login successful! Redirecting...");

          if (response.data.user) {
            login(response.data.user);
          }

          const redirectTo = response.data.redirectTo || "/club/dashboard";
          setTimeout(() => {
            router.push(redirectTo);
          }, 800);
        }
        setLoading(false);
        return;
      }

      // First, check if this email requires a password
      if (!passwordAuth.isRequired) {
        const checkRes = await axiosInstance.post("/api/auth/check-password-required", {
          email,
        });
        if (checkRes.data.requiresPassword) {
          setPasswordAuth({ isRequired: true, type: checkRes.data.userType });
          setLoading(false);
          return; // Show password field, don't send OTP
        }
      }

      // Regular user — send OTP
      await authAPI.sendOTP(email);
      setShowOTPModal(true);
      setSuccessMessage("OTP sent to your email!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to proceed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const response = await authAPI.verifyOTP(email, otp);

      setShowOTPModal(false);
      setSuccessMessage("Login successful! Redirecting...");

      // Instantly update AuthContext with user data
      if (response.user) {
        login(response.user);
      }

      // Redirect based on registration status
      const redirectTo = response.redirectTo || "/profile";
      setTimeout(() => {
        router.push(redirectTo);
      }, 800);
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email);
      setSuccessMessage("OTP resent successfully!");
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to resend OTP."
      );
    }
  };

  // Reset password state when email changes
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (passwordAuth.isRequired) {
      setPasswordAuth({ isRequired: false, type: null });
      setPassword("");
    }
  };

  return (
    <>
      <Head>
        <title>Login — Football Registration</title>
        <meta
          name="description"
          content="Login to your football registration account"
        />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.formsWrapper}>
          <div className={styles.formsInner}>
            <form
              className={`${styles.form} ${styles.loginForm}`}
              onSubmit={handleSendOTP}
            >
              <h2>Greetings! 🏟️</h2>
              <p className={styles.subtitle}>
                {passwordAuth.isRequired
                  ? `Enter your ${passwordAuth.type === 'superadmin' ? 'admin' : 'club'} password to login`
                  : "Enter your email to receive an OTP"}
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  autoFocus={!passwordAuth.isRequired}
                />
              </div>

              {/* Password field — shown only when password login is required */}
              {passwordAuth.isRequired && (
                <div className={styles.inputGroup}>
                  <label htmlFor="auth-password">{passwordAuth.type === 'superadmin' ? 'Admin Password' : 'Club Password'}</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="Enter your club password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              )}

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
              >
                {loading && <span className={styles.spinner} />}
                <span>
                  {loading
                    ? passwordAuth.isRequired
                      ? "Logging in..."
                      : "Sending OTP..."
                    : passwordAuth.isRequired
                    ? "Login"
                    : "Send OTP"}
                </span>
              </button>

              <div className={styles.dividerRow}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>or</span>
                <span className={styles.dividerLine} />
              </div>

              <p className={styles.switchText}>
                New here?{" "}
                <strong>Just enter your email above</strong> &mdash; we&apos;ll
                create your account and redirect you to complete registration as
                a <strong>Player, Coach, Referee, or Manager</strong>.
              </p>

              <p className={styles.switchText} style={{ marginTop: "0.5rem" }}>
                Want to explore first?{" "}
                <Link href="/" className={styles.linkBtn}>
                  ← Back to Home
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className={styles.sidePanel}>
          <div className={styles.panelContent}>
            <h2>Join the Game! ⚽</h2>
            <p>
              Register as a Player, Coach, Referee, or Manager. Get your unique
              Football UID and join the community.
            </p>
            <div className={styles.panelRoles}>
              <span>🏃 Athlete</span>
              <span>🏋️ Coach</span>
              <span>🏁 Referee</span>
              <span>📋 Manager</span>
            </div>
            <p className={styles.panelHint}>
              Enter your email on the left to get started →
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && <div className={styles.errorMessage}>{error}</div>}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
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
