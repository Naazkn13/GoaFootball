import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/Admin.module.css';
import axiosInstance from '@/services/axios';
import { useAuth } from '@/store/AuthContext';
import ChatTab from '@/components/ChatTab';
import PageDesigner from '@/components/PageDesigner';
import { toastSuccess, toastError, confirmAction } from '@/utils/toast';

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
    const [editUserModal, setEditUserModal] = useState(null);
    const [editUserModalUpdates, setEditUserModalUpdates] = useState({});
    const [actionReason, setActionReason] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newSuperadminPassword, setNewSuperadminPassword] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, on_hold: 0, inactive: 0 });
    const [clubs, setClubs] = useState([]);
    const [editingClub, setEditingClub] = useState(null);
    const [newClub, setNewClub] = useState({ name: '', email: '', location: '', logo_url: '', password: '' });
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
                if (user?.is_super_admin) fetchClubs();
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
                const resp = await axiosInstance.get(`/api/admin/users?status=${s}`);
                results[s] = resp.data.count || 0;
            }
            const inactiveResp = await axiosInstance.get('/api/admin/users?inactive=true');
            results.inactive = inactiveResp.data.count || 0;
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

    const handleSaveClub = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let logo_url = editingClub ? editingClub.logo_url : '';
            if (clubLogoFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', clubLogoFile);
                formDataUpload.append('documentType', 'photo');
                const uploadRes = await axiosInstance.post('/api/user/upload-document', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                logo_url = uploadRes.data.url;
            }

            if (editingClub) {
                await axiosInstance.put('/api/admin/clubs', {
                    id: editingClub.id,
                    name: newClub.name,
                    email: newClub.email,
                    location: newClub.location,
                    logo_url,
                });
                toastSuccess(`Club ${newClub.name} updated successfully`);
                setEditingClub(null);
            } else {
                await axiosInstance.post('/api/admin/clubs', {
                    name: newClub.name,
                    email: newClub.email,
                    location: newClub.location,
                    password: newClub.password,
                    logo_url,
                });
                toastSuccess(`Club ${newClub.name} created successfully`);
            }

            setNewClub({ name: '', email: '', location: '', logo_url: '', password: '' });
            setClubLogoFile(null);
            fetchClubs();
        } catch (err) {
            toastError(err.response?.data?.message || `Failed to ${editingClub ? 'update' : 'create'} club`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClubClick = (club) => {
        setEditingClub(club);
        setNewClub({
            name: club.name,
            email: club.email,
            location: club.location,
            logo_url: club.logo_url || '',
            password: '' // Explicitly wiped
        });
        setClubLogoFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditClub = () => {
        setEditingClub(null);
        setNewClub({ name: '', email: '', location: '', logo_url: '', password: '' });
        setClubLogoFile(null);
    };

    const handleDeleteClub = async (clubId, clubName) => {
        if (!user?.is_super_admin) return;

        const confirmed = await confirmAction(
            `Delete Club: ${clubName}?`,
            `This can only succeed if ALL players in this club have been inactivated first. This action cannot be undone.`
        );

        if (confirmed) {
            setLoading(true);
            try {
                const res = await axiosInstance.delete(`/api/admin/clubs?id=${clubId}`);
                if (res.data.success) {
                    toastSuccess(`Club "${clubName}" deleted successfully`);
                    fetchClubs();
                }
            } catch (err) {
                toastError(err.response?.data?.message || 'Failed to delete club');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!user?.is_super_admin) return;

        const confirmed = await confirmAction(
            `Delete user: ${userName || 'No Name'}?`,
            `Are you sure you want to completely delete this user? This action cannot be undone.`
        );

        if (confirmed) {
            setLoading(true);
            try {
                const res = await axiosInstance.delete(`/api/admin/delete-user?id=${userId}`);
                if (res.data.success) {
                    toastSuccess('User deleted successfully');
                    if (activeTab === 'users') fetchUsers();
                    else if (activeTab === 'registrations') fetchRegistrations();
                }
            } catch (err) {
                toastError(err.response?.data?.message || 'Failed to delete user');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditUserClick = (u) => {
        setEditUserModal(u);
        setEditUserModalUpdates({
            first_name: u.first_name || (u.name ? u.name.split(' ')[0] : ''),
            last_name: u.last_name || (u.name ? u.name.split(' ').slice(1).join(' ') : ''),
            phone: u.phone || '',
            date_of_birth: u.date_of_birth && !isNaN(new Date(u.date_of_birth)) ? new Date(u.date_of_birth).toISOString().split('T')[0] : '',
            gender: u.gender ? u.gender.toLowerCase() : '',
            football_id: u.football_id || '',
            role: u.role || '',
            club_id: u.club_id || ''
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.put('/api/admin/edit-user', {
                userId: editUserModal.id,
                updates: editUserModalUpdates
            });
            if (res.data.success) {
                toastSuccess('User updated successfully');
                setEditUserModal(null);
                fetchUsers();
            }
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePlayerStatus = async (userId, userName, currentlyActive) => {
        if (!user?.is_super_admin) return;
        const newStatus = !currentlyActive;
        const action = newStatus ? 'activate' : 'inactivate';

        const confirmed = await confirmAction(
            `${newStatus ? 'Activate' : 'Inactivate'} User`,
            `Are you sure you want to ${action} ${userName || 'No Name'}?`
        );

        if (confirmed) {
            setLoading(true);
            try {
                const res = await axiosInstance.put('/api/admin/toggle-player-status', {
                    userId,
                    is_active: newStatus
                });
                if (res.data.success) {
                    toastSuccess(`User ${action}d successfully`);
                    if (activeTab === 'users') fetchUsers();
                    else if (activeTab === 'registrations') fetchRegistrations();
                }
            } catch (err) {
                toastError(err.response?.data?.message || `Failed to ${action} user`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAction = async (userId, action) => {
        if ((action === 'reject' || action === 'hold') && !actionReason) {
            toastError('Reason is required for rejection/hold');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/api/admin/approve', {
                userId,
                action,
                reason: actionReason,
            });

            toastSuccess(`User ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'put on hold'} successfully`);
            setActionModal(null);
            setActionReason('');
            fetchRegistrations();
            fetchStats();
        } catch (err) {
            toastError(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/api/admin/create-admin', { email: newAdminEmail });
            toastSuccess(`${newAdminEmail} has been granted admin access`);
            setNewAdminEmail('');
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const handleSetSuperadminPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/api/admin/set-password', { newPassword: newSuperadminPassword });
            toastSuccess(`Superadmin password successfully updated`);
            setNewSuperadminPassword('');
        } catch (err) {
            toastError(err.response?.data?.message || 'Failed to update superadmin password');
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
                        {user?.is_super_admin && (
                            <button
                                className={`${styles.navBtn} ${activeTab === 'clubs' ? styles.navBtnActive : ''}`}
                                onClick={() => setActiveTab('clubs')}
                            >
                                🛡️ Clubs
                            </button>
                        )}
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
                        <div className={`${styles.statCard} ${styles.statInactive}`}>
                            <span className={styles.statNumber}>{stats.inactive}</span>
                            <span className={styles.statLabel}>Inactive</span>
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
                                    {['pending', 'approved', 'rejected', 'on_hold', 'inactive'].map((s) => (
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
                                                <div className={styles.regAvatar} style={{ padding: reg.profile_photo_url ? 0 : '', overflow: 'hidden' }}>
                                                    {reg.profile_photo_url ? (
                                                        <img src={reg.profile_photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        reg.name ? reg.name.charAt(0).toUpperCase() : '?'
                                                    )}
                                                </div>
                                                <div className={styles.regInfo}>
                                                    <h3>
                                                        {reg.name || 'No Name'}
                                                        {reg.club_flag_reason && (
                                                            <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
                                                                🚩 Flagged by Club: {reg.club_flag_reason}
                                                            </div>
                                                        )}
                                                    </h3>
                                                    <p>{reg.email}</p>
                                                    <p className={styles.regRole}>
                                                        {reg.role || 'N/A'} {reg.clubs?.name && <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '6px' }}>(Club: {reg.clubs.name})</span>}
                                                    </p>
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
                                                        <strong>Address:</strong> {reg.address.line1 === 'Same as proof' 
                                                            ? 'Same as proof' 
                                                            : `${reg.address.line1 || ''}, ${reg.address.city || ''}, ${reg.address.state || ''}`}
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
                                                <th>Photo</th>
                                                <th>Name / Club</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Football ID</th>
                                                <th>Paid</th>
                                                <th>Joined</th>
                                                <th>Active</th>
                                                {user?.is_super_admin && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id} style={{
                                                    backgroundColor: (u.is_active === false) ? '#f3f4f6' : (u.club_flag_reason ? '#fef2f2' : 'transparent'),
                                                    opacity: (u.is_active === false) ? 0.6 : 1
                                                }}>
                                                    <td>
                                                        {u.profile_photo_url ? (
                                                            <img src={u.profile_photo_url} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {u.name || '—'}
                                                        {u.clubs?.name && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{u.clubs.name}</div>}
                                                        {u.club_flag_reason && (
                                                            <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold' }}>
                                                                🚩 Flagged: {u.club_flag_reason}
                                                            </div>
                                                        )}
                                                    </td>
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
                                                    <td>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '4px 12px',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            backgroundColor: (u.is_active !== false) ? '#dcfce7' : '#fee2e2',
                                                            color: (u.is_active !== false) ? '#166534' : '#991b1b',
                                                        }}>
                                                            {(u.is_active !== false) ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {user?.is_super_admin && (
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            <button
                                                                onClick={() => handleTogglePlayerStatus(u.id, u.name, u.is_active !== false)}
                                                                style={{
                                                                    backgroundColor: (u.is_active !== false) ? '#f59e0b' : '#10b981',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    cursor: (u.is_admin || u.is_super_admin) ? 'not-allowed' : 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    marginRight: '4px',
                                                                    opacity: (u.is_admin || u.is_super_admin) ? 0.3 : 1,
                                                                }}
                                                                disabled={u.is_admin || u.is_super_admin}
                                                                title={(u.is_active !== false) ? 'Inactivate User' : 'Activate User'}
                                                            >
                                                                {(u.is_active !== false) ? '⏸ Inactivate' : '▶ Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditUserClick(u)}
                                                                style={{
                                                                    backgroundColor: '#3b82f6',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    marginRight: '4px',
                                                                }}
                                                                title="Edit User"
                                                            >
                                                                ✎ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                                style={{
                                                                    backgroundColor: '#dc2626',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    cursor: (u.id === user.id || u.is_super_admin) ? 'not-allowed' : 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    opacity: (u.id === user.id || u.is_super_admin) ? 0.3 : 1,
                                                                }}
                                                                disabled={u.id === user.id || u.is_super_admin}
                                                                title={u.id === user.id ? "Cannot delete yourself" : (u.is_super_admin ? "Cannot delete another Super Admin" : "Delete User")}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    )}
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

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '24px', alignItems: 'start' }}>
                                {/* Left Side Form */}
                                {user?.is_super_admin && (
                                    <div className={styles.settingsCard} style={{ position: 'sticky', top: '20px', marginBottom: 0 }}>
                                        <h3 style={{ marginTop: '0' }}>{editingClub ? 'Update Club' : 'Create New Club'}</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>
                                            {editingClub ? 'Modify the details for this club.' : 'Fill out the details below to add a new club.'}
                                        </p>
                                        <form onSubmit={handleSaveClub} className={styles.adminForm} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                                            {!editingClub && (
                                                <input
                                                    type="password"
                                                    placeholder="Initial Password for Club (min 6 chars)"
                                                    value={newClub.password}
                                                    onChange={(e) => setNewClub({ ...newClub, password: e.target.value })}
                                                    required
                                                    minLength={6}
                                                />
                                            )}
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Club Logo (Optional)</label>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    onChange={(e) => setClubLogoFile(e.target.files[0])}
                                                    style={{ backgroundColor: 'transparent', padding: '0', border: 'none' }}
                                                />
                                                {editingClub && editingClub.logo_url && !clubLogoFile && (
                                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#666' }}>Current logo retained if empty</div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', fontWeight: 'bold' }}>
                                                    {loading ? 'Saving...' : (editingClub ? 'Update Club' : '+ Add Club')}
                                                </button>
                                                {editingClub && (
                                                    <button type="button" onClick={cancelEditClub} disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Right Side Table */}
                                <div className={styles.tableWrapper} style={{ marginTop: 0, height: '100%' }}>
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
                                                <th>Players</th>
                                                <th>Actions</th>
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
                                                    <td>
                                                        <span style={{
                                                            backgroundColor: (c.active_player_count > 0) ? '#dbeafe' : '#f3f4f6',
                                                            color: (c.active_player_count > 0) ? '#1d4ed8' : '#6b7280',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {c.active_player_count ?? '—'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleEditClubClick(c)}
                                                                style={{
                                                                    backgroundColor: '#f3f4f6',
                                                                    color: '#374151',
                                                                    border: '1px solid #d1d5db',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                ✎ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClub(c.id, c.name)}
                                                                style={{
                                                                    backgroundColor: '#dc2626',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                🗑 Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {clubs.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center' }}>No clubs found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
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

                            <div className={styles.settingsCard} style={{ marginTop: '20px' }}>
                                <h3>Super Admin Security</h3>
                                <p>Set or change your Super Admin password to enable secure email/password logins.</p>
                                <form onSubmit={handleSetSuperadminPassword} className={styles.adminForm}>
                                    <input
                                        type="password"
                                        placeholder="Enter new password (min 6 characters)"
                                        value={newSuperadminPassword}
                                        onChange={(e) => setNewSuperadminPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button type="submit" disabled={loading}>
                                        {loading ? 'Saving...' : 'Set / Update Password'}
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

                {/* Edit User Modal */}
                {editUserModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0 }}>Edit User Profile</h3>
                                <button onClick={() => setEditUserModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>
                            
                            <form onSubmit={handleUpdateUser} className={styles.adminForm} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>First Name</label>
                                        <input
                                            type="text"
                                            value={editUserModalUpdates.first_name}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, first_name: e.target.value})}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Last Name</label>
                                        <input
                                            type="text"
                                            value={editUserModalUpdates.last_name}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, last_name: e.target.value})}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={editUserModalUpdates.phone}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, phone: e.target.value})}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editUserModalUpdates.date_of_birth}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, date_of_birth: e.target.value})}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Gender</label>
                                        <select
                                            value={editUserModalUpdates.gender}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, gender: e.target.value})}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Football ID</label>
                                        <input
                                            type="text"
                                            value={editUserModalUpdates.football_id}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, football_id: e.target.value})}
                                            disabled
                                            style={{ width: '100%', backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Role</label>
                                        <select
                                            value={editUserModalUpdates.role}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, role: e.target.value})}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="athlete">Athlete</option>
                                            <option value="coach">Coach</option>
                                            <option value="referee">Referee</option>
                                            <option value="club-manager">Club Manager</option>
                                            <option value="club-official">Club Official</option>
                                            <option value="fan">Fan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Club (Transfer)</label>
                                        <select
                                            value={editUserModalUpdates.club_id || ''}
                                            onChange={(e) => setEditUserModalUpdates({...editUserModalUpdates, club_id: e.target.value})}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                        >
                                            <option value="">No Club (Independent)</option>
                                            {clubs.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    <strong>Note:</strong> Email ({editUserModal.email}) cannot be edited for security reasons. Documents must be updated by the user directly.
                                </div>

                                <div className={styles.modalActions} style={{ marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => setEditUserModal(null)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            backgroundColor: '#1d4ed8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes & Notify'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
