const crypto = require('crypto')

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || ''
const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || 'ql_access'
const ACCESS_COOKIE_TOKEN = process.env.ACCESS_COOKIE_TOKEN || ''

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '')
  const rightBuffer = Buffer.from(right || '')
  if (leftBuffer.length !== rightBuffer.length) return false
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function createCookieValue() {
  const token = ACCESS_COOKIE_TOKEN || 'dev_only_token_change_me'
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return ACCESS_COOKIE_NAME + '=' + encodeURIComponent(token) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000' + secureFlag
}

function getPasswordFromBody(body) {
  if (!body) return ''

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body)
      return typeof parsed?.password === 'string' ? parsed.password.trim() : ''
    } catch {
      return ''
    }
  }

  if (Buffer.isBuffer(body)) {
    try {
      const parsed = JSON.parse(body.toString('utf-8'))
      return typeof parsed?.password === 'string' ? parsed.password.trim() : ''
    } catch {
      return ''
    }
  }

  if (typeof body === 'object') {
    return typeof body.password === 'string' ? body.password.trim() : ''
  }

  return ''
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    return
  }

  if (!ACCESS_PASSWORD) {
    res.status(500).json({ ok: false, message: 'ACCESS_PASSWORD is not configured' })
    return
  }

  const password = getPasswordFromBody(req.body)
  const valid = safeEqual(password, ACCESS_PASSWORD)

  if (!valid) {
    res.status(401).json({ ok: false, message: 'Invalid password' })
    return
  }

  res.setHeader('Set-Cookie', createCookieValue())
  res.status(200).json({ ok: true })
}
