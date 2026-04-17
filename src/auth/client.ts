export async function checkSession() {
  const response = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' })
  if (!response.ok) return false
  const data = (await response.json()) as { authed?: boolean }
  return Boolean(data.authed)
}

export async function loginWithPassword(password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    let message = '登录失败，请检查服务端配置'
    try {
      const data = (await response.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      // ignore parse error and keep fallback message
    }
    throw new Error(message)
  }
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}
