'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fr'|'ar'|'es'|'en'>('fr')

  const labels = {
    fr: { title: 'Veille réglementaire pesticides', btn: 'Se connecter', emailL: 'Email', pwL: 'Mot de passe', err: 'Email ou mot de passe incorrect.' },
    ar: { title: 'مراقبة تنظيم المبيدات', btn: 'دخول', emailL: 'البريد', pwL: 'كلمة المرور', err: 'بريد أو كلمة مرور غير صحيحة.' },
    es: { title: 'Vigilancia regulatoria de pesticidas', btn: 'Entrar', emailL: 'Correo', pwL: 'Contraseña', err: 'Email o contraseña incorrectos.' },
    en: { title: 'Pesticide regulatory monitoring', btn: 'Sign in', emailL: 'Email', pwL: 'Password', err: 'Invalid email or password.' },
  }
  const L = labels[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError || !data.user) {
      setError(L.err)
      setLoading(false)
      return
    }

    // Get role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,222,128,0.08), transparent 70%), var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-11"
        style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 22 22">
              <polygon points="11,2 18,6.5 18,15.5 11,20 4,15.5 4,6.5" fill="none" stroke="#0b0f0e" strokeWidth="1.5"/>
              <line x1="11" y1="2" x2="11" y2="20" stroke="#0b0f0e" strokeWidth="1" opacity=".5"/>
              <line x1="4" y1="6.5" x2="18" y2="15.5" stroke="#0b0f0e" strokeWidth="1" opacity=".5"/>
              <line x1="18" y1="6.5" x2="4" y2="15.5" stroke="#0b0f0e" strokeWidth="1" opacity=".5"/>
              <circle cx="11" cy="11" r="3" fill="#0b0f0e"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-tx">Veriphy</h1>
            <p className="text-xs text-tx3">{L.title}</p>
          </div>
        </div>

        {/* Lang switcher */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['fr','ar','es','en'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                border: '1px solid var(--bd)',
                background: lang === l ? 'var(--acd)' : 'transparent',
                borderColor: lang === l ? 'var(--ac)' : 'var(--bd)',
                color: lang === l ? 'var(--ac)' : 'var(--tx2)',
              }}
            >
              {l === 'fr' ? '🇫🇷 FR' : l === 'ar' ? '🇲🇦 AR' : l === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--tx2)' }}>
              {L.emailL}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx)' }}
              onFocus={e => e.target.style.borderColor = 'var(--ac)'}
              onBlur={e => e.target.style.borderColor = 'var(--bd)'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--tx2)' }}>
              {L.pwL}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: 'var(--tx)' }}
              onFocus={e => e.target.style.borderColor = 'var(--ac)'}
              onBlur={e => e.target.style.borderColor = 'var(--bd)'}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-display font-bold text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--ac)', color: '#0b0f0e' }}
          >
            {loading ? '...' : L.btn}
          </button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--tx3)' }}>
          Pas encore de compte ?{' '}
          <a href="/register" className="underline" style={{ color: 'var(--ac)' }}>
            Créer un accès
          </a>
        </p>
      </div>
    </div>
  )
}
