import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/PolicyPages.module.css';

export default function TermsAndConditions() {
    return (
        <>
            <Head>
                <title>Terms & Conditions - Futsalindia</title>
                <meta name="description" content="Terms and Conditions for using Futsalindia's futsal and football court booking services." />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Terms & Conditions</h1>
                        <p className={styles.lastUpdated}>Last Updated: December 3, 2024</p>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
                        <p className={styles.text}>
                            Welcome to <span className={styles.highlight}>Futsalindia</span>. By accessing or using our platform, you agree to be bound by these Terms and Conditions.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                        <p className={styles.text}>
                            These terms constitute a legally binding agreement between you and Futsalindia regarding your use of our futsal and football court booking services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Service Description</h2>
                        <p className={styles.text}>
                            Futsalindia provides an online platform for booking futsal and football courts in Mumbai. Our services include:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Online court booking and reservation system</li>
                            <li className={styles.listItem}>Secure payment processing</li>
                            <li className={styles.listItem}>Booking management and notifications</li>
                            <li className={styles.listItem}>Customer support services</li>
                        </ul>
                        <p className={styles.text}>
                            We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. User Accounts</h2>

                        <h3 className={styles.subsectionTitle}>3.1 Account Registration</h3>
                        <p className={styles.text}>To use our booking services, you must create an account by providing accurate and complete information. You agree to:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Provide truthful, accurate, and current information</li>
                            <li className={styles.listItem}>Maintain and update your account information</li>
                            <li className={styles.listItem}>Keep your password secure and confidential</li>
                            <li className={styles.listItem}>Notify us immediately of any unauthorized access</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>3.2 Account Responsibility</h3>
                        <p className={styles.text}>
                            You are responsible for all activities that occur under your account. You must be at least 18 years old to create an account and use our services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Booking and Reservations</h2>

                        <h3 className={styles.subsectionTitle}>4.1 Booking Process</h3>
                        <p className={styles.text}>
                            When you make a booking through our platform:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>You must provide accurate booking details (date, time, court type)</li>
                            <li className={styles.listItem}>Bookings are subject to availability</li>
                            <li className={styles.listItem}>You will receive a confirmation via email/SMS upon successful booking</li>
                            <li className={styles.listItem}>Payment must be completed to confirm your reservation</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>4.2 Booking Confirmation</h3>
                        <p className={styles.text}>
                            A booking is only confirmed once payment has been successfully processed and you receive a confirmation notification.
                            We are not responsible for bookings that fail due to payment issues or technical errors.
                        </p>

                        <h3 className={styles.subsectionTitle}>4.3 Modifications and Cancellations</h3>
                        <p className={styles.text}>
                            Booking modifications and cancellations are subject to our Refund Policy. Please refer to our
                            <Link href="/refund-policy"> Refund Policy </Link> for detailed information on cancellation terms and refund eligibility.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Payment Terms</h2>

                        <h3 className={styles.subsectionTitle}>5.1 Pricing</h3>
                        <p className={styles.text}>
                            All prices are displayed in Indian Rupees (INR) and include applicable taxes unless otherwise stated.
                            We reserve the right to change our pricing at any time without prior notice.
                        </p>

                        <h3 className={styles.subsectionTitle}>5.2 Payment Methods</h3>
                        <p className={styles.text}>
                            We accept payments through our secure payment gateway partner, <span className={styles.highlight}>Razorpay</span>.
                            Accepted payment methods include:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Credit and Debit Cards (Visa, Mastercard, RuPay)</li>
                            <li className={styles.listItem}>Net Banking</li>
                            <li className={styles.listItem}>UPI (Unified Payments Interface)</li>
                            <li className={styles.listItem}>Digital Wallets</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>5.3 Payment Security</h3>
                        <p className={styles.text}>
                            All payment transactions are processed securely through Razorpay's PCI-DSS compliant infrastructure.
                            We do not store your complete payment card information on our servers.
                        </p>

                        <h3 className={styles.subsectionTitle}>5.4 Payment Failures</h3>
                        <p className={styles.text}>
                            If a payment fails, your booking will not be confirmed. You may retry the payment or contact our support team for assistance.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. User Conduct</h2>
                        <p className={styles.text}>You agree not to:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Use our services for any illegal or unauthorized purpose</li>
                            <li className={styles.listItem}>Violate any laws or regulations in your jurisdiction</li>
                            <li className={styles.listItem}>Infringe upon the rights of others</li>
                            <li className={styles.listItem}>Transmit any harmful code, viruses, or malicious software</li>
                            <li className={styles.listItem}>Attempt to gain unauthorized access to our systems</li>
                            <li className={styles.listItem}>Interfere with the proper functioning of our platform</li>
                            <li className={styles.listItem}>Make fraudulent bookings or payments</li>
                            <li className={styles.listItem}>Impersonate any person or entity</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Facility Rules</h2>
                        <p className={styles.text}>When using our futsal/football courts, you must:</p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Arrive on time for your booking</li>
                            <li className={styles.listItem}>Follow all facility rules and regulations</li>
                            <li className={styles.listItem}>Use appropriate sports attire and footwear</li>
                            <li className={styles.listItem}>Respect other users and facility staff</li>
                            <li className={styles.listItem}>Take responsibility for any damage caused by you or your group</li>
                            <li className={styles.listItem}>Vacate the court promptly at the end of your booking time</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Liability and Disclaimers</h2>

                        <h3 className={styles.subsectionTitle}>8.1 Service Availability</h3>
                        <p className={styles.text}>
                            We strive to maintain uninterrupted service availability but do not guarantee that our platform will be error-free or continuously available.
                            We are not liable for any service interruptions, technical issues, or downtime.
                        </p>

                        <h3 className={styles.subsectionTitle}>8.2 Limitation of Liability</h3>
                        <p className={styles.text}>
                            To the maximum extent permitted by law, Futsalindia shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages arising from your use of our services, including but not limited to:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Loss of profits or revenue</li>
                            <li className={styles.listItem}>Loss of data or information</li>
                            <li className={styles.listItem}>Personal injury or property damage</li>
                            <li className={styles.listItem}>Business interruption</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>8.3 Assumption of Risk</h3>
                        <p className={styles.text}>
                            You acknowledge that sports activities involve inherent risks of injury. By using our facilities, you assume all risks associated with
                            participation in sports activities and agree to hold Futsalindia harmless from any injuries or damages.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>9. Intellectual Property</h2>
                        <p className={styles.text}>
                            All content on our platform, including text, graphics, logos, images, and software, is the property of Futsalindia or its licensors
                            and is protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>10. Privacy</h2>
                        <p className={styles.text}>
                            Your use of our services is also governed by our Privacy Policy. Please review our
                            <Link href="/privacy-policy"> Privacy Policy </Link> to understand how we collect, use, and protect your personal information.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>11. Termination</h2>
                        <p className={styles.text}>
                            We reserve the right to suspend or terminate your account and access to our services at any time, without prior notice,
                            for any reason, including but not limited to:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Violation of these Terms and Conditions</li>
                            <li className={styles.listItem}>Fraudulent or illegal activity</li>
                            <li className={styles.listItem}>Abusive behavior towards staff or other users</li>
                            <li className={styles.listItem}>Non-payment or payment disputes</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>12. Governing Law</h2>
                        <p className={styles.text}>
                            These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
                            Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>13. Changes to Terms</h2>
                        <p className={styles.text}>
                            We reserve the right to modify these Terms and Conditions at any time. We will notify you of any material changes by
                            posting the updated terms on our website and updating the "Last Updated" date.
                        </p>
                        <p className={styles.text}>
                            Your continued use of our services after such changes constitutes your acceptance of the updated Terms and Conditions.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>14. Severability</h2>
                        <p className={styles.text}>
                            If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                        </p>
                    </section>

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Contact Us</h2>
                        <p className={styles.text}>
                            If you have any questions or concerns about these Terms and Conditions, please contact us:
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
