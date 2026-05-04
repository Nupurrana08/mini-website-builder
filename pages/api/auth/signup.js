import { connectDB } from '../../../lib/mongodb'
import User from '../../../models/User'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    await connectDB()

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      tenantId: null, // Will be set to _id after creation
    })

    // Set tenantId = _id (self-tenant model)
    user.tenantId = user._id
    await user.save()

    const token = signToken({ userId: user._id.toString(), tenantId: user._id.toString() })
    setTokenCookie(res, token)

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, tenantId: user.tenantId },
    })
  } catch (err) {
    console.error('[signup]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
