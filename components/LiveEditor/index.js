import { useState } from 'react'
import SiteRenderer from '../SiteRenderer'
import styles from './LiveEditor.module.scss'

const SECTION_LABELS = { hero: 'Hero', about: 'About', contact: 'Contact' }
const FONTS = ['Inter', 'Georgia', 'Roboto Mono']

export default function LiveEditor({ site, onSave, saving }) {
  const [form, setForm] = useState({
    title: site.title,
    description: site.description || '',
    sections: site.sections ? JSON.parse(JSON.stringify(site.sections)) : [],
    theme: site.theme || { primaryColor: '#6366f1', bgColor: '#ffffff', textColor: '#111827', fontFamily: 'Inter' },
    published: site.published ?? true,
  })
  const [activeTab, setActiveTab] = useState('content')

  const updateSection = (idx, field, value) => {
    setForm((prev) => {
      const sections = [...prev.sections]
      sections[idx] = {
        ...sections[idx],
        content: { ...sections[idx].content, [field]: value },
      }
      return { ...prev, sections }
    })
  }

  const updateTheme = (key, value) => {
    setForm((prev) => ({ ...prev, theme: { ...prev.theme, [key]: value } }))
  }

  return (
    <div className={styles.root}>
      {/* ── Left panel ── */}
      <aside className={styles.panel}>
        <div className={styles.tabs}>
          {['content', 'theme', 'settings'].map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.panelBody}>
          {/* Content tab */}
          {activeTab === 'content' && (
            <>
              <div className={styles.field}>
                <label className="label">Site Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {form.sections.map((sec, idx) => (
                <div key={idx} className={styles.sectionBlock}>
                  <div className={styles.sectionTitle}>{SECTION_LABELS[sec.type] || sec.type}</div>

                  {['heading', 'subheading', 'body', 'ctaLabel', 'email'].map((field) => (
                    sec.content[field] !== undefined && (
                      <div className={styles.field} key={field}>
                        <label className="label">{field}</label>
                        {field === 'body' ? (
                          <textarea
                            className="textarea"
                            value={sec.content[field]}
                            onChange={(e) => updateSection(idx, field, e.target.value)}
                          />
                        ) : (
                          <input
                            className="input"
                            value={sec.content[field]}
                            onChange={(e) => updateSection(idx, field, e.target.value)}
                          />
                        )}
                      </div>
                    )
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Theme tab */}
          {activeTab === 'theme' && (
            <>
              {[
                { key: 'primaryColor', label: 'Primary Color' },
                { key: 'bgColor', label: 'Background' },
                { key: 'textColor', label: 'Text Color' },
              ].map(({ key, label }) => (
                <div className={styles.field} key={key}>
                  <label className="label">{label}</label>
                  <div className={styles.colorRow}>
                    <input
                      type="color"
                      value={form.theme[key]}
                      onChange={(e) => updateTheme(key, e.target.value)}
                      className={styles.colorPicker}
                    />
                    <input
                      className="input"
                      value={form.theme[key]}
                      onChange={(e) => updateTheme(key, e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className={styles.field}>
                <label className="label">Font Family</label>
                <select
                  className="input"
                  value={form.theme.fontFamily}
                  onChange={(e) => updateTheme('fontFamily', e.target.value)}
                >
                  {FONTS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className={styles.field}>
              <label className="label">Visibility</label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                />
                <span>{form.published ? 'Published (public)' : 'Draft (hidden)'}</span>
              </label>
              <p className={styles.hint}>
                Public URL: <code>/site/{site.slug}</code>
              </p>
            </div>
          )}
        </div>

        <div className={styles.panelFooter}>
          <button
            className="btn btn--primary"
            onClick={() => onSave(form)}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </aside>

      {/* ── Preview pane ── */}
      <div className={styles.preview}>
        <div className={styles.previewBar}>
          <span>Live Preview</span>
          <a href={`/site/${site.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
            Open ↗
          </a>
        </div>
        <div className={styles.previewFrame}>
          <SiteRenderer site={{ ...site, ...form }} />
        </div>
      </div>
    </div>
  )
}
