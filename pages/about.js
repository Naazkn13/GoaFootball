import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/PolicyPages.module.css';

export default function About() {
    return (
        <>
            <Head>
                <title>About Us - Futsalindia</title>
                <meta name="description" content="Learn about Futsalindia - Mumbai's premier futsal and football court booking platform." />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>About Futsalindia</h1>
                        <p className={styles.lastUpdated}>Your Premier Futsal & Football Booking Platform</p>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Who We Are</h2>
                        <p className={styles.text}>
                            Welcome to <span className={styles.highlight}>Futsalindia</span> - Mumbai's leading online platform for futsal and football court bookings.
                            We are passionate about making sports accessible, convenient, and enjoyable for everyone.
                        </p>
                        <p className={styles.text}>
                            Founded with a vision to revolutionize sports facility booking in India, Futsalindia connects sports enthusiasts with
                            premium futsal and football courts across Mumbai, making it easier than ever to book your game and play your passion.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Our Mission</h2>
                        <p className={styles.text}>
                            Our mission is to promote active lifestyles and foster a vibrant sports community by providing:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Easy Access:</strong> Seamless online booking for futsal and football courts
                            </li>
                            <li className={styles.listItem}>
                                <strong>Quality Facilities:</strong> Premium sports venues with excellent amenities
                            </li>
                            <li className={styles.listItem}>
                                <strong>Convenience:</strong> 24/7 online booking with instant confirmation
                            </li>
                            <li className={styles.listItem}>
                                <strong>Community Building:</strong> Connecting players and teams across Mumbai
                            </li>
                            <li className={styles.listItem}>
                                <strong>Affordability:</strong> Competitive pricing and transparent booking process
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>What We Offer</h2>

                        <h3 className={styles.subsectionTitle}>Premium Facilities</h3>
                        <p className={styles.text}>
                            We partner with the best futsal and football venues in Mumbai to bring you:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Professional-grade artificial turf courts</li>
                            <li className={styles.listItem}>Well-maintained indoor and outdoor facilities</li>
                            <li className={styles.listItem}>Proper lighting for day and night games</li>
                            <li className={styles.listItem}>Clean changing rooms and amenities</li>
                            <li className={styles.listItem}>Safe and secure playing environment</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>Seamless Booking Experience</h3>
                        <p className={styles.text}>
                            Our platform is designed to make booking as simple as possible:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>User-friendly interface for quick bookings</li>
                            <li className={styles.listItem}>Real-time availability and instant confirmation</li>
                            <li className={styles.listItem}>Secure online payment through Razorpay</li>
                            <li className={styles.listItem}>Booking management and modification options</li>
                            <li className={styles.listItem}>Email and SMS notifications</li>
                        </ul>

                        <h3 className={styles.subsectionTitle}>Customer Support</h3>
                        <p className={styles.text}>
                            We're here to help you every step of the way:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Dedicated customer support team</li>
                            <li className={styles.listItem}>Quick response to queries and issues</li>
                            <li className={styles.listItem}>Assistance with bookings and cancellations</li>
                            <li className={styles.listItem}>Venue recommendations and guidance</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Why Choose Futsalindia?</h2>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Trusted Platform:</strong> Secure and reliable booking system with thousands of satisfied customers
                            </li>
                            <li className={styles.listItem}>
                                <strong>Best Venues:</strong> Carefully selected and verified sports facilities across Mumbai
                            </li>
                            <li className={styles.listItem}>
                                <strong>Transparent Pricing:</strong> No hidden charges, clear pricing for all bookings
                            </li>
                            <li className={styles.listItem}>
                                <strong>Flexible Cancellation:</strong> Fair and transparent refund policy
                            </li>
                            <li className={styles.listItem}>
                                <strong>Secure Payments:</strong> PCI-DSS compliant payment processing through Razorpay
                            </li>
                            <li className={styles.listItem}>
                                <strong>24/7 Availability:</strong> Book anytime, anywhere from your device
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Our Vision</h2>
                        <p className={styles.text}>
                            We envision a future where playing sports is as easy as booking a movie ticket. Our goal is to:
                        </p>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>Expand to more cities across India</li>
                            <li className={styles.listItem}>Partner with more premium sports facilities</li>
                            <li className={styles.listItem}>Build a thriving community of sports enthusiasts</li>
                            <li className={styles.listItem}>Introduce innovative features for enhanced user experience</li>
                            <li className={styles.listItem}>Promote healthy and active lifestyles nationwide</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Our Values</h2>
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <strong>Passion for Sports:</strong> We love sports and want to share that passion with everyone
                            </li>
                            <li className={styles.listItem}>
                                <strong>Customer First:</strong> Your satisfaction and experience are our top priorities
                            </li>
                            <li className={styles.listItem}>
                                <strong>Integrity:</strong> Honest, transparent, and ethical in all our dealings
                            </li>
                            <li className={styles.listItem}>
                                <strong>Innovation:</strong> Continuously improving our platform and services
                            </li>
                            <li className={styles.listItem}>
                                <strong>Community:</strong> Building connections and fostering sportsmanship
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Get Started Today</h2>
                        <p className={styles.text}>
                            Ready to book your next game? Join thousands of sports enthusiasts who trust Futsalindia for their futsal and football bookings.
                        </p>
                        <p className={styles.text}>
                            Whether you're a casual player looking for a weekend game or a serious team seeking regular practice sessions,
                            we have the perfect court for you. Sign up today and experience the convenience of hassle-free sports booking!
                        </p>
                    </section>

                    <div className={styles.contactInfo}>
                        <h2 className={styles.contactTitle}>Get in Touch</h2>
                        <p className={styles.text}>
                            Have questions or want to learn more? We'd love to hear from you!
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
                            <span className={styles.contactLabel}>Location:</span>
                            <span>Andheri West, Mumbai 400053</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Link href="/signup" className={styles.backButton} style={{ marginRight: '15px' }}>
                            Sign Up Now
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
