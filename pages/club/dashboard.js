import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/Admin.module.css'; // Reusing admin styles
import axiosInstance from '@/services/axios';
import { useAuth } from '@/store/AuthContext';

export default function ClubDashboard() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();

    const [players, setPlayers] = useState([]);
    const [activeTab, setActiveTab] = useState('players');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [flagModal, setFlagModal] = useState({ isOpen: false, player: null, reason: '' });

    // Change password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'club') {
                router.push('/');
            } else if (user.must_change_password) {
                router.push('/club/change-password');
            }
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user?.role === 'club') {
            fetchPlayers();
        }
    }, [user]);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/club/players');
            setPlayers(response.data.players || []);
        } catch (err) {
            setError('Failed to fetch players');
        } finally {
            setLoading(false);
        }
    };

    const handleFlagSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.put('/api/club/flag-player', {
                playerId: flagModal.player.id,
                reason: flagModal.reason.trim()
            });
            if (res.data.success) {
                // Instantly update local state
                setPlayers(players.map(p =>
                    p.id === flagModal.player.id ? { ...p, club_flag_reason: flagModal.reason.trim() || null } : p
                ));
                setFlagModal({ isOpen: false, player: null, reason: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update flag');
        }
    };

    if (authLoading || user?.role !== 'club') {
        return (
            <div className={styles.adminContainer}>
                <p style={{ color: '#fff', textAlign: 'center', paddingTop: '3rem' }}>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Club Dashboard — Football Registration</title>
            </Head>

            <div className={styles.adminContainer}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        {user.logo_url && <img src={user.logo_url} alt="Club Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
                        <h2 style={{ fontSize: '1.2rem', textAlign: 'center' }}>{user.name}</h2>
                    </div>
                    <nav className={styles.sidebarNav} style={{ marginTop: '20px' }}>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'players' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('players')}
                        >
                            👥 My Players
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'profile' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            🏠 My Profile
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'changePassword' ? styles.navBtnActive : ''}`}
                            onClick={() => setActiveTab('changePassword')}
                        >
                            🔑 Change Password
                        </button>
                    </nav>
                    <button className={styles.backBtn} onClick={async () => {
                        await axiosInstance.post('/api/auth/logout');
                        window.location.href = '/login';
                    }}>
                        🚪 Logout
                    </button>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {/* My Profile Tab */}
                    {activeTab === 'profile' && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Club Profile</h2>
                            </div>
                            <div className={styles.settingsCard} style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px' }}>
                                    {user.logo_url ? (
                                        <img src={user.logo_url} alt="Club Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }} />
                                    ) : (
                                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: 'bold' }}>
                                            {user.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a1a' }}>{user.name}</h2>
                                        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.95rem' }}>Club Account</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                                        <p style={{ margin: '6px 0 0', fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>{user.email}</p>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</p>
                                        <p style={{ margin: '6px 0 0', fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>{user.location || '—'}</p>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Players</p>
                                        <p style={{ margin: '6px 0 0', fontSize: '1.2rem', color: '#1a56db', fontWeight: '700' }}>{players.length}</p>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Club ID</p>
                                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#1a1a1a', fontWeight: '500', fontFamily: 'monospace' }}>{user.id}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Players Tab */}
                    {activeTab === 'players' && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Registered Players</h2>
                            </div>

                            {error && <div className={styles.errorMsg}>{error}</div>}

                            <div className={styles.tableWrapper}>
                                {loading ? (
                                    <p className={styles.loadingText}>Loading players...</p>
                                ) : (
                                    <table className={styles.usersTable}>
                                        <thead>
                                            <tr>
                                                <th>Photo</th>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Football ID</th>
                                                <th>Phone</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.map((p) => (
                                                <tr key={p.id} style={{ backgroundColor: p.club_flag_reason ? '#fef2f2' : 'transparent' }}>
                                                    <td>
                                                        {p.profile_photo_url ? (
                                                            <img src={p.profile_photo_url} alt="Photo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {p.name || '—'}
                                                        {p.club_flag_reason && (
                                                            <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold' }}>
                                                                🚩 Flagged: {p.club_flag_reason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ textTransform: 'capitalize' }}>{p.role || '—'}</td>
                                                    <td>{p.football_id || '—'}</td>
                                                    <td>{p.phone || '—'}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${styles[`status_${p.approval_status}`]}`}>
                                                            {p.approval_status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => setFlagModal({ isOpen: true, player: p, reason: p.club_flag_reason || '' })}
                                                            style={{
                                                                background: p.club_flag_reason ? '#dc2626' : '#fff',
                                                                color: p.club_flag_reason ? '#fff' : '#dc2626',
                                                                border: '1px solid #dc2626',
                                                                padding: '4px 8px', borderRadius: '4px',
                                                                cursor: 'pointer', fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {p.club_flag_reason ? 'Update Flag' : '🚩 Flag'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {players.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                                        No players registered under your club yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Change Password Tab */}
                    {activeTab === 'changePassword' && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Change Password</h2>
                            </div>
                            <div className={styles.settingsCard} style={{ padding: '30px', maxWidth: '500px' }}>
                                {pwdError && <div className={styles.errorMsg} style={{ marginBottom: '15px' }}>{pwdError}</div>}
                                {pwdSuccess && <div className={styles.successMsg} style={{ marginBottom: '15px' }}>{pwdSuccess}</div>}
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setPwdError('');
                                    setPwdSuccess('');
                                    if (newPassword.length < 6) { setPwdError('New password must be at least 6 characters'); return; }
                                    if (newPassword !== confirmPassword) { setPwdError('Passwords do not match'); return; }
                                    if (currentPassword === newPassword) { setPwdError('New password must be different'); return; }
                                    setPwdLoading(true);
                                    try {
                                        const res = await axiosInstance.post('/api/club/change-password', { currentPassword, newPassword });
                                        if (res.data.success) {
                                            setPwdSuccess('Password changed successfully!');
                                            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                                            await refreshUser();
                                        }
                                    } catch (err) {
                                        setPwdError(err.response?.data?.message || 'Failed to change password');
                                    } finally {
                                        setPwdLoading(false);
                                    }
                                }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#374151' }}>Current Password</label>
                                        <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#374151' }}>New Password</label>
                                        <input type="password" placeholder="Enter new password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#374151' }}>Confirm New Password</label>
                                        <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <button type="submit" disabled={pwdLoading} style={{ alignSelf: 'flex-start', backgroundColor: '#1a56db', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        {pwdLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* Flag Modal */}
            {flagModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0, color: '#111827' }}>🚩 Flag Player</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                            Flagging <strong>{flagModal.player?.name}</strong>. If this player does not belong to your club or is suspended, provide a reason below.
                        </p>
                        <form onSubmit={handleFlagSubmit}>
                            <textarea
                                value={flagModal.reason}
                                onChange={(e) => setFlagModal({ ...flagModal, reason: e.target.value })}
                                placeholder="E.g., Not my player, Suspended, etc. (Leave blank to remove flag)"
                                rows={3}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '16px', resize: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setFlagModal({ isOpen: false, player: null, reason: '' })}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    {flagModal.reason.trim() ? 'Submit Flag' : 'Remove Flag'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
