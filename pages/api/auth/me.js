import { connectDB } from '../../../lib/mongodb'
import User from '../../../models/User'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Unauthenticated' })

  try {
    await connectDB()
    console.log('Fetching user:', payload.userId)
    const user = await User.findById(payload.userId).select('-passwordHash')
    console.log('User found:', user ? 'yes' : 'no')
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        tenantId: user.tenantId 
      } 
    })
  } catch (err) {
    console.error('[me] Error:', err.message)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
