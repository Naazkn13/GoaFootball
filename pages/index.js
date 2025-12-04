import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Landing.module.css';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Football Event Registration - Join the Game</title>
        <meta name="description" content="Register for the ultimate football event. Join players, compete, and showcase your skills." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.landingContainer}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>⚽ Football Event Registration</h1>
            <p className={styles.heroSubtitle}>Join the Ultimate Football Experience</p>
            <p className={styles.heroDescription}>
              Register now for our premier football event. Compete with the best, showcase your skills,
              and be part of an unforgettable sporting experience. Limited spots available!
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/signup" className={styles.primaryCta}>
                Register Now
              </Link>
              <Link href="/login" className={styles.secondaryCta}>
                Already Registered? Login
              </Link>
            </div>
          </div>
        </section>

        {/* About Event Section */}
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>Why Join Our Event?</h2>
          <p className={styles.sectionSubtitle}>
            Experience the thrill of competitive football with professional organization and top-tier facilities
          </p>
          <div className={styles.aboutContent}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🏆</span>
              <h3 className={styles.featureTitle}>Competitive Matches</h3>
              <p className={styles.featureDescription}>
                Participate in professionally organized matches with skilled players from across the region.
                Test your abilities and compete for glory.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⚡</span>
              <h3 className={styles.featureTitle}>Premium Facilities</h3>
              <p className={styles.featureDescription}>
                Play on world-class football grounds with professional-grade turf, proper lighting,
                and excellent amenities for the best experience.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎯</span>
              <h3 className={styles.featureTitle}>Easy Registration</h3>
              <p className={styles.featureDescription}>
                Simple online registration process with secure payment. Get confirmed instantly
                and receive all event details via email and SMS.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Players Section */}
        <section className={styles.playersSection}>
          <h2 className={styles.sectionTitle}>Football Legends</h2>
          <p className={styles.sectionSubtitle}>
            Inspired by the greatest players who've graced the beautiful game
          </p>
          <div className={styles.playersGrid}>
            <div className={styles.playerCard}>
              <div className={styles.playerImageWrapper}>
                <Image src="/messi.png" alt="Lionel Messi" width={150} height={150} className={styles.playerImg} />
              </div>
              <h3 className={styles.playerName}>Lionel Messi</h3>
              <p className={styles.playerRole}>Forward Legend</p>
              <p className={styles.playerDescription}>
                8-time Ballon d'Or winner, World Cup champion, and one of the greatest players of all time.
                Known for incredible dribbling and playmaking.
              </p>
            </div>
            <div className={styles.playerCard}>
              <div className={styles.playerImageWrapper}>
                <Image src="/ronaldo.png" alt="Cristiano Ronaldo" width={150} height={150} className={styles.playerImg} />
              </div>
              <h3 className={styles.playerName}>Cristiano Ronaldo</h3>
              <p className={styles.playerRole}>Striker Icon</p>
              <p className={styles.playerDescription}>
                5-time Ballon d'Or winner, all-time top scorer in football history.
                Renowned for athleticism, heading ability, and clutch performances.
              </p>
            </div>
            <div className={styles.playerCard}>
              <div className={styles.playerImageWrapper}>
                <Image src="/neymar.png" alt="Neymar Jr" width={150} height={150} className={styles.playerImg} />
              </div>
              <h3 className={styles.playerName}>Neymar Jr</h3>
              <p className={styles.playerRole}>Skillful Winger</p>
              <p className={styles.playerDescription}>
                Brazilian superstar known for flair, creativity, and technical brilliance.
                One of the most entertaining players in modern football.
              </p>
            </div>
            <div className={styles.playerCard}>
              <div className={styles.playerImageWrapper}>
                <Image src="/mbappe.png" alt="Kylian Mbappé" width={150} height={150} className={styles.playerImg} />
              </div>
              <h3 className={styles.playerName}>Kylian Mbappé</h3>
              <p className={styles.playerRole}>Speed Demon</p>
              <p className={styles.playerDescription}>
                World Cup winner and one of the fastest players in the world.
                The future of football with exceptional pace and finishing ability.
              </p>
            </div>
          </div>
        </section>

        {/* Events Timeline */}
        <section className={styles.eventsSection}>
          <h2 className={styles.sectionTitle}>Event Timeline</h2>
          <p className={styles.sectionSubtitle}>
            Important dates and milestones for the football event
          </p>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineDate}>Registration Phase</p>
                <h3 className={styles.timelineTitle}>Open Registration</h3>
                <p className={styles.timelineDescription}>
                  Registration is now open! Secure your spot by completing the online registration
                  and payment process. Limited slots available.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineDate}>Team Formation</p>
                <h3 className={styles.timelineTitle}>Team Assignments</h3>
                <p className={styles.timelineDescription}>
                  Players will be assigned to teams based on skill level and preferences.
                  Team rosters and schedules will be announced via email.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineDate}>Practice Sessions</p>
                <h3 className={styles.timelineTitle}>Team Practice</h3>
                <p className={styles.timelineDescription}>
                  Teams will have dedicated practice sessions to prepare for the tournament.
                  Build chemistry and develop strategies with your teammates.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineDate}>Main Event</p>
                <h3 className={styles.timelineTitle}>Tournament Day</h3>
                <p className={styles.timelineDescription}>
                  The main tournament begins! Compete in matches, showcase your skills,
                  and play for the championship. Prizes and trophies for winners!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Join the Action?</h2>
            <p className={styles.ctaDescription}>
              Don't miss out on this incredible football event. Register now and secure your place
              among passionate players. Limited spots available - act fast!
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/signup" className={styles.primaryCta}>
                Register Now - ₹500
              </Link>
              <Link href="/about" className={styles.secondaryCta}>
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
