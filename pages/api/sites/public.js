import { connectDB } from '../../../lib/mongodb'
import Site from '../../../models/Site'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { slug } = req.query
  await connectDB()

  const site = await Site.findOneAndUpdate(
    { slug, published: true },
    { $inc: { pageViews: 1 } }, // atomic increment – safe for concurrent requests
    { new: true }
  )
    .select('-tenantId -owner')
    .lean()

  if (!site) return res.status(404).json({ error: 'Site not found' })

  return res.status(200).json({ site })
}
