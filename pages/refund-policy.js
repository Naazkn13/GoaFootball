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
    page_title: 'Refund & Cancellation Policy',
    last_updated: 'Last Updated: December 3, 2024',
    sections: [
        {
            heading: '1. Overview',
            content: 'At Goa Football Festival, we operate a strict no-refund policy. All payments made for registrations are **final and non-refundable**.\n\nPlease read this policy carefully before making a payment. By completing a payment, you acknowledge and agree to these terms.'
        },
        {
            heading: '2. No Refund Policy',
            content: '### 2.1 All Sales Are Final\n**Once payment is completed, no refunds will be issued under any circumstances.** This includes but is not limited to:\n- Cancellations made by the user\n- Changes in personal plans or schedules\n- Inability to attend the registered event\n- Personal emergencies or medical issues\n\n### 2.2 Payment Confirmation\nBy completing your payment through our platform, you confirm that:\n- You have verified the registration details\n- You understand and accept the no-refund policy\n- You agree that all payments are final and non-refundable'
        },
        {
            heading: '3. Cancellation Policy',
            content: '### 3.1 Customer Cancellations\nWhile you may request to cancel your registration at any time, **no refund will be provided** regardless of when the cancellation is made.\n\n### 3.2 No-Show Policy\nIf you fail to arrive for your registered session or duties (no-show), your registration will be forfeited and no refund will be issued.'
        },
        {
            heading: '4. Exceptions',
            content: 'The only circumstances under which refunds will be issued are:\n- Cancellations initiated by Goa Football Festival itself\n- Duplicate or erroneous charges due to technical errors\n- System errors resulting in failed but charged transactions\n\nAll other refund requests will be denied in accordance with this policy.'
        }
    ]
};

export default function RefundPolicy() {
    const [content, setContent] = useState(DEFAULTS);
    const [contactInfo, setContactInfo] = useState({
        email: 'contactus.sksports@gmail.com',
        phone: '+91 9326 394341',
        company_name: 'Goa Football Festival'
    });

    useEffect(() => {
        // Fetch refund page content
        fetch('/api/site-content/refund')
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
                <meta name="description" content={`Refund and Cancellation Policy for ${contactInfo.company_name}.`} />
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
                            For questions regarding this policy or assistance with registrations, please contact us:
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
