import Link from 'next/link';
import styles from '../styles/Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerGrid}>

                    {/* Quick Links */}
                    <div className={styles.footerSection}>
                        <h3 className={styles.footerTitle}>Quick Links</h3>
                        <ul className={styles.footerLinks}>
                            <li className={styles.footerLink}>
                                <Link href="/about">About Us</Link>
                            </li>
                            <li className={styles.footerLink}>
                                <Link href="/contact">Contact Us</Link>
                            </li>
                            <li className={styles.footerLink}>
                                <Link href="/profile">My Profile</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className={styles.footerSection}>
                        <h3 className={styles.footerTitle}>Legal</h3>
                        <ul className={styles.footerLinks}>
                            <li className={styles.footerLink}>
                                <Link href="/privacy-policy">Privacy Policy</Link>
                            </li>
                            <li className={styles.footerLink}>
                                <Link href="/terms-and-conditions">Terms & Conditions</Link>
                            </li>
                            <li className={styles.footerLink}>
                                <Link href="/refund-policy">Refund Policy</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.footerSection}>
                        <h3 className={styles.footerTitle}>Contact</h3>
                        <p className={styles.footerText}>
                            <strong>Email:</strong><br />
                            <a href="mailto:contactus.sksports@gmail.com" className={styles.footerText}>
                                contactus.sksports@gmail.com
                            </a>
                        </p>
                        <p className={styles.footerText}>
                            <strong>Phone:</strong><br />
                            <a href="tel:+919326394341" className={styles.footerText}>
                                +91 9326 394341
                            </a>
                        </p>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} <span className={styles.brandName}>Goa Football Festival</span>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
