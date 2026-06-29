'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) {
      const msg = (error as { message?: string; status?: number; name?: string }).message
        || (error as { status?: number }).status?.toString()
        || 'Neznámá chyba při registraci'
      console.error('Supabase error:', error)
      setError(msg)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold mb-2">Zkontrolujte email</h2>
          <p className="text-gray-400">
            Poslali jsme vám potvrzovací email na <strong className="text-white">{email}</strong>.
            Klikněte na odkaz v emailu pro aktivaci účtu.
          </p>
          <Link href="/auth/login" className="mt-6 inline-block text-green-400 hover:underline">
            Zpět na přihlášení
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚽</div>
          <h1 className="text-2xl font-bold">Tipovačka EURO 2028</h1>
          <p className="text-gray-400 mt-1">Vytvořte si účet</p>
        </div>

        <form onSubmit={handleRegister} className="bg-gray-900 rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Přezdívka</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="Váš herní název"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="vas@email.cz"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="Alespoň 8 znaků"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Registruji...' : 'Zaregistrovat se'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Máte již účet?{' '}
          <Link href="/auth/login" className="text-green-400 hover:underline">
            Přihlaste se
          </Link>
        </p>
      </div>
    </main>
  )
}
