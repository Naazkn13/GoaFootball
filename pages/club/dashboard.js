import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/Admin.module.css'; // Reusing admin styles
import axiosInstance from '@/services/axios';
import { useAuth } from '@/store/AuthContext';

export default function ClubDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && user?.role !== 'club') {
            router.push('/');
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
                        <button className={`${styles.navBtn} ${styles.navBtnActive}`}>
                            👥 My Players
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
                    <section>
                        <div className={styles.sectionHeader}>
                            <h2>Registered Players</h2>
                            <button
                                onClick={() => router.push(`/register?club_id=${user.id}&club_name=${encodeURIComponent(user.name)}`)}
                                style={{
                                    backgroundColor: '#10b981', color: '#fff', border: 'none',
                                    padding: '10px 20px', borderRadius: '5px', cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                + Add Player
                            </button>
                        </div>

                        {error && <div className={styles.errorMsg}>{error}</div>}

                        <div className={styles.tableWrapper}>
                            {loading ? (
                                <p className={styles.loadingText}>Loading players...</p>
                            ) : (
                                <table className={styles.usersTable}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Football ID</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.name || '—'}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{p.role || '—'}</td>
                                                <td>{p.football_id || '—'}</td>
                                                <td>{p.phone || '—'}</td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[`status_${p.approval_status}`]}`}>
                                                        {p.approval_status || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {players.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                                    No players registered under your club yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
