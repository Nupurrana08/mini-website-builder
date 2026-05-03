import Link from 'next/link'
import styles from './SiteCard.module.scss'

const TEMPLATE_COLORS = {
  landing: '#6366f1',
  portfolio: '#10b981',
  business: '#f59e0b',
}

export default function SiteCard({ site, onDelete }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''

  return (
    <div className={styles.card}>
      <div className={styles.colorBar} style={{ background: TEMPLATE_COLORS[site.template] || '#6366f1' }} />

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.title}>{site.title}</h3>
          <span className={`badge badge--blue`}>{site.template}</span>
        </div>

        {site.description && (
          <p className={styles.desc}>{site.description}</p>
        )}

        <div className={styles.meta}>
          <span>{site.pageViews ?? 0} views</span>
          <span>·</span>
          <span>{new Date(site.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span className={site.published ? 'badge badge--green' : 'badge badge--gray'}>
            {site.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href={`/builder/${site._id}`} className="btn btn--ghost btn--sm">
          Edit
        </Link>
        <a
          href={`/site/${site.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--ghost btn--sm"
        >
          Preview ↗
        </a>
        <button
          className="btn btn--danger btn--sm"
          onClick={() => onDelete(site._id)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
