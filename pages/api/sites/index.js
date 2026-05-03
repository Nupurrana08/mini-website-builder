import { connectDB } from '../../../lib/mongodb'
import Site from '../../../models/Site'
import { getUserFromRequest } from '../../../lib/auth'
import { slugify } from '../../../lib/slugify'

export default async function handler(req, res) {
  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthenticated' })

  await connectDB()

  // ── GET /api/sites ──────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    /**
     * TENANT ISOLATION: every query is scoped to the user's tenantId.
     * A user can never retrieve another tenant's sites.
     */
    const sites = await Site.find({ tenantId: user.tenantId })
      .sort({ createdAt: -1 })
      .select('title slug template published pageViews createdAt updatedAt description')
      .lean()

    return res.status(200).json({ sites })
  }

  // ── POST /api/sites ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { title, description, template } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Title is required' })

    // Generate a unique slug (append random suffix on collision)
    let baseSlug = slugify(title)
    let slug = baseSlug
    let collision = await Site.findOne({ slug })
    if (collision) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
    }

    // Default sections based on template
    const defaultSections = buildDefaultSections(template || 'landing')

    const site = await Site.create({
      tenantId: user.tenantId,
      owner: user.userId,
      title,
      description: description || '',
      slug,
      template: template || 'landing',
      sections: defaultSections,
    })

    return res.status(201).json({ site })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function buildDefaultSections(template) {
  const base = [
    {
      type: 'hero',
      content: {
        heading: 'Welcome to my site',
        subheading: 'Built with SiteForge',
        body: '',
        ctaLabel: 'Get Started',
        email: '',
      },
    },
    {
      type: 'about',
      content: {
        heading: 'About',
        subheading: '',
        body: 'Tell your story here.',
        ctaLabel: '',
        email: '',
      },
    },
  ]

  if (template === 'business' || template === 'landing') {
    base.push({
      type: 'contact',
      content: {
        heading: 'Contact Us',
        subheading: '',
        body: '',
        ctaLabel: 'Send Message',
        email: '',
      },
    })
  }

  return base
}
