import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me'
const COOKIE_NAME = 'sf_token'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

/**
 * Extracts and verifies the JWT from the request cookie.
 * Returns the decoded payload or null.
 */
export function getUserFromRequest(req) {
  const cookieHeader = req.headers.cookie || ''
  const cookies = parse(cookieHeader)
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  return verifyToken(token)
}

export function setTokenCookie(res, token) {
  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`,
  ])
}

export function clearTokenCookie(res) {
  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  ])
}
