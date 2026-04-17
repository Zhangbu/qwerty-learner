const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || 'ql_access'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' })
    return
  }

  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const cookieValue = ACCESS_COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' + secureFlag
  res.setHeader('Set-Cookie', cookieValue)
  res.status(200).json({ ok: true })
}
