import { connectDB } from '../../../lib/mongodb'
import User from '../../../models/User'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    console.log('Login attempt:', email)
    console.log('MongoDB URI set:', !!process.env.MONGODB_URI)
    await connectDB()

    // passwordHash is excluded by default; we explicitly select it here
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const tenantId = user.tenantId?.toString() || user._id.toString()
    const token = signToken({ userId: user._id.toString(), tenantId })
    setTokenCookie(res, token)

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('[login] Error:', err.message, err.stack)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
