import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/Auth.module.css';
import axiosInstance from '@/services/axios';
import { useAuth } from '@/store/AuthContext';

export default function ClubChangePasswordPage() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'club')) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from the current password');
            return;
        }

        setLoading(true);

        try {
            const res = await axiosInstance.post('/api/club/change-password', {
                currentPassword,
                newPassword
            });

            if (res.data.success) {
                setSuccess('Password changed successfully! Redirecting to dashboard...');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

                // Refresh user data so must_change_password is updated
                await refreshUser();

                setTimeout(() => {
                    router.push('/club/dashboard');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className={styles.authContainer}>
                <p style={{ color: '#fff', textAlign: 'center', paddingTop: '3rem' }}>Loading...</p>
            </div>
        );
    }

    const isForced = user.must_change_password;

    return (
        <>
            <Head>
                <title>Change Password — Club Dashboard</title>
            </Head>

            <div className={styles.authContainer}>
                <div className={styles.formsWrapper}>
                    <div className={styles.formsInner}>
                        <form className={`${styles.form} ${styles.loginForm}`} onSubmit={handleSubmit}>
                            <h2>🔑 Change Password</h2>
                            {isForced ? (
                                <p className={styles.subtitle} style={{ color: '#f59e0b' }}>
                                    Your administrator requires you to change your password before continuing.
                                </p>
                            ) : (
                                <p className={styles.subtitle}>Update your club account password</p>
                            )}

                            {error && <div className={styles.errorMessage}>{error}</div>}
                            {success && <div className={styles.successMessage}>{success}</div>}

                            <div className={styles.inputGroup}>
                                <label htmlFor="current-password">Current Password</label>
                                <input
                                    id="current-password"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="new-password">New Password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    placeholder="Enter new password (min 6 chars)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirm-password">Confirm New Password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.primaryBtn}
                                disabled={loading}
                            >
                                {loading && <span className={styles.spinner} />}
                                <span>{loading ? 'Changing...' : 'Change Password'}</span>
                            </button>

                            {!isForced && (
                                <p className={styles.switchText} style={{ marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        className={styles.linkBtn}
                                        onClick={() => router.push('/club/dashboard')}
                                    >
                                        ← Back to Dashboard
                                    </button>
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Side Panel */}
                <div className={styles.sidePanel}>
                    <div className={styles.panelContent}>
                        <h2>Account Security 🛡️</h2>
                        <p>
                            Choose a strong password with at least 6 characters.
                            Use a mix of letters, numbers, and symbols for best security.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
