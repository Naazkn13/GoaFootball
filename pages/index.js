import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import { useAuth } from '@/store/AuthContext';

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

// Default content (fallback if no CMS data)
const DEFAULTS = {
  hero: {
    badge_text: 'Registrations Open for 2026',
    title: 'Your Football\nJourney Starts Here',
    subtitle: 'Register as a Player, Coach, Referee, or Manager. Get your unique Football UID and become part of the community.',
    primary_btn: 'Register Now',
    secondary_btn: 'Learn More ↓',
  },
  stats: {
    items: [
      { value: 1200, label: 'Registered Players' },
      { value: 50, label: 'Certified Coaches' },
      { value: 25, label: 'Active Referees' },
      { value: 8, label: 'Events Organized' },
    ],
  },
  roles: {
    title: 'Choose Your Role',
    subtitle: 'Every role matters in football. Find yours and join the community.',
    items: [
      { icon: '🏃', title: 'Athlete', desc: 'Register as a football player and showcase your skills', color: '#3b82f6' },
      { icon: '🏋️', title: 'Coach', desc: 'Guide and mentor the next generation of footballers', color: '#22c55e' },
      { icon: '🏁', title: 'Referee', desc: 'Ensure fair play and uphold the spirit of the game', color: '#f59e0b' },
      { icon: '📋', title: 'Others', desc: 'Parents, Physio, Support Staff, Etc', color: '#a855f7' },
    ],
  },
  how_it_works: {
    title: 'How It Works',
    subtitle: 'Get registered in 3 simple steps',
    steps: [
      { title: 'Enter Your Email', desc: 'Provide your email to receive a one-time login code. No passwords needed.' },
      { title: 'Complete Registration', desc: 'Select your role, fill in your details, and upload required documents.' },
      { title: 'Get Your Football UID', desc: 'After payment and admin approval, receive your unique Football ID.' },
    ],
  },
  about: {
    title: 'About the Platform',
    paragraph1: 'Our Football Registration platform provides a seamless, secure way for players, coaches, referees, and managers to register for football events and obtain their unique Football UID.',
    paragraph2: 'Built with security at its core — email OTP authentication, secure document handling, and admin-verified approval ensures only legitimate registrations are processed. Chat directly with admins for quick resolution of any queries.',
    features: ['Secure email OTP login', 'Role-based registration', 'Document verification', 'Admin approval system', 'Real-time chat support', 'Secure payment processing'],
  },
  gallery: {
    title: 'Our Gallery',
    subtitle: 'Moments from the Goa Football Festival',
    images: [],
  },
  cta: {
    title: 'Ready to Join the Game?',
    subtitle: 'Register today and get your unique Football UID',
    button: 'Register Now ⚽',
  },
};

export default function HomePage() {
  const [content, setContent] = useState({});
  const { user, logout } = useAuth();

  useEffect(() => {
    // Automatically log out the user when they return to the main homepage
    if (user) {
      logout();
    }
  }, [user, logout]);

  useEffect(() => {
    fetch('/api/site-content/home')
      .then(res => res.json())
      .then(data => {
        if (data.success) setContent(data.content);
      })
      .catch(() => { });
  }, []);

  // Merge CMS content with defaults
  const hero = { ...DEFAULTS.hero, ...content.hero };
  const statsData = content.stats || DEFAULTS.stats;
  const rolesData = { ...DEFAULTS.roles, ...content.roles };
  const howData = { ...DEFAULTS.how_it_works, ...content.how_it_works };
  const aboutData = { ...DEFAULTS.about, ...content.about };
  const galleryData = { ...DEFAULTS.gallery, ...content.gallery };
  const ctaData = { ...DEFAULTS.cta, ...content.cta };

  const statItems = statsData.items || DEFAULTS.stats.items;
  const stat1 = useCountUp(statItems[0]?.value || 0);
  const stat2 = useCountUp(statItems[1]?.value || 0);
  const stat3 = useCountUp(statItems[2]?.value || 0);
  const stat4 = useCountUp(statItems[3]?.value || 0);

  // Parse hero title for the highlighted word
  const titleParts = (hero.title || '').split('\n');

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
              {hero.badge_text}
            </div>
            <h1 className={styles.heroTitle}>
              {titleParts.map((part, i) => (
                <span key={i}>{i > 0 && <br />}{part}</span>
              ))}
            </h1>
            <p className={styles.heroSubtitle}>
              {hero.subtitle}
            </p>
            <div className={styles.heroActions}>
              <Link href="/login" className={styles.heroPrimaryBtn}>
                {hero.primary_btn}
              </Link>
              <a href="#how-it-works" className={styles.heroSecondaryBtn}>
                {hero.secondary_btn}
              </a>
            </div>

            {/* Hero Images */}
            {(hero.images || []).length > 0 && (
              <div className={styles.heroImages}>
                {hero.images.map((img, i) => (
                  <div key={img.url || `hero-img-${i}`} className={styles.heroImageCard}>
                    <img src={img.url} alt={img.caption || 'Football event'} />
                    {img.caption && <span className={styles.heroImageCaption}>{img.caption}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== STATS COUNTER ===== */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem} ref={stat1.ref}>
              <span className={styles.statValue}>{stat1.count}+</span>
              <span className={styles.statLabel}>{statItems[0]?.label}</span>
            </div>
            <div className={styles.statItem} ref={stat2.ref}>
              <span className={styles.statValue}>{stat2.count}+</span>
              <span className={styles.statLabel}>{statItems[1]?.label}</span>
            </div>
            <div className={styles.statItem} ref={stat3.ref}>
              <span className={styles.statValue}>{stat3.count}+</span>
              <span className={styles.statLabel}>{statItems[2]?.label}</span>
            </div>
            <div className={styles.statItem} ref={stat4.ref}>
              <span className={styles.statValue}>{stat4.count}+</span>
              <span className={styles.statLabel}>{statItems[3]?.label}</span>
            </div>
          </div>
        </section>

        {/* ===== ROLE CTAs ===== */}
        <section className={styles.rolesSection} id="roles">
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>{rolesData.title}</h2>
            <p className={styles.sectionSubtitle}>
              {rolesData.subtitle}
            </p>

            <div className={styles.rolesGrid}>
              {(rolesData.items || []).map((role) => (
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
            <h2 className={styles.sectionTitle}>{howData.title}</h2>
            <p className={styles.sectionSubtitle}>
              {howData.subtitle}
            </p>

            <div className={styles.stepsGrid}>
              {(howData.steps || []).map((step, i) => (
                <React.Fragment key={step.title}>
                  {i > 0 && <div className={styles.stepConnector}>→</div>}
                  <div className={styles.stepCard}>
                    <div className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ABOUT SECTION ===== */}
        <section className={styles.aboutSection} id="about">
          <div className={styles.sectionContainer}>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutContent}>
                <h2 className={styles.sectionTitle}>{aboutData.title}</h2>
                <p>{aboutData.paragraph1}</p>
                <p>{aboutData.paragraph2}</p>
                <ul className={styles.featureList}>
                  {(aboutData.features || []).map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
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

        {/* ===== GALLERY SECTION ===== */}
        {(galleryData.images || []).length > 0 && (
          <section className={styles.gallerySection} id="gallery">
            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>{galleryData.title}</h2>
              <p className={styles.sectionSubtitle}>{galleryData.subtitle}</p>
              <div className={styles.galleryGrid}>
                {galleryData.images.map((img, i) => (
                  <div key={img.url || i} className={styles.galleryItem}>
                    <img src={img.url} alt={img.caption || 'Gallery image'} />
                    {img.caption && <p className={styles.galleryCaption}>{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== CTA BANNER ===== */}
        <section className={styles.ctaBanner}>
          <div className={styles.sectionContainer}>
            <h2>{ctaData.title}</h2>
            <p>{ctaData.subtitle}</p>
            <Link href="/login" className={styles.ctaBtn}>
              {ctaData.button}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
