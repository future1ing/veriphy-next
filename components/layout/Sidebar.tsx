'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  role: 'client' | 'admin'
  userName: string
  unreadCount?: number
}

const clientNav = [
  { href: '/dashboard',          icon: '⬡',  label: 'Tableau de bord' },
  { href: '/dashboard/alerts',   icon: '🔔', label: 'Alertes',         badge: true },
  { href: '/dashboard/profile',  icon: '🌿', label: 'Mes cultures' },
  { href: '/dashboard/pricing',  icon: '💳', label: 'Tarifs' },
]

const adminNav = [
  { href: '/admin',              icon: '⬡',  label: 'Dashboard' },
  { href: '/admin/alerts',       icon: '🔔', label: 'Alertes',         badge: true },
  { href: '/admin/clients',      icon: '👥', label: 'Clients' },
  { href: '/admin/databases',    icon: '🗄️', label: 'Bases données' },
  { href: '/admin/stats',        icon: '📊', label: 'Statistiques' },
  { href: '/admin/pipeline',     icon: '⚙️', label: 'Pipeline' },
  { href: '/admin/pricing',      icon: '💳', label: 'Tarifs' },
]

export default function Sidebar({ role, userName, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const nav = role === 'admin' ? adminNav : clientNav

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen flex flex-col fixed top-0 bottom-0 z-50 overflow-y-auto"
      style={{ background: 'var(--sf)', borderRight: '1px solid var(--bd)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent">
          <svg width="16" height="16" viewBox="0 0 18 18">
            <polygon points="9,1.5 15,5 15,13 9,16.5 3,13 3,5" fill="none" stroke="#0b0f0e" strokeWidth="1.3"/>
            <line x1="9" y1="1.5" x2="9" y2="16.5" stroke="#0b0f0e" strokeWidth=".9" opacity=".5"/>
            <line x1="3" y1="5" x2="15" y2="13" stroke="#0b0f0e" strokeWidth=".9" opacity=".5"/>
            <line x1="15" y1="5" x2="3" y2="13" stroke="#0b0f0e" strokeWidth=".9" opacity=".5"/>
            <circle cx="9" cy="9" r="2.5" fill="#0b0f0e"/>
          </svg>
        </div>
        <span className="font-display font-bold text-base text-tx">Veriphy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5 mt-2"
          style={{ color: 'var(--tx3)' }}>
          {role === 'admin' ? 'Administration' : 'Menu'}
        </p>
        {nav.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-sm transition-all"
              style={{
                background: isActive ? 'var(--acd)' : 'transparent',
                color: isActive ? 'var(--ac)' : 'var(--tx2)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--red)', color: '#fff' }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3.5" style={{ borderTop: '1px solid var(--bd)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--acd)', border: '1.5px solid var(--ac)', color: 'var(--ac)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-tx">{userName}</p>
            <p className="text-[11px]" style={{ color: 'var(--tx3)' }}>
              {role === 'admin' ? 'Administrateur' : 'Client'}
            </p>
          </div>
          <button onClick={handleLogout} className="p-1 rounded text-sm transition-colors"
            style={{ color: 'var(--tx3)' }}
            title="Déconnexion">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}
