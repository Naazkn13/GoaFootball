import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/PolicyPages.module.css';

export default function PrivacyPolicy() {
    return (
        <>
            <Head>
                <title>Privacy Policy - Futsalindia</title>
                <meta name="description" content="Privacy Policy for Futsalindia - Learn how we collect, use, and protect your personal information." />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Privacy Policy</h1>
                        <p className={styles.lastUpdated}>Last Updated: December 3, 2024</p>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Introduction</h2>
                        <p className={styles.text}>
                            Welcome to <span className={styles.highlight}>Futsalindia</span>. We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our futsal and football court booking platform.
                        </p>
                        <p className={styles.text}>
                            By using our services, you agree to the collection and use of information in accordance with this policy.
                            If you do not agree with our policies and practices, please do not use our services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Information We Collect</h2>

                        <h3 className={styles.subsectionTitle}>2.1 Personal Information</h3>
                        <p className={styles.text}>We collect personal information that you voluntarily provide to us when you:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Register for an account</li>
                            <li className={styles.listItem}>Make a booking or reservation</li>
                            <li className={styles.listItem}>Process a payment</li>
                            <li className={styles.listItem}>Contact us for support</li>
                            <li className={styles.listItem}>Subscribe to our newsletter or communications</li>
                        </ul>
                        <p className={styles.text}>This information may include:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Name and contact information (email, phone number)</li>
                            <li className={styles.listItem}>Account credentials (username, password)</li>
                            <li className={styles.listItem}>Payment information (processed securely through Razorpay)</li>
                            <li className={styles.listItem}>Booking details and preferences</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>2.2 Automatically Collected Information</h3>
                        <p className={styles.text}>When you access our platform, we automatically collect certain information, including:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Device information (IP address, browser type, operating system)</li>
                            <li className={styles.listItem}>Usage data (pages visited, time spent, features used)</li>
                            <li className={styles.listItem}>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
                        <p className={styles.text}>We use the information we collect for the following purposes:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}><strong>Service Delivery:</strong> To process bookings, manage reservations, and provide customer support</li>
                            <li className={styles.listItem}><strong>Payment Processing:</strong> To facilitate secure payment transactions through our payment gateway partner (Razorpay)</li>
                            <li className={styles.listItem}><strong>Communication:</strong> To send booking confirmations, updates, and important service notifications</li>
                            <li className={styles.listItem}><strong>Improvement:</strong> To analyze usage patterns and improve our platform and services</li>
                            <li className={styles.listItem}><strong>Security:</strong> To protect against fraud, unauthorized access, and other security threats</li>
                            <li className={styles.listItem}><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Payment Information</h2>
                        <p className={styles.text}>
                            All payment transactions are processed through <span className={styles.highlight}>Razorpay</span>, our secure payment gateway partner.
                            We do not store your complete credit card or debit card information on our servers.
                        </p>
                        <p className={styles.text}>
                            Razorpay maintains PCI-DSS compliance and employs industry-standard security measures to protect your payment information.
                            For more details, please refer to Razorpay's Privacy Policy.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Information Sharing and Disclosure</h2>
                        <p className={styles.text}>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}><strong>Service Providers:</strong> With trusted third-party service providers (e.g., payment processors, hosting services) who assist in operating our platform</li>
                            <li className={styles.listItem}><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                            <li className={styles.listItem}><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li className={styles.listItem}><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Data Security</h2>
                        <p className={styles.text}>
                            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access,
                            alteration, disclosure, or destruction. These measures include:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Encryption of sensitive data (SSL/TLS)</li>
                            <li className={styles.listItem}>Secure authentication and access controls</li>
                            <li className={styles.listItem}>Regular security audits and updates</li>
                            <li className={styles.listItem}>Secure payment processing through PCI-DSS compliant partners</li>
                        </ul>
                        <p className={styles.text}>
                            However, no method of transmission over the Internet or electronic storage is 100% secure.
                            While we strive to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Your Privacy Rights</h2>
                        <p className={styles.text}>You have the following rights regarding your personal information:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}><strong>Access:</strong> Request access to the personal information we hold about you</li>
                            <li className={styles.listItem}><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                            <li className={styles.listItem}><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                            <li className={styles.listItem}><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                            <li className={styles.listItem}><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                        </ul>
                        <p className={styles.text}>
                            To exercise these rights, please contact us using the information provided below.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Cookies and Tracking Technologies</h2>
                        <p className={styles.text}>
                            We use cookies and similar tracking technologies to enhance your experience on our platform.
                            Cookies are small data files stored on your device that help us remember your preferences and improve functionality.
                        </p>
                        <p className={styles.text}>
                            You can control cookie settings through your browser preferences. However, disabling cookies may limit certain features of our platform.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>9. Children's Privacy</h2>
                        <p className={styles.text}>
                            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
                            If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>10. Changes to This Privacy Policy</h2>
                        <p className={styles.text}>
                            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                            We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date.
                        </p>
                        <p className={styles.text}>
                            Your continued use of our services after such changes constitutes your acceptance of the updated Privacy Policy.
                        </p>
                    </section>

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Contact Us</h2>
                        <p className={styles.text}>
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Company:</span>
                            <span>Futsalindia</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Email:</span>
                            <a href="mailto:contactus.sksports@gmail.com" className={styles.contactLink}>
                                contactus.sksports@gmail.com
                            </a>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Phone:</span>
                            <a href="tel:+919326394341" className={styles.contactLink}>
                                +91 9326 394341
                            </a>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Address:</span>
                            <span>Andheri West, Mumbai 400053</span>
                        </div>
                    </div>

                    <Link href="/" className={styles.backButton}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </>
    );
}
