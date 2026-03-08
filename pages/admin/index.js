import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/Admin.module.css';
import axiosInstance from '@/services/axios';
import { useAuth } from '@/store/AuthContext';
import ChatTab from '@/components/ChatTab';
import PageDesigner from '@/components/PageDesigner';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState('registrations');
    const [registrations, setRegistrations] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionModal, setActionModal] = useState(null);
    const [actionReason, setActionReason] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, on_hold: 0 });
    const [clubs, setClubs] = useState([]);
    const [newClub, setNewClub] = useState({ name: '', email: '', location: '', logo_url: '' });
    const [clubLogoFile, setClubLogoFile] = useState(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            if (activeTab === 'registrations') {
                fetchRegistrations();
            } else if (activeTab === 'users') {
                fetchUsers();
            } else if (activeTab === 'clubs') {
                fetchClubs();
            }
        }
    }, [isAdmin, activeTab, statusFilter]);

    // Load stats on mount
    useEffect(() => {
        if (isAdmin) {
            fetchStats();
        }
    }, [isAdmin]);

    const fetchStats = async () => {
        try {
            const statuses = ['pending', 'approved', 'rejected', 'on_hold'];
            const results = {};
            for (const s of statuses) {
                const resp = await axiosInstance.get(`/api/admin/registrations?status=${s}`);
                results[s] = resp.data.count || 0;
            }
            setStats(results);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/admin/registrations?status=${statusFilter}`);
            setRegistrations(response.data.registrations || []);
        } catch (err) {
            setError('Failed to fetch registrations');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
            const response = await axiosInstance.get(`/api/admin/users${params}`);
            setUsers(response.data.users || []);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchClubs = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/admin/clubs');
            setClubs(response.data.clubs || []);
        } catch (err) {
            setError('Failed to fetch clubs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let logo_url = '';
            if (clubLogoFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', clubLogoFile);
                formDataUpload.append('documentType', 'photo'); // Reuse generic upload
                const uploadRes = await axiosInstance.post('/api/user/upload-document', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                logo_url = uploadRes.data.url;
            }

            await axiosInstance.post('/api/admin/clubs', {
                ...newClub,
                logo_url
            });

            setSuccess(`Club ${newClub.name} created successfully`);
            setNewClub({ name: '', email: '', location: '', logo_url: '' });
            setClubLogoFile(null);
            fetchClubs();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create club');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        if ((action === 'reject' || action === 'hold') && !actionReason) {
            setError('Reason is required for rejection/hold');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axiosInstance.post('/api/admin/approve', {
                userId,
                action,
                reason: actionReason,
            });

            setSuccess(`User ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'put on hold'} successfully`);
            setActionModal(null);
            setActionReason('');
            fetchRegistrations();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axiosInstance.post('/api/admin/create-admin', { email: newAdminEmail });
            setSuccess(`${newAdminEmail} has been granted admin access`);
            setNewAdminEmail('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !isAdmin) {
        return (
            <div className={styles.adminContainer}>
                <p style={{ color: '#fff', textAlign: 'center', paddingTop: '3rem' }}>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Admin Dashboard — Football Registration</title>
            </Head>

            <div className={styles.adminContainer}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2>⚽ Admin</h2>
                    </div>
                    <nav className={styles.sidebarNav}>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'registrations' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('registrations')}
                        >
                            📋 Registrations <span className={styles.badge}>{stats.pending}</span>
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'users' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            👥 Users
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'clubs' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('clubs')}
                        >
                            🛡️ Clubs
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'chat' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            💬 Chat
                        </button>
                        {user?.is_super_admin && (
                            <button
                                className={`${styles.navBtn} ${activeTab === 'settings' ? styles.navBtnActive : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Settings
                            </button>
                        )}
                        {user?.is_super_admin && (
                            <button
                                className={`${styles.navBtn} ${activeTab === 'designer' ? styles.navBtnActive : ''}`}
                                onClick={() => setActiveTab('designer')}
                            >
                                🎨 Page Designer
                            </button>
                        )}
                    </nav>
                    <button className={styles.backBtn} onClick={() => router.push('/profile')}>
                        ← Back to Profile
                    </button>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {/* Stats Bar */}
                    <div className={styles.statsBar}>
                        <div className={`${styles.statCard} ${styles.statPending}`}>
                            <span className={styles.statNumber}>{stats.pending}</span>
                            <span className={styles.statLabel}>Pending</span>
                        </div>
                        <div className={`${styles.statCard} ${styles.statApproved}`}>
                            <span className={styles.statNumber}>{stats.approved}</span>
                            <span className={styles.statLabel}>Approved</span>
                        </div>
                        <div className={`${styles.statCard} ${styles.statRejected}`}>
                            <span className={styles.statNumber}>{stats.rejected}</span>
                            <span className={styles.statLabel}>Rejected</span>
                        </div>
                        <div className={`${styles.statCard} ${styles.statOnHold}`}>
                            <span className={styles.statNumber}>{stats.on_hold}</span>
                            <span className={styles.statLabel}>On Hold</span>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && <div className={styles.errorMsg}>{error}</div>}
                    {success && <div className={styles.successMsg}>{success}</div>}

                    {/* Registrations Tab */}
                    {activeTab === 'registrations' && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Registration Queue</h2>
                                <div className={styles.filterGroup}>
                                    {['pending', 'approved', 'rejected', 'on_hold'].map((s) => (
                                        <button
                                            key={s}
                                            className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`}
                                            onClick={() => setStatusFilter(s)}
                                        >
                                            {s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <p className={styles.loadingText}>Loading registrations...</p>
                            ) : registrations.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No {statusFilter.replace('_', ' ')} registrations</p>
                                </div>
                            ) : (
                                <div className={styles.registrationsList}>
                                    {registrations.map((reg) => (
                                        <div key={reg.id} className={styles.regCard}>
                                            <div className={styles.regCardHeader}>
                                                <div className={styles.regAvatar}>
                                                    {reg.name ? reg.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className={styles.regInfo}>
                                                    <h3>{reg.name || 'No Name'}</h3>
                                                    <p>{reg.email}</p>
                                                    <p className={styles.regRole}>{reg.role || 'N/A'}</p>
                                                </div>
                                                <div className={styles.regMeta}>
                                                    <span>Registered: {new Date(reg.created_at).toLocaleDateString()}</span>
                                                    {reg.is_paid && <span className={styles.paidBadge}>✓ Paid</span>}
                                                </div>
                                            </div>

                                            <div className={styles.regCardBody}>
                                                <div className={styles.regDetail}>
                                                    <strong>Phone:</strong> {reg.phone || '—'}
                                                </div>
                                                <div className={styles.regDetail}>
                                                    <strong>DOB:</strong> {reg.date_of_birth ? new Date(reg.date_of_birth).toLocaleDateString() : '—'}
                                                </div>
                                                <div className={styles.regDetail}>
                                                    <strong>Gender:</strong> {reg.gender || '—'}
                                                </div>
                                                {reg.address && (
                                                    <div className={styles.regDetail}>
                                                        <strong>Address:</strong> {`${reg.address.line1 || ''}, ${reg.address.city || ''}, ${reg.address.state || ''}`}
                                                    </div>
                                                )}
                                                {reg.football_id && (
                                                    <div className={styles.regDetail}>
                                                        <strong>Football ID:</strong> {reg.football_id}
                                                    </div>
                                                )}
                                                {reg.documents && reg.documents.length > 0 && (
                                                    <div className={styles.regDetail}>
                                                        <strong>Documents:</strong>
                                                        <div className={styles.docList}>
                                                            {(() => {
                                                                // Group documents by type to show history
                                                                const groupedDocs = {};
                                                                reg.documents.forEach(doc => {
                                                                    if (!groupedDocs[doc.type]) groupedDocs[doc.type] = [];
                                                                    groupedDocs[doc.type].push(doc);
                                                                });

                                                                return Object.keys(groupedDocs).map(type => (
                                                                    <div key={type} className={styles.docGroup}>
                                                                        <span className={styles.docTypeLabel}>
                                                                            {type === 'id_proof' ? 'ID Proof' :
                                                                                type === 'birth_certificate' ? 'Birth Cert.' :
                                                                                    type === 'photo' ? 'Photo' :
                                                                                        type === 'gff_consent_form' ? 'Consent' : type}:
                                                                        </span>
                                                                        {groupedDocs[type].map((doc, i) => (
                                                                            <a
                                                                                key={i}
                                                                                href={doc.url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className={`${styles.docLink} ${i === groupedDocs[type].length - 1 && groupedDocs[type].length > 1 ? styles.docLinkNew : ''}`}
                                                                            >
                                                                                📄 View {i > 0 ? `(V${i + 1})` : ''}
                                                                                {i === groupedDocs[type].length - 1 && groupedDocs[type].length > 1 && <span className={styles.newBadge}>NEW</span>}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                ));
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {statusFilter === 'pending' && (
                                                <div className={styles.regCardActions}>
                                                    <button
                                                        className={styles.approveBtn}
                                                        onClick={() => handleAction(reg.id, 'approve')}
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        className={styles.rejectBtn}
                                                        onClick={() => setActionModal({ userId: reg.id, action: 'reject' })}
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                    <button
                                                        className={styles.holdBtn}
                                                        onClick={() => setActionModal({ userId: reg.id, action: 'hold' })}
                                                    >
                                                        ⏸ Hold
                                                    </button>
                                                </div>
                                            )}

                                            {reg.approval_reason && (
                                                <div className={styles.reasonBox}>
                                                    <strong>Reason:</strong> {reg.approval_reason}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>All Users</h2>
                                <div className={styles.searchBox}>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or UID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                    />
                                    <button onClick={fetchUsers}>Search</button>
                                </div>
                            </div>

                            {loading ? (
                                <p className={styles.loadingText}>Loading users...</p>
                            ) : (
                                <div className={styles.tableWrapper}>
                                    <table className={styles.usersTable}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Football ID</th>
                                                <th>Paid</th>
                                                <th>Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.name || '—'}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.role || '—'}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${styles[`status_${u.approval_status}`]}`}>
                                                            {u.approval_status}
                                                        </span>
                                                    </td>
                                                    <td>{u.football_id || '—'}</td>
                                                    <td>{u.is_paid ? '✓' : '✕'}</td>
                                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Clubs Tab */}
                    {activeTab === 'clubs' && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Manage Clubs</h2>
                            </div>

                            {user?.is_super_admin && (
                                <div className={styles.settingsCard} style={{ marginBottom: '20px' }}>
                                    <h3>Create New Club</h3>
                                    <p>Fill out the details below to add a new club.</p>
                                    <form onSubmit={handleCreateClub} className={styles.adminForm} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <input
                                            type="text"
                                            placeholder="Club Name"
                                            value={newClub.name}
                                            onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Club Email (Login ID)"
                                            value={newClub.email}
                                            onChange={(e) => setNewClub({ ...newClub, email: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Location (City/Area)"
                                            value={newClub.location}
                                            onChange={(e) => setNewClub({ ...newClub, location: e.target.value })}
                                            required
                                        />
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Club Logo (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                onChange={(e) => setClubLogoFile(e.target.files[0])}
                                                style={{ backgroundColor: 'transparent', padding: '0', border: 'none' }}
                                            />
                                        </div>
                                        <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                                            {loading ? 'Creating...' : '+ Add Club'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className={styles.tableWrapper}>
                                {loading && !clubs.length ? (
                                    <p className={styles.loadingText}>Loading clubs...</p>
                                ) : (
                                    <table className={styles.usersTable}>
                                        <thead>
                                            <tr>
                                                <th>Logo</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Location</th>
                                                <th>Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clubs.map((c) => (
                                                <tr key={c.id}>
                                                    <td>
                                                        {c.logo_url ? (
                                                            <img src={c.logo_url} alt="logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {c.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>{c.name}</td>
                                                    <td>{c.email}</td>
                                                    <td>{c.location}</td>
                                                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {clubs.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center' }}>No clubs found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Chat Tab - Full Implementation */}
                    {activeTab === 'chat' && (
                        <ChatTab session={user} />
                    )}

                    {/* Settings Tab - Super Admin Only */}
                    {activeTab === 'settings' && user?.is_super_admin && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Admin Settings</h2>
                            </div>

                            <div className={styles.settingsCard}>
                                <h3>Create Admin Account</h3>
                                <p>Grant admin access to a user by their email address.</p>
                                <form onSubmit={handleCreateAdmin} className={styles.adminForm}>
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" disabled={loading}>
                                        {loading ? 'Creating...' : 'Grant Admin Access'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}

                    {/* Page Designer Tab - Super Admin Only */}
                    {activeTab === 'designer' && user?.is_super_admin && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Page Designer</h2>
                            </div>
                            <PageDesigner />
                        </section>
                    )}
                </main>

                {/* Action Modal (Reject/Hold with reason) */}
                {actionModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>{actionModal.action === 'reject' ? 'Reject Registration' : 'Put On Hold'}</h3>
                            <p>Please provide a reason for this action:</p>
                            <textarea
                                className={styles.reasonInput}
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Enter reason..."
                                rows={4}
                                required
                            />
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => { setActionModal(null); setActionReason(''); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={actionModal.action === 'reject' ? styles.rejectBtn : styles.holdBtn}
                                    onClick={() => handleAction(actionModal.userId, actionModal.action)}
                                    disabled={!actionReason.trim()}
                                >
                                    Confirm {actionModal.action === 'reject' ? 'Rejection' : 'Hold'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
