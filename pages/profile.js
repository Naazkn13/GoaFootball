import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import styles from "@/styles/Profile.module.css";
import userAPI from "@/services/api/user.api";
import paymentAPI from "@/services/api/payment.api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    aadhaar: ""
  });

  useEffect(() => {
    fetchUserProfile();
    checkPaymentStatus();
    fetchPaymentHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.user);
      setEditData({
        name: response.user.name,
        phone: response.user.phone,
        aadhaar: response.user.aadhaar
      });
    } catch (err) {
      setError("Failed to load profile. Please login again.");
      setTimeout(() => router.push("/login"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await userAPI.getPaymentStatus();
      setIsPaid(response.isPaid);
    } catch (err) {
      console.error("Failed to check payment status:", err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await userAPI.getPaymentHistory();
      setPaymentHistory(response.payments || []);
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
    }
  };

  const handleEditProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const response = await userAPI.updateProfile(editData);
      setUser(response.user);
      setIsEditing(false);
      setError("");
      alert("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleProceedToPayment = async () => {
    if (processingPayment) return;

    setProcessingPayment(true);
    setError("");

    try {
      // Create Razorpay order
      const orderResponse = await paymentAPI.createOrder({
        amount: 500, // ₹500.00
        currency: "INR"
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.order.amount * 100, // Convert to paise
        currency: orderResponse.order.currency,
        name: "Football Membership",
        description: "Membership Payment",
        order_id: orderResponse.order.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              if (verifyResponse.success) {
                setShowSuccessModal(true);
                setIsPaid(true);
                fetchPaymentHistory();
              }
            }
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#3b82f6"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        setError("Payment failed. Please try again.");
        setProcessingPayment(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.profileRoot}>
        <div className={styles.profileCard}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className={styles.profileRoot}>
        <div className={styles.profileCard}>
          {/* Top header with gradient */}
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={styles.profileName}>{user.name}</h2>
              <p className={styles.profileEmail}>{user.email}</p>
              {user.football_id && (
                <p className={styles.footballId}>ID: {user.football_id}</p>
              )}
            </div>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Details section */}
          <div className={styles.profileBody}>
            <h3 className={styles.sectionTitle}>Profile Details</h3>

            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Full Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  <span className={styles.fieldValue}>{user.name}</span>
                )}
              </div>

              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Email</span>
                <span className={styles.fieldValue}>{user.email}</span>
              </div>

              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Phone Number</span>
                {isEditing ? (
                  <input
                    type="tel"
                    className={styles.fieldInput}
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    pattern="[0-9]{10}"
                  />
                ) : (
                  <span className={styles.fieldValue}>{user.phone}</span>
                )}
              </div>

              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Aadhaar Number</span>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={editData.aadhaar}
                    onChange={(e) => setEditData({ ...editData, aadhaar: e.target.value })}
                    maxLength="12"
                    pattern="[0-9]{12}"
                  />
                ) : (
                  <span className={styles.fieldValue}>{user.aadhaar}</span>
                )}
              </div>
            </div>

            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={handleEditProfile}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
            {isEditing && (
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    name: user.name,
                    phone: user.phone,
                    aadhaar: user.aadhaar
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Payment section */}
          {!isPaid ? (
            <div className={styles.profileFooter}>
              <div>
                <h3 className={styles.sectionTitle}>Payment</h3>
                <p className={styles.paymentText}>
                  Complete your payment securely to activate your account.
                </p>
                <p className={styles.paymentAmount}>₹ 500.00</p>
              </div>

              <button
                className={styles.paymentBtn}
                type="button"
                onClick={handleProceedToPayment}
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          ) : (
            <div className={styles.profileFooter}>
              <div>
                <h3 className={styles.sectionTitle}>Payment Status</h3>
                <p className={styles.paidStatus}>✓ Payment Completed</p>
                {paymentHistory.length > 0 && (
                  <div className={styles.paymentHistory}>
                    <h4>Payment History</h4>
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className={styles.paymentItem}>
                        <span>₹{parseFloat(payment.amount).toFixed(2)}</span>
                        <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                        <span className={styles.paymentStatus}>{payment.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Success Modal */}
      {
        showSuccessModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalSuccessIcon}>✓</div>
              <h3 className={styles.modalTitle}>Payment Successful!</h3>
              <p className={styles.modalText}>
                Your payment has been processed successfully.<br />
                <strong>Football ID: {user.football_id}</strong>
              </p>
              <button
                className={styles.modalBtn}
                onClick={() => setShowSuccessModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        )
      }
    </>
  );
}
