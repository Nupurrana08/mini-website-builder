import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../_app'
import Layout from '../../components/Layout'
import SiteCard from '../../components/SiteCard'
import TemplateSelector from '../../components/TemplateSelector'
import styles from '../../styles/pages/dashboard.module.scss'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  // New site form
  const [newSite, setNewSite] = useState({ title: '', description: '', template: 'landing' })
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchSites()
  }, [user])

  const fetchSites = async () => {
    setLoading(true)
    const res = await fetch('/api/sites')
    const data = await res.json()
    setSites(data.sites || [])
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSite.title.trim()) { setCreateError('Title is required'); return }
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite),
    })
    const data = await res.json()
    if (!res.ok) { setCreateError(data.error); setCreating(false); return }
    setCreating(false)
    setShowCreate(false)
    setNewSite({ title: '', description: '', template: 'landing' })
    router.push(`/builder/${data.site._id}`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this site? This cannot be undone.')) return
    await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    setSites((prev) => prev.filter((s) => s._id !== id))
  }

  const totalViews = sites.reduce((acc, s) => acc + (s.pageViews || 0), 0)

  return (
    <Layout>
      <Head><title>Dashboard · SiteCraft</title></Head>

      <div className="container">
        <div className={styles.page}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Workspace</h1>
              <p className={styles.sub}>Welcome back, {user?.name?.split(' ')[0]} 👋</p>
            </div>
            <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
              + New Site
            </button>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            {[
              { label: 'Total Sites', value: sites.length },
              { label: 'Published', value: sites.filter((s) => s.published).length },
              { label: 'Total Views', value: totalViews },
            ].map((s) => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statVal}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Create form */}
          {showCreate && (
            <div className={styles.createBox}>
              <h2 className={styles.createTitle}>Create a new site</h2>
              <form onSubmit={handleCreate} className={styles.createForm}>
                <div>
                  <label className="label">Site Title *</label>
                  <input
                    className="input"
                    placeholder="My Awesome Portfolio"
                    value={newSite.title}
                    onChange={(e) => setNewSite((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input
                    className="input"
                    placeholder="What's this site about?"
                    value={newSite.description}
                    onChange={(e) => setNewSite((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Template</label>
                  <TemplateSelector
                    value={newSite.template}
                    onChange={(t) => setNewSite((p) => ({ ...p, template: t }))}
                  />
                </div>
                {createError && <p className="error-msg">{createError}</p>}
                <div className={styles.createActions}>
                  <button type="submit" className="btn btn--primary" disabled={creating}>
                    {creating ? 'Creating…' : 'Create & Edit'}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sites list */}
          {loading ? (
            <p className={styles.empty}>Loading your sites…</p>
          ) : sites.length === 0 ? (
            <div className={styles.empty}>
              <span>🌐</span>
              <p>You haven't created any sites yet.</p>
              <button className="btn btn--primary" onClick={() => setShowCreate(true)}>Create your first site</button>
            </div>
          ) : (
            <div className={styles.grid}>
              {sites.map((site) => (
                <SiteCard key={site._id} site={site} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
