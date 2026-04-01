import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';
import { useAuth } from '@/store/AuthContext';
import axiosInstance from '@/services/axios';

export default function Header() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownOpen && !e.target.closest(`.${styles.userMenu}`)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } catch (_) { /* ignore */ }
        window.location.href = '/login';
    };

    // Determine where profile/dashboard links should go
    const getDashboardLink = () => {
        if (user?.is_admin || user?.is_super_admin) return '/admin';
        if (user?.role === 'club') return '/club/dashboard';
        return '/profile';
    };

    const getInitial = () => {
        if (user?.name) return user.name.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return '?';
    };

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
            <div className={styles.navInner}>
                <Link href="/" className={styles.navLogo}>
                    <Image src="/images/logo.png" alt="Goa Football Festival" width={40} height={40} priority className={styles.navLogoImg} />
                    <span>Goa Football Festival</span>
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/about" className={styles.navLink}>About</Link>
                    <Link href="/#roles" className={styles.navLink}>Roles</Link>
                    <Link href="/#how-it-works" className={styles.navLink}>How It Works</Link>

                    {/* Auth-aware CTA */}
                    {authLoading ? (
                        <div className={styles.navCtaPlaceholder} />
                    ) : user ? (
                        <div className={styles.userMenu}>
                            <button
                                className={styles.userMenuBtn}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                aria-label="User menu"
                            >
                                {user.profile_photo_url || user.logo_url ? (
                                    <img
                                        src={user.profile_photo_url || user.logo_url}
                                        alt="Avatar"
                                        className={styles.userAvatar}
                                    />
                                ) : (
                                    <div className={styles.userAvatarFallback}>
                                        {getInitial()}
                                    </div>
                                )}
                                <span className={styles.userName}>{user.name || 'My Account'}</span>
                                <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <span className={styles.dropdownName}>{user.name || 'User'}</span>
                                        <span className={styles.dropdownEmail}>{user.email}</span>
                                    </div>
                                    <div className={styles.dropdownDivider} />
                                    {getDashboardLink() !== router.pathname && (
                                        <Link
                                            href={getDashboardLink()}
                                            className={styles.dropdownItem}
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            {user?.is_admin || user?.is_super_admin
                                                ? '⚙️ Admin Dashboard'
                                                : user?.role === 'club'
                                                ? '🛡️ Club Dashboard'
                                                : '👤 My Profile'}
                                        </Link>
                                    )}
                                    {(user?.is_admin || user?.is_super_admin) && router.pathname !== '/profile' && (
                                        <Link
                                            href="/profile"
                                            className={styles.dropdownItem}
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            👤 My Profile
                                        </Link>
                                    )}
                                    <div className={styles.dropdownDivider} />
                                    <button
                                        className={styles.dropdownLogout}
                                        onClick={handleLogout}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={styles.navCta}>Login / Register</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
