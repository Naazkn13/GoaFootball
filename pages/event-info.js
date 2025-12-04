import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/EventInfo.module.css';

export default function EventInfo() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [router]);

    const handleProceedToPayment = () => {
        router.push('/profile');
    };

    if (!user) {
        return null; // or a loading spinner
    }

    return (
        <>
            <Head>
                <title>Event Information - Football Registration</title>
                <meta name="description" content="Learn about the football event and get inspired by legendary quotes" />
            </Head>

            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <h1 className={styles.title}>Welcome, {user.name}! ⚽</h1>
                    <p className={styles.subtitle}>Get ready for an amazing football experience</p>
                </header>

                {/* Quotes Section */}
                <section className={styles.quotesSection}>
                    <h2 className={styles.sectionTitle}>Words from the Legends</h2>
                    <div className={styles.quotesGrid}>
                        <div className={styles.quoteCard}>
                            <div className={styles.quoteIcon}>"</div>
                            <p className={styles.quoteText}>
                                "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing."
                            </p>
                            <p className={styles.quoteAuthor}>- Pelé</p>
                        </div>

                        <div className={styles.quoteCard}>
                            <div className={styles.quoteIcon}>"</div>
                            <p className={styles.quoteText}>
                                "Your love makes you strong. Your hate makes you weak. Revenge is a weakness. Forgiveness is strength."
                            </p>
                            <p className={styles.quoteAuthor}>- Lionel Messi</p>
                        </div>

                        <div className={styles.quoteCard}>
                            <div className={styles.quoteIcon}>"</div>
                            <p className={styles.quoteText}>
                                "Talent without working hard is nothing."
                            </p>
                            <p className={styles.quoteAuthor}>- Cristiano Ronaldo</p>
                        </div>

                        <div className={styles.quoteCard}>
                            <div className={styles.quoteIcon}>"</div>
                            <p className={styles.quoteText}>
                                "I learned all about life with a ball at my feet."
                            </p>
                            <p className={styles.quoteAuthor}>- Ronaldinho</p>
                        </div>
                    </div>
                </section>

                {/* Event Details */}
                <section className={styles.eventDetails}>
                    <h2 className={styles.sectionTitle}>Event Highlights</h2>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailCard}>
                            <div className={styles.detailIcon}>🏆</div>
                            <h3 className={styles.detailTitle}>Tournament Format</h3>
                            <p className={styles.detailText}>
                                Competitive matches with skilled players. Teams will be formed based on skill level for fair and exciting games.
                            </p>
                        </div>

                        <div className={styles.detailCard}>
                            <div className={styles.detailIcon}>⚡</div>
                            <h3 className={styles.detailTitle}>Premium Facilities</h3>
                            <p className={styles.detailText}>
                                World-class football grounds with professional-grade turf, proper lighting, and excellent amenities.
                            </p>
                        </div>

                        <div className={styles.detailCard}>
                            <div className={styles.detailIcon}>🎯</div>
                            <h3 className={styles.detailTitle}>What's Included</h3>
                            <p className={styles.detailText}>
                                Registration, team assignment, practice sessions, tournament matches, refreshments, and winner trophies!
                            </p>
                        </div>

                        <div className={styles.detailCard}>
                            <div className={styles.detailIcon}>📅</div>
                            <h3 className={styles.detailTitle}>Schedule</h3>
                            <p className={styles.detailText}>
                                Registration closes soon! Team formation, practice sessions, and the main tournament will be announced via email.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Important Info */}
                <section className={styles.importantInfo}>
                    <h2 className={styles.sectionTitle}>Important Information</h2>
                    <div className={styles.infoBox}>
                        <ul className={styles.infoList}>
                            <li>✅ Registration Fee: ₹500 (One-time payment)</li>
                            <li>✅ All players must bring valid ID proof</li>
                            <li>✅ Sports shoes and appropriate attire required</li>
                            <li>✅ Water and basic refreshments provided</li>
                            <li>✅ Medical assistance available on-site</li>
                            <li>✅ Prizes and trophies for winning teams</li>
                        </ul>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.ctaSection}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>Ready to Join?</h2>
                        <p className={styles.ctaDescription}>
                            Complete your registration by making the payment. Secure your spot now!
                        </p>
                        <button onClick={handleProceedToPayment} className={styles.ctaButton}>
                            Proceed to Payment →
                        </button>
                        <Link href="/" className={styles.backLink}>
                            ← Back to Home
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
