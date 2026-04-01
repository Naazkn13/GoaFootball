import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/PolicyPages.module.css';

const renderText = (text) => {
    if (!text) return null;
    let inList = false;
    let listItems = [];
    const elements = [];

    text.split('\n').forEach((line, j) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
            listItems.push(<li key={`li-${j}`} className={styles.listItem}>{trimmed.substring(2)}</li>);
            inList = true;
        } else {
            if (inList) {
                elements.push(<ul key={`ul-${j}`} className={styles.list}>{listItems}</ul>);
                listItems = [];
                inList = false;
            }
            if (trimmed.startsWith('### ')) {
                elements.push(<h3 key={`h3-${j}`} className={styles.subsectionTitle}>{trimmed.substring(4)}</h3>);
            } else if (trimmed !== '') {
                const parts = trimmed.split(/\*\*(.*?)\*\*/g);
                if (parts.length > 1) {
                   elements.push(<p key={`p-${j}`} className={styles.text}>{parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}</p>);
                } else {
                   elements.push(<p key={`p-${j}`} className={styles.text}>{line}</p>);
                }
            }
        }
    });
    if (inList) {
        elements.push(<ul key={`ul-end`} className={styles.list}>{listItems}</ul>);
    }
    return elements;
};

const DEFAULTS = {
    page_title: 'Privacy Policy',
    last_updated: 'Last Updated: December 3, 2024',
    sections: [
        {
            heading: '1. Introduction',
            content: 'Welcome to Goa Football Festival. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.\n\nBy using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.'
        },
        {
            heading: '2. Information We Collect',
            content: '### 2.1 Personal Information\nWe collect personal information that you voluntarily provide to us when you:\n- Register for an account\n- Make a booking or registration\n- Process a payment\n- Contact us for support\n\nThis information may include:\n- Name and contact information (email, phone number)\n- Account credentials\n- Payment information (processed securely through Razorpay)\n- Registration details and preferences\n\n### 2.2 Automatically Collected Information\nWhen you access our platform, we automatically collect certain information, including:\n- Device information (IP address, browser type)\n- Usage data (pages visited, time spent)\n- Cookies and similar tracking technologies'
        },
        {
            heading: '3. How We Use Your Information',
            content: 'We use the information we collect for the following purposes:\n- **Service Delivery:** To process registrations and provide support\n- **Payment Processing:** To facilitate secure payment transactions\n- **Communication:** To send confirmations and important notifications\n- **Security:** To protect against fraud and unauthorized access\n- **Legal Compliance:** To comply with applicable laws'
        },
        {
            heading: '4. Data Security',
            content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:\n- Encryption of sensitive data (SSL/TLS)\n- Secure authentication and access controls\n- Regular security audits and updates\n\nHowever, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.'
        }
    ]
};

export default function PrivacyPolicy() {
    const [content, setContent] = useState(DEFAULTS);
    const [contactInfo, setContactInfo] = useState({
        email: 'contactus.sksports@gmail.com',
        phone: '+91 9326 394341',
        company_name: 'Goa Football Festival'
    });

    useEffect(() => {
        // Fetch privacy page content
        fetch('/api/site-content/privacy')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.content?.main) {
                    setContent({ ...DEFAULTS, ...data.content.main });
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

    return (
        <>
            <Head>
                <title>{content.page_title}</title>
                <meta name="description" content={`Privacy Policy for ${contactInfo.company_name}`} />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{content.page_title}</h1>
                        <p className={styles.lastUpdated}>{content.last_updated}</p>
                    </div>

                    {(content.sections || []).map((section, i) => (
                        <section key={i} className={styles.section}>
                            <h2 className={styles.sectionTitle}>{section.heading}</h2>
                            {renderText(section.content)}
                        </section>
                    ))}

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Contact Us</h2>
                        <p className={styles.text}>
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
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
                    </div>

                    <Link href="/" className={styles.backButton}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </>
    );
}
