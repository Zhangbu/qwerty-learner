import { loginWithPassword } from '@/auth/client'
import React, { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => Promise<void> | void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchParams = new URLSearchParams(location.search)
  const nextPath = searchParams.get('next') || '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password.trim()) {
      setError('请输入访问密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      await loginWithPassword(password)
      await onLoginSuccess()
      navigate(nextPath, { replace: true })
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Invalid password') {
          setError('密码不正确，请重试')
        } else if (err.message === 'ACCESS_PASSWORD is not configured') {
          setError('服务端未配置 ACCESS_PASSWORD 环境变量')
        } else {
          setError(err.message)
        }
      } else {
        setError('登录失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 dark:bg-slate-900'>
      <section className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800'>
        <h1 className='mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100'>Qwerty Learner</h1>
        <p className='mb-6 text-sm text-slate-600 dark:text-slate-300'>该站点已开启访问保护，请输入密码继续。</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <label className='block text-sm font-medium text-slate-700 dark:text-slate-200' htmlFor='access-password'>
            访问密码
          </label>
          <input
            id='access-password'
            type='password'
            autoComplete='current-password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className='w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
            placeholder='请输入密码'
          />

          {error ? <p className='text-sm text-red-500'>{error}</p> : null}

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {loading ? '验证中...' : '进入网站'}
          </button>
        </form>
      </section>
    </main>
  )
}
