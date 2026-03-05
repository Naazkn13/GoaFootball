import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

// Counter animation hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress >= 1) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

export default function HomePage() {
  const stat1 = useCountUp(1200);
  const stat2 = useCountUp(50);
  const stat3 = useCountUp(25);
  const stat4 = useCountUp(8);

  return (
    <>
      <Head>
        <title>Goa Football Festival — Join the Game</title>
        <meta name="description" content="Register for the Goa Football Festival as a player, coach, referee, or manager. Get your Football UID and join the community." />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroBgGradient} />
            <div className={styles.heroBgPattern} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} />
              Registrations Open for 2026
            </div>
            <h1 className={styles.heroTitle}>
              Your Football<br />
              Journey Starts <span className={styles.highlight}>Here</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Register as a Player, Coach, Referee, or Manager.
              Get your unique Football UID and become part of the community.
            </p>
            <div className={styles.heroActions}>
              <Link href="/login" className={styles.heroPrimaryBtn}>
                Register Now
              </Link>
              <a href="#how-it-works" className={styles.heroSecondaryBtn}>
                Learn More ↓
              </a>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className={styles.floatingBall1} />
          <div className={styles.floatingBall2} />
          <div className={styles.floatingBall3} />
        </section>

        {/* ===== STATS COUNTER ===== */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem} ref={stat1.ref}>
              <span className={styles.statValue}>{stat1.count}+</span>
              <span className={styles.statLabel}>Registered Players</span>
            </div>
            <div className={styles.statItem} ref={stat2.ref}>
              <span className={styles.statValue}>{stat2.count}+</span>
              <span className={styles.statLabel}>Certified Coaches</span>
            </div>
            <div className={styles.statItem} ref={stat3.ref}>
              <span className={styles.statValue}>{stat3.count}+</span>
              <span className={styles.statLabel}>Active Referees</span>
            </div>
            <div className={styles.statItem} ref={stat4.ref}>
              <span className={styles.statValue}>{stat4.count}+</span>
              <span className={styles.statLabel}>Events Organized</span>
            </div>
          </div>
        </section>

        {/* ===== ROLE CTAs ===== */}
        <section className={styles.rolesSection} id="roles">
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Choose Your Role</h2>
            <p className={styles.sectionSubtitle}>
              Every role matters in football. Find yours and join the community.
            </p>

            <div className={styles.rolesGrid}>
              {[
                { icon: '🏃', title: 'Athlete', desc: 'Register as a football player and showcase your skills', color: '#3b82f6' },
                { icon: '🏋️', title: 'Coach', desc: 'Guide and mentor the next generation of footballers', color: '#22c55e' },
                { icon: '🏁', title: 'Referee', desc: 'Ensure fair play and uphold the spirit of the game', color: '#f59e0b' },
                { icon: '📋', title: 'Manager', desc: 'Lead teams and manage operations behind the scenes', color: '#a855f7' },
              ].map((role) => (
                <div key={role.title} className={styles.roleHomeCard} style={{ '--accent': role.color }}>
                  <span className={styles.roleHomeIcon}>{role.icon}</span>
                  <h3>{role.title}</h3>
                  <p>{role.desc}</p>
                  <Link href="/login" className={styles.roleHomeBtn}>
                    Register →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className={styles.howItWorks} id="how-it-works">
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Get registered in 3 simple steps
            </p>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>01</div>
                <h3>Enter Your Email</h3>
                <p>Provide your email to receive a one-time login code. No passwords needed.</p>
              </div>
              <div className={styles.stepConnector}>→</div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>02</div>
                <h3>Complete Registration</h3>
                <p>Select your role, fill in your details, and upload required documents.</p>
              </div>
              <div className={styles.stepConnector}>→</div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>03</div>
                <h3>Get Your Football UID</h3>
                <p>After payment and admin approval, receive your unique Football ID.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT SECTION ===== */}
        <section className={styles.aboutSection} id="about">
          <div className={styles.sectionContainer}>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutContent}>
                <h2 className={styles.sectionTitle}>About the Platform</h2>
                <p>
                  Our Football Registration platform provides a seamless, secure way for
                  players, coaches, referees, and managers to register for football events
                  and obtain their unique Football UID.
                </p>
                <p>
                  Built with security at its core — email OTP authentication, secure document
                  handling, and admin-verified approval ensures only legitimate registrations
                  are processed. Chat directly with admins for quick resolution of any queries.
                </p>
                <ul className={styles.featureList}>
                  <li>✓ Secure email OTP login</li>
                  <li>✓ Role-based registration</li>
                  <li>✓ Document verification</li>
                  <li>✓ Admin approval system</li>
                  <li>✓ Real-time chat support</li>
                  <li>✓ Secure payment processing</li>
                </ul>
              </div>
              <div className={styles.aboutVisual}>
                <div className={styles.aboutCard}>
                  <Image src="/images/logo.png" alt="Goa Football Festival" width={80} height={80} className={styles.aboutLogoImg} />
                  <h3>One Platform.<br />Every Role.</h3>
                  <p>Join the community that powers football events.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA BANNER ===== */}
        <section className={styles.ctaBanner}>
          <div className={styles.sectionContainer}>
            <h2>Ready to Join the Game?</h2>
            <p>Register today and get your unique Football UID</p>
            <Link href="/login" className={styles.ctaBtn}>
              Register Now ⚽
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
