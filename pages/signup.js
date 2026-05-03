import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './_app'
import Layout from '../components/Layout'
import styles from '../styles/pages/auth.module.scss'

export default function Signup() {
  const { setUser } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setUser(data.user)
      router.push('/dashboard')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Head><title>Sign up · SiteForge</title></Head>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.sub}>Your own workspace, ready in seconds</p>

          <form onSubmit={handle} className={styles.form}>
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className={styles.link}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
