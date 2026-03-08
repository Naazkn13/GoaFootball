import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Header.module.css';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check state on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                    <Link href="/login" className={styles.navCta}>Login / Register</Link>
                </div>
            </div>
        </nav>
    );
}
