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

  // Re-upload state
  const [reuploadType, setReuploadType] = useState('');
  const [reuploadFile, setReuploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
  
  // Payment Form State
  const [paymentData, setPaymentData] = useState({
      payment_screenshot_file: null,
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: ""
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
        phone: response.user.phone
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

  const handleReuploadDocument = async (e) => {
    e.preventDefault();
    if (!reuploadType || !reuploadFile) {
      setUploadMsg({ type: 'error', text: 'Please select a document type and file.' });
      return;
    }

    if (reuploadType === 'gff_consent_form' && reuploadFile.type !== 'application/pdf') {
      setUploadMsg({ type: 'error', text: 'GFF Consent Form must be a PDF document.' });
      return;
    }

    setIsUploading(true);
    setUploadMsg({ type: '', text: '' });

    try {
      // 1. Upload to storage
      const formData = new FormData();
      formData.append('file', reuploadFile);
      formData.append('documentType', reuploadType);

      const uploadRes = await axiosInstance.post('/api/user/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newDocUrl = uploadRes.data.url;

      // 2. Update user profile (append document + auto-pending)
      await axiosInstance.put('/api/user/profile', {
        newDocument: {
          type: reuploadType,
          url: newDocUrl,
          uploaded_at: new Date().toISOString()
        }
      });

      setUploadMsg({ type: 'success', text: 'Document uploaded successfully! Your profile is back to Pending.' });
      setReuploadType('');
      setReuploadFile(null);

      // refresh profile to show pending status
      fetchUserProfile();
    } catch (err) {
      console.error(err);
      setUploadMsg({ type: 'error', text: err.response?.data?.message || 'Failed to re-upload document.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!paymentData.payment_screenshot_file) {
      setError('Please provide the Payment Screenshot.');
      return;
    }

    setProcessingPayment(true);
    setError("");

    try {
      // Upload screenshot
      const formData = new FormData();
      formData.append('file', paymentData.payment_screenshot_file);
      formData.append('documentType', 'payment_proof');

      const uploadRes = await axiosInstance.post('/api/user/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Submit manual payment
      await axiosInstance.post('/api/payment/manual-submit', {
        payment_proof_url: uploadRes.data.url
      });

      setShowPaymentForm(false);
      setShowSuccessModal(true);
      fetchPaymentHistory(); // Refresh payment history to show pending
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit payment details");
    } finally {
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

      <div className={styles.profileRoot}>
        <div className={styles.profileCard}>
          {/* Top header with gradient */}
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
              )}
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
          </div>

          {/* Approval Status Badge */}
          {user.registration_completed && (
            <ApprovalBadge
              status={user.approval_status}
              reason={user.approval_reason}
              footballId={user.football_id}
            />
          )}

          {/* Re-upload Document Section (Only for On Hold) */}
          {user.registration_completed && user.approval_status === 'on_hold' && (
            <div className={styles.reuploadSection}>
              <h3 className={styles.sectionTitle} style={{ color: '#d97706', marginBottom: '12px' }}>⚠️ Action Required</h3>
              <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                Your profile is on hold. Please re-upload the requested document to fix the issue. Submitting a new document will automatically send your profile back for review.
              </p>

              <form onSubmit={handleReuploadDocument} className={styles.reuploadForm}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <select
                    className={styles.fieldInput}
                    style={{ flex: 1, minWidth: '150px' }}
                    value={reuploadType}
                    onChange={(e) => setReuploadType(e.target.value)}
                  >
                    <option value="">Select Document Type...</option>
                    <option value="photo">Passport-size Photo</option>
                    <option value="id_proof">ID Proof (Aadhaar/PAN)</option>
                    <option value="birth_certificate">Birth Certificate</option>
                    <option value="gff_consent_form">NSA Consent Form</option>
                  </select>

                  <input
                    type="file"
                    className={styles.fieldInput}
                    style={{ flex: 1, minWidth: '200px' }}
                    accept={reuploadType === 'gff_consent_form' ? 'application/pdf' : 'image/jpeg,image/png,application/pdf'}
                    onChange={(e) => setReuploadFile(e.target.files[0])}
                  />

                  <button
                    type="submit"
                    className={styles.paymentBtn}
                    disabled={isUploading || !reuploadType || !reuploadFile}
                  >
                    {isUploading ? 'Uploading...' : 'Upload & Submit'}
                  </button>
                </div>

                {uploadMsg.text && (
                  <div className={uploadMsg.type === 'success' ? styles.successMsg : styles.errorMsg} style={{ marginTop: '12px' }}>
                    {uploadMsg.text}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Rejected Section */}
          {user.registration_completed && user.approval_status === 'rejected' && (
            <div className={styles.reuploadSection} style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <h3 className={styles.sectionTitle} style={{ color: '#dc2626', marginBottom: '12px' }}>❌ Registration Rejected</h3>
              <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                Your registration has been rejected due to multiple incorrect documents. Please re-register with correct information to proceed.
              </p>
              <button
                className={styles.paymentBtn}
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
                onClick={() => router.push('/register')}
              >
                Re-Register Now
              </button>
            </div>
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
              {user.club_id && (
                <div className={styles.profileField}>
                  <span className={styles.fieldLabel}>Club</span>
                  <span className={styles.fieldValue}>{user.club_name || user.club_id}</span>
                </div>
              )}

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
                    phone: user.phone
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
              {paymentHistory.length > 0 && paymentHistory[0].status === 'pending' ? (
                <div>
                  <h3 className={styles.sectionTitle}>Payment Verification Pending</h3>
                  <p className={styles.paymentText}>
                    Your recent payment details have been submitted and are currently waiting for admin approval. You will be notified once it is verified.
                  </p>
                </div>
              ) : showPaymentForm ? (
                <div style={{ width: '100%' }}>
                  <h3 className={styles.sectionTitle}>Make Payment</h3>
                  <p className={styles.paymentText}>
                    Please pay ₹1 using the generic QR code or UPI details below, then enter your transaction ID and upload the screenshot of your payment.
                  </p>
                  <div style={{ textAlign: 'center', margin: '20px auto', background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', maxWidth: '350px' }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=omkarkachre7@oksbi&pn=Ravens%20FC&am=1&cu=INR`} alt="Payment QR" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
                  </div>
                  <form onSubmit={handleProceedToPayment} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                          <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>Payment Screenshot*</label>
                          <input 
                              type="file" 
                              accept="image/jpeg, image/png, application/pdf"
                              onChange={(e) => setPaymentData({...paymentData, payment_screenshot_file: e.target.files[0]})}
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
                              required
                          />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" className={styles.paymentBtn} disabled={processingPayment} style={{ flex: 1 }}>
                              {processingPayment ? 'Submitting...' : 'Submit Payment Details'}
                          </button>
                          <button type="button" className={styles.cancelBtn} onClick={() => setShowPaymentForm(false)} disabled={processingPayment} style={{ flex: 1 }}>
                              Cancel
                          </button>
                      </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h3 className={styles.sectionTitle}>Payment Missing</h3>
                  <p className={styles.paymentText}>
                    Complete your payment securely to activate your account.
                  </p>
                  {paymentHistory.length > 0 && paymentHistory[0].status === 'rejected' && (
                    <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '10px' }}>
                      Your previous payment was rejected. Please submit a valid payment again.
                    </p>
                  )}
                  <button
                    className={styles.paymentBtn}
                    type="button"
                    onClick={() => setShowPaymentForm(true)}
                  >
                    Proceed to Payment Form
                  </button>
                </div>
              )}
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
            <h3 className={styles.modalTitle}>Payment Submitted!</h3>
            <p className={styles.modalText}>
              Your payment screenshot has been uploaded successfully. Our team will verify the payment. Once approved, you will receive an email with your GFF Football ID.
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
