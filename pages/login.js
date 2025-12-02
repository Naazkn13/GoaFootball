import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Auth.module.css";
import { authAPI } from "@/services/api/auth.api";
import OTPModal from "@/components/OTPModal";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState("login"); // 'login' or 'signup'
  const [otpEmail, setOtpEmail] = useState("");
  const [footballId, setFootballId] = useState("");

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    aadhaar: "",
    password: ""
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginLoading) return;

    setLoginLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await authAPI.login(loginData);
      
      if (response.requiresOTP) {
        setOtpEmail(loginData.email);
        setOtpPurpose("login");
        setShowOTPModal(true);
        setSuccessMessage("OTP sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupLoading) return;

    setSignupLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await authAPI.signup(signupData);
      
      if (response.requiresOTP) {
        setOtpEmail(signupData.email);
        setOtpPurpose("signup");
        setFootballId(response.footballId);
        setShowOTPModal(true);
        setSuccessMessage(`Account created! Your Football ID: ${response.footballId}. Please verify your email.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      if (otpPurpose === "login") {
        // Verify login OTP
        const response = await authAPI.verifyLoginOTP({ email: otpEmail, otp });
        
        // Store token and user data
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        setShowOTPModal(false);
        setSuccessMessage("Login successful! Redirecting...");
        
        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      } else {
        // Verify signup OTP
        await authAPI.verifySignupOTP({ email: otpEmail, otp });
        
        setShowOTPModal(false);
        setSuccessMessage("Email verified! Please login with your credentials.");
        setIsSignup(false);
        
        // Reset signup form
        setSignupData({
          name: "",
          email: "",
          phone: "",
          aadhaar: "",
          password: ""
        });
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP({ email: otpEmail, purpose: otpPurpose });
      setSuccessMessage("OTP resent successfully!");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setSuccessMessage("");
    setLoginData({ email: "", password: "" });
    setSignupData({ name: "", email: "", phone: "", aadhaar: "", password: "" });
  };

  const handleVerifyAadhaar = () => {
    // TODO: Implement Aadhaar verification
    alert("Aadhaar verification will be implemented");
  };

  return (
    <div className={`${styles.authContainer} ${isSignup ? styles.signupMode : ""}`}>
      <div className={styles.formsWrapper}>
        <div className={styles.formsInner}>
          {/* Login Form */}
          <form className={`${styles.form} ${styles.loginForm}`} onSubmit={handleLoginSubmit}>
            <h2>Welcome Back 👋</h2>
            <p className={styles.subtitle}>Login to continue</p>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loginLoading}
            >
              {loginLoading && <span className={styles.spinner} />}
              <span>{loginLoading ? "Logging in..." : "Login"}</span>
            </button>

            <p className={styles.switchText}>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setIsSignup(true)}
              >
                Sign up
              </button>
            </p>
          </form>

          {/* Signup Form */}
          <form className={`${styles.form} ${styles.signupForm}`} onSubmit={handleSignupSubmit}>
            <h2>Create Account ✨</h2>
            <p className={styles.subtitle}>Join us in a few seconds</p>

            <div className={styles.inputGroup}>
              <label>Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                pattern="[0-9]{10}"
                required
              />
            </div>

            {/* Aadhaar with Verification */}
            <div className={styles.inputGroup}>
              <label>Aadhaar Number</label>
              <div className={styles.aadhaarWrapper}>
                <input
                  type="text"
                  maxLength="12"
                  placeholder="12-digit Aadhaar"
                  className={styles.aadhaarInput}
                  value={signupData.aadhaar}
                  onChange={(e) => setSignupData({ ...signupData, aadhaar: e.target.value })}
                  pattern="[0-9]{12}"
                  required
                />
                <button type="button" className={styles.verifyBtn} onClick={handleVerifyAadhaar}>
                  Verify
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={signupLoading}
            >
              {signupLoading && <span className={styles.spinner} />}
              <span>{signupLoading ? "Creating account..." : "Sign Up"}</span>
            </button>

            <p className={styles.switchText}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setIsSignup(false)}
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side Panel */}
      <div className={styles.sidePanel}>
        <div className={styles.panelContent}>
          <h2>{isSignup ? "Hello, Friend!" : "Welcome!"}</h2>
          <p>
            {isSignup
              ? "Already registered? Login and continue your journey."
              : "New here? Create an account and get started!"}
          </p>
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
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
          email={otpEmail}
          purpose={otpPurpose}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
}
