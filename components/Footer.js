import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Footer.module.css';

const DEFAULTS = {
    email: 'contactus.sksports@gmail.com',
    phone: '+91 9326 394341',
    company_name: 'Goa Football Festival',
};

export default function Footer() {
    const [contact, setContact] = useState(DEFAULTS);

    useEffect(() => {
        fetch('/api/site-content/footer')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.content?.contact) {
                    setContact({ ...DEFAULTS, ...data.content.contact });
                }
            })
            .catch(() => { });
    }, []);

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
                            <a href={`mailto:${contact.email}`} className={styles.footerText}>
                                {contact.email}
                            </a>
                        </p>
                        <p className={styles.footerText}>
                            <strong>Phone:</strong><br />
                            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={styles.footerText}>
                                {contact.phone}
                            </a>
                        </p>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} <span className={styles.brandName}>{contact.company_name}</span>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
