import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/PolicyPages.module.css';

const DEFAULTS = {
    page_title: 'About Goa Football Festival',
    page_subtitle: 'Your Premier Football Registration Platform',
    sections: [
        {
            heading: 'Who We Are',
            content: 'Welcome to Goa Football Festival — Goa\'s leading football registration platform. We are passionate about making sports accessible, convenient, and enjoyable for everyone.'
        },
        {
            heading: 'Our Mission',
            content: 'Our mission is to promote active lifestyles and foster a vibrant sports community by providing easy access to football registration, quality events, community building, and affordability.'
        },
        {
            heading: 'Our Vision',
            content: 'We envision a future where every football enthusiast in Goa can register, participate, and grow in the sport they love. Our goal is to expand across India, partner with premium facilities, and build a thriving community.'
        },
        {
            heading: 'Get Started Today',
            content: 'Ready to join? Register as a Player, Coach, Referee, or Manager. Get your unique Football UID and become part of the Goa Football Festival community!'
        },
    ],
};

export default function About() {
    const [content, setContent] = useState(DEFAULTS);

    useEffect(() => {
        fetch('/api/site-content/about')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.content?.main) {
                    setContent({ ...DEFAULTS, ...data.content.main });
                }
            })
            .catch(() => { });
    }, []);

    return (
        <>
            <Head>
                <title>{content.page_title}</title>
                <meta name="description" content={content.page_subtitle} />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{content.page_title}</h1>
                        <p className={styles.lastUpdated}>{content.page_subtitle}</p>
                    </div>

                    {(content.sections || []).map((section, i) => (
                        <section key={i} className={styles.section}>
                            <h2 className={styles.sectionTitle}>{section.heading}</h2>
                            {section.content.split('\n').map((paragraph, j) => (
                                <p key={j} className={styles.text}>{paragraph}</p>
                            ))}
                        </section>
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Link href="/login" className={styles.backButton} style={{ marginRight: '15px' }}>
                            Register Now
                        </Link>
                        <Link href="/contact" className={styles.backButton}>
                            Contact Us
                        </Link>
                    </div>

                    <Link href="/" className={styles.backButton} style={{ marginTop: '20px' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </>
    );
}
