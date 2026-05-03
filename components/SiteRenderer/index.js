import styles from './SiteRenderer.module.scss'

export default function SiteRenderer({ site }) {
  const theme = site.theme || {}
  const sections = site.sections || []

  const cssVars = {
    '--sf-primary': theme.primaryColor || '#6366f1',
    '--sf-bg': theme.bgColor || '#ffffff',
    '--sf-text': theme.textColor || '#111827',
    '--sf-font': theme.fontFamily || 'Inter',
  }

  return (
    <div className={styles.root} style={cssVars}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <span className={styles.navBrand}>{site.title}</span>
      </nav>

      {/* Sections */}
      {sections.map((sec, idx) => {
        if (sec.type === 'hero') return <HeroSection key={idx} content={sec.content} />
        if (sec.type === 'about') return <AboutSection key={idx} content={sec.content} />
        if (sec.type === 'contact') return <ContactSection key={idx} content={sec.content} />
        return null
      })}

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} {site.title} · Powered by SiteForge</p>
      </footer>
    </div>
  )
}

function HeroSection({ content }) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroHeading}>{content.heading || 'Welcome'}</h1>
      {content.subheading && <p className={styles.heroSub}>{content.subheading}</p>}
      {content.body && <p className={styles.heroBody}>{content.body}</p>}
      {content.ctaLabel && (
        <button className={styles.ctaBtn}>{content.ctaLabel}</button>
      )}
    </section>
  )
}

function AboutSection({ content }) {
  return (
    <section className={styles.about}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{content.heading || 'About'}</h2>
        {content.subheading && <h3 className={styles.sectionSub}>{content.subheading}</h3>}
        {content.body && <p className={styles.sectionBody}>{content.body}</p>}
      </div>
    </section>
  )
}

function ContactSection({ content }) {
  return (
    <section className={styles.contact}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{content.heading || 'Contact'}</h2>
        {content.body && <p className={styles.sectionBody}>{content.body}</p>}
        {content.email && (
          <p>
            <a href={`mailto:${content.email}`} className={styles.contactLink}>{content.email}</a>
          </p>
        )}
        <div className={styles.contactForm}>
          <input placeholder="Your name" disabled className={styles.cfInput} />
          <input placeholder="Your email" disabled className={styles.cfInput} />
          <textarea placeholder="Message" disabled className={styles.cfTextarea} />
          <button className={styles.ctaBtn} disabled>
            {content.ctaLabel || 'Send Message'}
          </button>
        </div>
      </div>
    </section>
  )
}
