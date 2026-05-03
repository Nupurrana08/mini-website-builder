import styles from './TemplateSelector.module.scss'

const TEMPLATES = [
  {
    id: 'landing',
    label: 'Landing Page',
    desc: 'Hero + CTA + Contact. Great for products or campaigns.',
    color: '#6366f1',
    icon: '🚀',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    desc: 'Hero + About + work showcase. Perfect for creatives.',
    color: '#10b981',
    icon: '🎨',
  },
  {
    id: 'business',
    label: 'Business',
    desc: 'Hero + About + Contact. Ideal for companies or services.',
    color: '#f59e0b',
    icon: '🏢',
  },
]

export default function TemplateSelector({ value, onChange }) {
  return (
    <div className={styles.grid}>
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${styles.card} ${value === t.id ? styles.selected : ''}`}
          style={{ '--accent': t.color }}
          onClick={() => onChange(t.id)}
        >
          <span className={styles.icon}>{t.icon}</span>
          <strong className={styles.label}>{t.label}</strong>
          <p className={styles.desc}>{t.desc}</p>
        </button>
      ))}
    </div>
  )
}
