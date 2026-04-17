const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || 'ql_access'
const ACCESS_COOKIE_TOKEN = process.env.ACCESS_COOKIE_TOKEN || ''

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        const key = index >= 0 ? part.slice(0, index) : part
        const value = index >= 0 ? part.slice(index + 1) : ''
        return [key, decodeURIComponent(value)]
      })
  )
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    return
  }

  const cookies = parseCookies(req.headers.cookie)
  const expected = ACCESS_COOKIE_TOKEN || 'dev_only_token_change_me'
  const authed = cookies[ACCESS_COOKIE_NAME] === expected

  res.status(200).json({ ok: true, authed })
}
