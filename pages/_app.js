import '../styles/_reset.scss'
import '../styles/globals.scss'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data?.user || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span style={{ color: '#6b7280', fontSize: '1rem' }}>Loading…</span>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}
