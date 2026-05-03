import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from './_app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/pages/home.module.scss'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user])

  return (
    <Layout>
      <Head><title>SiteCraft – Build your site</title></Head>

      <section className={styles.hero}>
        <div className="container">
          <span className={styles.badge}>Multi-tenant website builder</span>
          <h1 className={styles.heading}>
            Your website,<br />live in minutes.
          </h1>
          <p className={styles.sub}>
            Pick a template, fill in your content, hit publish. <br />
            SiteCraft gives every user their own workspace and public URL.
          </p>
          <div className={styles.ctas}>
            <Link href="/signup" className="btn btn--primary btn--lg">Get started free</Link>
            <Link href="/login" className="btn btn--ghost btn--lg">Sign in</Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            {[
              { icon: '🔐', title: 'Isolated workspaces', desc: 'Every account is a separate tenant. Your data never leaks.' },
              { icon: '🎨', title: '3 templates', desc: 'Landing, Portfolio, or Business — pick and customise.' },
              { icon: '⚡', title: 'Live preview', desc: 'See your changes reflected instantly as you type.' },
              { icon: '🌐', title: 'Public URLs', desc: 'Every site gets a public /site/:slug address.' },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
