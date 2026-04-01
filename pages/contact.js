import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../styles/PolicyPages.module.css';

const DEFAULT_CONTENT = {
    intro: {
        title: 'Contact Us',
        subtitle: "We're Here to Help!",
        heading: 'Get in Touch',
        description: "Have questions, feedback, or need assistance? We'd love to hear from you!\nOur team at Goa Football Festival is dedicated to providing excellent customer service and ensuring you have the best experience."
    },
    faq: {
        title: 'Frequently Asked Questions',
        items: [
            { q: 'How do I register?', a: 'Simply sign up or log in to your account, fill out your details, and complete the process.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, net banking, UPI, and digital wallets through our secure payment partner Razorpay.' },
            { q: 'Can I cancel or reschedule?', a: 'Yes! You can cancel or reschedule according to our refund policy. Please refer to our Refund Policy for detailed information.' },
            { q: 'Do you offer group bookings?', a: 'Yes, we can accommodate group bookings and tournaments. Please contact us directly.' }
        ]
    },
    business: {
        title: 'Business Inquiries',
        description: "Interested in partnering with Goa Football Festival?\nWe'd love to hear from you! Please reach out to us at contactus.sksports@gmail.com with details about your proposal."
    }
};

export default function Contact() {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [contactInfo, setContactInfo] = useState({
        email: 'contactus.sksports@gmail.com',
        phone: '+91 9326 394341',
        company_name: 'Goa Football Festival',
        address: 'Andheri West, Mumbai 400053, Maharashtra, India',
        support_hours: 'Monday - Sunday: 9:00 AM - 9:00 PM IST'
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState('');

    useEffect(() => {
        // Fetch contact page content (intro, faq, business text blocks)
        fetch('/api/site-content/contact')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.content) {
                    setContent(prev => ({
                        intro: { ...prev.intro, ...data.content.intro },
                        faq: { ...prev.faq, ...data.content.faq },
                        business: { ...prev.business, ...data.content.business }
                    }));
                }
            })
            .catch(() => { });

        // Fetch footer contact info
        fetch('/api/site-content/footer')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.content?.contact) {
                    setContactInfo(prev => ({ ...prev, ...data.content.contact }));
                }
            })
            .catch(() => { });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                <title>{content.intro?.title} - {contactInfo.company_name}</title>
                <meta name="description" content={`Get in touch with ${contactInfo.company_name} for support, inquiries, or feedback.`} />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{content.intro?.title}</h1>
                        <p className={styles.lastUpdated}>{content.intro?.subtitle}</p>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{content.intro?.heading}</h2>
                        {(content.intro?.description || '').split('\n').map((paragraph, j) => (
                            <p key={j} className={styles.text}>{paragraph}</p>
                        ))}
                    </section>

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Contact Information</h2>

                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Company:</span>
                            <span>{contactInfo.company_name}</span>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Email:</span>
                            <a href={`mailto:${contactInfo.email}`} className={styles.contactLink}>
                                {contactInfo.email}
                            </a>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Phone:</span>
                            <a href={`tel:${contactInfo.phone.replace(/\\s/g, '')}`} className={styles.contactLink}>
                                {contactInfo.phone}
                            </a>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Address:</span>
                            <span>{contactInfo.address}</span>
                        </div>

                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Support Hours:</span>
                            <span>{contactInfo.support_hours}</span>
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
                        <h2 className={styles.sectionTitle}>{content.faq?.title}</h2>
                        {(content.faq?.items || []).map((faq, i) => (
                            <div key={i} style={{ marginBottom: '20px' }}>
                                <h3 className={styles.subsectionTitle}>{faq.q}</h3>
                                <p className={styles.text}>{faq.a}</p>
                            </div>
                        ))}
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{content.business?.title}</h2>
                        {(content.business?.description || '').split('\n').map((paragraph, j) => (
                            <p key={j} className={styles.text}>{paragraph}</p>
                        ))}
                    </section>

                    <Link href="/" className={styles.backButton}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </>
    );
}
