import { connectDB } from '../../../lib/mongodb'
import Site from '../../../models/Site'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthenticated' })

  const { id } = req.query
  await connectDB()

  // Always scope to tenantId – prevents IDOR (Insecure Direct Object Reference)
  const site = await Site.findOne({ _id: id, tenantId: user.tenantId })
  if (!site) return res.status(404).json({ error: 'Site not found' })

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({ site })
  }

  // ── PUT (full/partial update from builder) ───────────────────────────────────
  if (req.method === 'PUT') {
    const allowed = ['title', 'description', 'sections', 'theme', 'published', 'seo']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const updated = await Site.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    )
    return res.status(200).json({ site: updated })
  }

  // ── DELETE ───────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    await Site.findOneAndDelete({ _id: id, tenantId: user.tenantId })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
