import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/PolicyPages.module.css';

export default function RefundPolicy() {
    return (
        <>
            <Head>
                <title>Refund & Cancellation Policy - Futsalindia</title>
                <meta name="description" content="Refund and Cancellation Policy for Futsalindia court bookings." />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Refund & Cancellation Policy</h1>
                        <p className={styles.lastUpdated}>Last Updated: December 3, 2024</p>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Overview</h2>
                        <p className={styles.text}>
                            At <span className={styles.highlight}>Futsalindia</span>, we operate a strict no-refund policy.
                            All payments made for court bookings are <strong>final and non-refundable</strong>.
                        </p>
                        <p className={styles.text}>
                            Please read this policy carefully before making a booking. By completing a booking and payment,
                            you acknowledge and agree to these terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. No Refund Policy</h2>

                        <h3 className={styles.subsectionTitle}>2.1 All Sales Are Final</h3>
                        <p className={styles.text}>
                            <strong>Once payment is completed, no refunds will be issued under any circumstances.</strong> This includes but is not limited to:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Cancellations made by the customer</li>
                            <li className={styles.listItem}>Changes in personal plans or schedules</li>
                            <li className={styles.listItem}>Inability to attend the booked session</li>
                            <li className={styles.listItem}>Weather conditions (unless facility is officially closed)</li>
                            <li className={styles.listItem}>Personal emergencies or medical issues</li>
                            <li className={styles.listItem}>No-show (failure to arrive at the booked time)</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>2.2 Payment Confirmation</h3>
                        <p className={styles.text}>
                            By completing your payment through our platform, you confirm that:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>You have verified the booking details (date, time, court type)</li>
                            <li className={styles.listItem}>You understand and accept the no-refund policy</li>
                            <li className={styles.listItem}>You agree that all payments are final and non-refundable</li>
                            <li className={styles.listItem}>You will not dispute or chargeback the transaction</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Cancellation Policy</h2>

                        <h3 className={styles.subsectionTitle}>3.1 Customer Cancellations</h3>
                        <p className={styles.text}>
                            While you may cancel your booking at any time, <strong>no refund will be provided</strong> regardless of when the cancellation is made.
                        </p>
                        <p className={styles.text}>
                            Cancellations can be made through:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Your account dashboard under &quot;My Bookings&quot;</li>
                            <li className={styles.listItem}>Contacting our customer support team</li>
                        </ul>
                        <p className={styles.text}>
                            However, please note that canceling your booking does not entitle you to any refund.
                        </p>

                        <h3 className={styles.subsectionTitle}>3.2 No-Show Policy</h3>
                        <p className={styles.text}>
                            If you fail to arrive for your booked session (no-show), your booking will be forfeited and no refund will be issued.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Rescheduling</h2>

                        <h3 className={styles.subsectionTitle}>4.1 Rescheduling Requests</h3>
                        <p className={styles.text}>
                            Rescheduling of bookings may be considered on a case-by-case basis, subject to availability and at the sole discretion of Futsalindia.
                        </p>
                        <p className={styles.text}>
                            To request a reschedule:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Contact our support team at least 24 hours before your booking</li>
                            <li className={styles.listItem}>Provide your booking ID and preferred new date/time</li>
                            <li className={styles.listItem}>Wait for confirmation from our team</li>
                        </ul>
                        <p className={styles.text}>
                            <strong>Important:</strong> Rescheduling is not guaranteed and depends on court availability.
                            No refunds will be issued if rescheduling is not possible.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Cancellations by Futsalindia</h2>

                        <h3 className={styles.subsectionTitle}>5.1 Facility Closure or Force Majeure</h3>
                        <p className={styles.text}>
                            In rare circumstances where Futsalindia must cancel your booking due to:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Facility maintenance emergencies</li>
                            <li className={styles.listItem}>Government-mandated closures or restrictions</li>
                            <li className={styles.listItem}>Severe weather conditions making the facility unsafe</li>
                            <li className={styles.listItem}>Natural disasters or force majeure events</li>
                            <li className={styles.listItem}>Technical failures beyond our control</li>
                        </ul>
                        <p className={styles.text}>
                            In such cases, you will receive a <span className={styles.highlight}>full refund (100%)</span> of your booking amount.
                        </p>

                        <h3 className={styles.subsectionTitle}>5.2 Notification</h3>
                        <p className={styles.text}>
                            If we need to cancel your booking, we will notify you as soon as possible via:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Email to your registered email address</li>
                            <li className={styles.listItem}>SMS to your registered mobile number</li>
                            <li className={styles.listItem}>Phone call (if necessary)</li>
                        </ul>
                        <p className={styles.text}>
                            Refunds for cancellations initiated by Futsalindia will be processed within 5-7 business days.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Payment Issues</h2>

                        <h3 className={styles.subsectionTitle}>6.1 Duplicate Payments</h3>
                        <p className={styles.text}>
                            If you are charged multiple times for the same booking due to a technical error or payment gateway issue,
                            the duplicate charge(s) will be refunded after verification.
                        </p>
                        <p className={styles.text}>
                            Please contact us immediately at
                            <a href="mailto:contactus.sksports@gmail.com" className={styles.contactLink}> contactus.sksports@gmail.com </a>
                            with your transaction details.
                        </p>

                        <h3 className={styles.subsectionTitle}>6.2 Failed Bookings</h3>
                        <p className={styles.text}>
                            If your payment is deducted but the booking is not confirmed due to a system error,
                            we will either confirm your booking or issue a full refund after investigation.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Important Reminders</h2>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Double-check your booking details</strong> before completing payment
                            </li>
                            <li className={styles.listItem}>
                                <strong>Verify date, time, and court type</strong> to avoid booking errors
                            </li>
                            <li className={styles.listItem}>
                                <strong>Plan ahead</strong> - ensure you can attend before making payment
                            </li>
                            <li className={styles.listItem}>
                                <strong>Arrive on time</strong> - late arrivals do not extend your booking time
                            </li>
                            <li className={styles.listItem}>
                                <strong>Contact support early</strong> if you need to reschedule
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Chargebacks and Disputes</h2>
                        <p className={styles.text}>
                            By using our services, you agree not to initiate chargebacks or payment disputes for bookings made in accordance with this policy.
                        </p>
                        <p className={styles.text}>
                            Initiating an unauthorized chargeback may result in:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Suspension or termination of your account</li>
                            <li className={styles.listItem}>Legal action to recover costs and damages</li>
                            <li className={styles.listItem}>Permanent ban from using our services</li>
                        </ul>
                        <p className={styles.text}>
                            If you have any concerns about a charge, please contact us first to resolve the issue.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>9. Exceptions</h2>
                        <p className={styles.text}>
                            The only circumstances under which refunds will be issued are:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Cancellations initiated by Futsalindia (as described in Section 5)</li>
                            <li className={styles.listItem}>Duplicate or erroneous charges (as described in Section 6)</li>
                            <li className={styles.listItem}>System errors resulting in failed bookings</li>
                        </ul>
                        <p className={styles.text}>
                            All other refund requests will be denied in accordance with this policy.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>10. Changes to This Policy</h2>
                        <p className={styles.text}>
                            We reserve the right to modify this Refund and Cancellation Policy at any time. Any changes will be effective immediately
                            upon posting on our website. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Contact Us</h2>
                        <p className={styles.text}>
                            For questions regarding this policy or assistance with bookings, please contact us:
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
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Support Hours:</span>
                            <span>Monday - Sunday, 9:00 AM - 9:00 PM IST</span>
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
