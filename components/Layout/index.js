import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../pages/_app'
import styles from './Layout.module.scss'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link href={user ? '/dashboard' : '/'} className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            SiteCraft
          </Link>

          <nav className={styles.nav}>
            {user ? (
              <>
                <Link href="/dashboard" className={router.pathname.startsWith('/dashboard') ? styles.active : ''}>
                  Dashboard
                </Link>
                <span className={styles.divider} />
                <span className={styles.userName}>{user.name}</span>
                <button className="btn btn--ghost btn--sm" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/signup" className="btn btn--primary btn--sm">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} SiteCraft · Built for evaluation purposes</p>
      </footer>
    </div>
  )
}
