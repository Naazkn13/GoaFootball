import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";
import styles from "@/styles/Profile.module.css";
import userAPI from "@/services/api/user.api";
import paymentAPI from "@/services/api/payment.api";
import axiosInstance from "@/services/axios";
import ApprovalBadge from "@/components/ApprovalBadge";
import ChatDrawer from "@/components/ChatDrawer";
import { useAuth } from "@/store/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
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

  // Chat parameters
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    checkPaymentStatus();
    fetchPaymentHistory();
    fetchConversations();
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

  const fetchConversations = async () => {
    try {
      const resp = await axiosInstance.get('/api/messages/conversations');
      if (resp.data.conversations && resp.data.conversations.length > 0) {
        const conv = resp.data.conversations[0];
        setConversationId(conv.id);
        setAdminId(conv.admin_id);
      }
    } catch (err) {
      console.error("Failed to load previous conversations", err);
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleProceedToPayment = async () => {
    if (processingPayment) return;

    setProcessingPayment(true);
    setError("");

    try {
      const orderResponse = await paymentAPI.createOrder();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.order.amount * 100,
        currency: orderResponse.order.currency,
        name: "Football Registration",
        description: "Registration Payment",
        order_id: orderResponse.order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              setShowSuccessModal(true);
              setIsPaid(true);
              fetchPaymentHistory();
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
        theme: { color: "#1a56db" }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function () {
        setError("Payment failed. Please try again.");
        setProcessingPayment(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleOpenChat = async () => {
    if (conversationId) {
      setIsChatOpen(true);
      return;
    }

    setStartingChat(true);
    try {
      // Create or get conversation ID
      const convRes = await axiosInstance.post('/api/messages/create-conversation', {
        subject: 'Support Chat'
      });

      setConversationId(convRes.data.conversation.id);
      setIsChatOpen(true);
    } catch (err) {
      console.error("Failed to start chat", err);
      setError("Unable to start chat. Please try again later.");
    } finally {
      setStartingChat(false);
    }
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
      <Head>
        <title>Profile — Football Registration</title>
      </Head>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className={styles.profileRoot}>
        <div className={styles.profileCard}>
          {/* Top header with gradient */}
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={styles.profileName}>{user.name || 'New User'}</h2>
              <p className={styles.profileEmail}>{user.email}</p>
              {user.football_id && (
                <p className={styles.footballId}>ID: {user.football_id}</p>
              )}
              {user.role && (
                <p className={styles.roleTag}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
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

          {/* Approval Status Badge */}
          {user.registration_completed && (
            <ApprovalBadge
              status={user.approval_status}
              reason={user.approval_reason}
              footballId={user.football_id}
            />
          )}

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
                  <span className={styles.fieldValue}>{user.name || '—'}</span>
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
                  <span className={styles.fieldValue}>{user.phone || '—'}</span>
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
                  <span className={styles.fieldValue}>{user.aadhaar || '—'}</span>
                )}
              </div>

              {user.role && (
                <div className={styles.profileField}>
                  <span className={styles.fieldLabel}>Role</span>
                  <span className={styles.fieldValue}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              )}

              {user.date_of_birth && (
                <div className={styles.profileField}>
                  <span className={styles.fieldLabel}>Date of Birth</span>
                  <span className={styles.fieldValue}>{new Date(user.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
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

          {/* Admin users — show link to admin dashboard */}
          {user.is_admin && (
            <div className={styles.profileFooter} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div>
                <h3 className={styles.sectionTitle}>🛡️ Admin Access</h3>
                <p className={styles.paymentText}>
                  You have administrator privileges. Manage registrations, users, and settings from the admin dashboard.
                </p>
              </div>
              <button
                className={styles.paymentBtn}
                type="button"
                onClick={() => router.push('/admin')}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }}
              >
                Go to Admin Dashboard →
              </button>
            </div>
          )}

          {/* Registration incomplete — prompt to finish (non-admin users only) */}
          {!user.is_admin && !user.registration_completed && (
            <div className={styles.profileFooter} style={{ borderLeft: '4px solid #f59e0b' }}>
              <div>
                <h3 className={styles.sectionTitle}>⚠️ Registration Incomplete</h3>
                <p className={styles.paymentText}>
                  You haven&apos;t completed your registration yet. Please select your role, fill in your details, and upload documents to continue.
                </p>
              </div>
              <button
                className={styles.paymentBtn}
                type="button"
                onClick={() => router.push('/register')}
              >
                Complete Registration →
              </button>
            </div>
          )}

          {/* Payment section — only show AFTER registration is completed */}
          {user.registration_completed && !isPaid && (
            <div className={styles.profileFooter}>
              <div>
                <h3 className={styles.sectionTitle}>Payment</h3>
                <p className={styles.paymentText}>
                  Complete your payment securely to activate your account.
                </p>
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
          )}

          {user.registration_completed && isPaid && (
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

          {/* Chat with Admin button */}
          {user.registration_completed && (
            <div className={styles.chatSection}>
              <button
                className={styles.chatBtn}
                type="button"
                onClick={handleOpenChat}
                disabled={startingChat}
              >
                {startingChat ? "Connecting..." : "💬 Chat with Admin"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        adminId={adminId}
        conversationId={conversationId}
      />

      {/* Success Modal */}
      {showSuccessModal && (
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
      )}
    </>
  );
}
