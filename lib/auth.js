import crypto from 'crypto'
import { connectDB } from './mongodb'
import User from '../models/User'

const SECRET_KEY = process.env.JWT_SECRET || 'just-need-motivation-ultra-secure-secret-key-2026'
const HASH_ITERATIONS = 1000
const HASH_KEYLEN = 64
const HASH_ALGO = 'sha512'

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_ALGO).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a password against a stored PBKDF2 hash
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false
  const [salt, originalHash] = storedHash.split(':')
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_ALGO).toString('hex')
  return hash === originalHash
}

/**
 * Create a secure HMAC token containing payload
 */
export function createToken(payload) {
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  const tokenPayload = { ...payload, exp: expiry }
  
  const base64Payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  
  const hmac = crypto.createHmac('sha256', SECRET_KEY)
  hmac.update(base64Payload)
  const signature = hmac.digest('base64url')
  
  return `${base64Payload}.${signature}`
}

/**
 * Verify and decode an HMAC token
 */
export function verifyToken(token) {
  if (!token || !token.includes('.')) return null
  
  const [base64Payload, signature] = token.split('.')
  
  const hmac = crypto.createHmac('sha256', SECRET_KEY)
  hmac.update(base64Payload)
  const expectedSignature = hmac.digest('base64url')
  
  if (signature !== expectedSignature) {
    return null // Token has been tampered with
  }
  
  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'))
    if (Date.now() > payload.exp) {
      return null // Token has expired
    }
    return payload
  } catch {
    return null
  }
}

/**
 * Extract authenticated user document from request cookies
 */
export async function getUserFromRequest(request) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded || !decoded.userId) return null
  
  await connectDB()
  const user = await User.findById(decoded.userId)
  return user
}
