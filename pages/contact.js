import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/PolicyPages.module.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, just show a success message
        // In production, you would send this to your backend API
        setSubmitStatus('success');
        setTimeout(() => {
            setSubmitStatus('');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 3000);
    };

    return (
        <>
            <Head>
                <title>Contact Us - Futsalindia</title>
                <meta name="description" content="Get in touch with Futsalindia for support, inquiries, or feedback about our futsal and football court booking services." />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Contact Us</h1>
                        <p className={styles.lastUpdated}>We're Here to Help!</p>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Get in Touch</h2>
                        <p className={styles.text}>
                            Have questions, feedback, or need assistance? We'd love to hear from you!
                            Our team at <span className={styles.highlight}>Futsalindia</span> is dedicated to providing excellent customer service
                            and ensuring you have the best experience booking your futsal and football courts.
                        </p>
                    </section>

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Contact Information</h2>

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
                            <span>Andheri West, Mumbai 400053, Maharashtra, India</span>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Support Hours:</span>
                            <span>Monday - Sunday: 9:00 AM - 9:00 PM IST</span>
                        </div>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Send Us a Message</h2>
                        <p className={styles.text}>
                            Fill out the form below and we'll get back to you as soon as possible, typically within 24 hours.
                        </p>

                        <form onSubmit={handleSubmit} style={{ marginTop: '25px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="subject" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="message" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {submitStatus === 'success' && (
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#d1fae5',
                                    border: '2px solid #10b981',
                                    borderRadius: '8px',
                                    color: '#065f46',
                                    marginBottom: '20px',
                                    fontWeight: '600'
                                }}>
                                    ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                                </div>
                            )}

                            <button
                                type="submit"
                                style={{
                                    padding: '14px 35px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                Send Message
                            </button>
                        </form>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>

                        <h3 className={styles.subsectionTitle}>How do I book a court?</h3>
                        <p className={styles.text}>
                            Simply sign up or log in to your account, browse available courts, select your preferred date and time,
                            and complete the payment. You'll receive instant confirmation via email and SMS.
                        </p>

                        <h3 className={styles.subsectionTitle}>What payment methods do you accept?</h3>
                        <p className={styles.text}>
                            We accept all major credit/debit cards, net banking, UPI, and digital wallets through our secure payment partner Razorpay.
                        </p>

                        <h3 className={styles.subsectionTitle}>Can I cancel or reschedule my booking?</h3>
                        <p className={styles.text}>
                            Yes! You can cancel or reschedule your booking according to our refund policy.
                            Please refer to our <Link href="/refund-policy">Refund Policy</Link> for detailed information.
                        </p>

                        <h3 className={styles.subsectionTitle}>Do you offer group bookings or tournaments?</h3>
                        <p className={styles.text}>
                            Yes, we can accommodate group bookings and tournaments. Please contact us directly to discuss your requirements
                            and we'll be happy to assist you with special arrangements.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Business Inquiries</h2>
                        <p className={styles.text}>
                            Interested in partnering with Futsalindia or listing your sports facility on our platform?
                            We'd love to hear from you! Please reach out to us at
                            <a href="mailto:contactus.sksports@gmail.com" className={styles.contactLink}> contactus.sksports@gmail.com </a>
                            with details about your facility or partnership proposal.
                        </p>
                    </section>

                    <Link href="/" className={styles.backButton}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </>
    );
}
