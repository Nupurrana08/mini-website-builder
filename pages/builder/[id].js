import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../_app'
import LiveEditor from '../../components/LiveEditor'
import styles from '../../styles/pages/builder.module.scss'

export default function BuilderPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = router.query

  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (!id) return
    fetch(`/api/sites/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setSite(d.site); setLoading(false) })
      .catch(() => { setError('Site not found'); setLoading(false) })
  }, [id, user])

  const handleSave = async (form) => {
    setSaving(true)
    setSavedMsg('')
    const res = await fetch(`/api/sites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setSite(data.site)
      setSavedMsg('Saved!')
      setTimeout(() => setSavedMsg(''), 2500)
    }
  }

  if (loading) return <div className={styles.center}>Loading editor…</div>
  if (error)   return <div className={styles.center}>{error}</div>

  return (
    <>
      <Head><title>Editing: {site?.title} · SiteForge</title></Head>

      {/* Minimal top bar for the builder (no full Layout to maximise screen space) */}
      <div className={styles.topBar}>
        <button className="btn btn--ghost btn--sm" onClick={() => router.push('/dashboard')}>
          ← Dashboard
        </button>
        <span className={styles.siteName}>{site?.title}</span>
        {savedMsg && <span className={styles.saved}>{savedMsg}</span>}
        <a
          href={`/site/${site?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--ghost btn--sm"
        >
          View live ↗
        </a>
      </div>

      {site && <LiveEditor site={site} onSave={handleSave} saving={saving} />}
    </>
  )
}
