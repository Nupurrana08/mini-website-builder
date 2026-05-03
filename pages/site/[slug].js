import Head from 'next/head'
import SiteRenderer from '../../components/SiteRenderer'

/**
 * Public-facing site page.
 * Uses getServerSideProps so page views are counted on every real visit.
 * Accessible without authentication.
 */
export default function PublicSitePage({ site, notFound }) {
  if (notFound) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: '#6b7280' }}>
        <span style={{ fontSize: '3rem' }}>🔍</span>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Site not found</h1>
        <p style={{ fontSize: '.9rem' }}>This site doesn't exist or hasn't been published yet.</p>
        <a href="/" style={{ color: '#6366f1', fontWeight: 600, fontSize: '.9rem' }}>← Back to SiteForge</a>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{site.seo?.metaTitle || site.title}</title>
        {site.seo?.metaDescription && (
          <meta name="description" content={site.seo.metaDescription} />
        )}
        <meta property="og:title" content={site.title} />
        {site.description && <meta property="og:description" content={site.description} />}
      </Head>
      <SiteRenderer site={site} />
    </>
  )
}

export async function getServerSideProps({ params }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${base}/api/sites/public?slug=${params.slug}`)
    if (!res.ok) return { props: { notFound: true, site: null } }
    const data = await res.json()
    return {
      props: {
        site: JSON.parse(JSON.stringify(data.site)),
        notFound: false,
      },
    }
  } catch {
    return { props: { notFound: true, site: null } }
  }
}
