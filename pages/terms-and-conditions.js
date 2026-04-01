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
    page_title: 'Terms & Conditions',
    last_updated: 'Last Updated: December 3, 2024',
    sections: [
        {
            heading: '1. Acceptance of Terms',
            content: 'Welcome to Goa Football Festival. By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.'
        },
        {
            heading: '2. Service Description',
            content: 'We provide an online platform for football registrations and event management. Our services include:\n- Online registration and processing\n- Secure payment gateways\n- Admin management and notifications\n- Customer support services\n\nWe reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.'
        },
        {
            heading: '3. User Accounts',
            content: '### 3.1 Account Registration\nTo use our booking services, you must create an account by providing accurate information. You agree to:\n- Provide truthful, accurate, and current information\n- Keep your account credentials secure\n- Notify us immediately of unauthorized access\n\n### 3.2 Account Responsibility\nYou are responsible for all activities that occur under your account. You must be at least 18 years old to create an account directly, or have parental consent.'
        },
        {
            heading: '4. Payment Terms',
            content: '### 4.1 Pricing\nAll prices are displayed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve the right to change our pricing at any time.\n\n### 4.2 Payment Methods\nWe accept payments through our secure payment gateway partner, Razorpay. Accepted methods include:\n- Credit and Debit Cards\n- Net Banking\n- UPI\n- Digital Wallets'
        }
    ]
};

export default function TermsAndConditions() {
    const [content, setContent] = useState(DEFAULTS);
    const [contactInfo, setContactInfo] = useState({
        email: 'contactus.sksports@gmail.com',
        phone: '+91 9326 394341',
        company_name: 'Goa Football Festival'
    });

    useEffect(() => {
        // Fetch terms page content
        fetch('/api/site-content/terms')
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
                <meta name="description" content={`Terms and Conditions for ${contactInfo.company_name}`} />
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
                            If you have any questions or concerns about these Terms and Conditions, please contact us:
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
