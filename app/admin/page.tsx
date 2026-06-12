import { createClient, createAdminClient } from '@/lib/supabase/server'
import { PLAN_PRICES } from '@/types'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  // Real stats from Supabase
  const [
    { count: totalClients },
    { count: activeClients },
    { count: totalAlerts },
    { count: criticalAlerts },
    { data: planDist },
    { data: lastReport },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client').eq('is_active', true),
    supabase.from('alerts').select('*', { count: 'exact', head: true }),
    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
    supabase.from('profiles').select('plan').eq('role', 'client'),
    supabase.from('diff_reports').select('*').order('generated_at', { ascending: false }).limit(1),
  ])

  // Calculate MRR
  const mrr = (planDist || []).reduce((sum, p) => {
    return sum + (PLAN_PRICES[p.plan as keyof typeof PLAN_PRICES] || 0)
  }, 0)

  const planCounts = (planDist || []).reduce((acc, p) => {
    acc[p.plan] = (acc[p.plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    { label: 'Clients actifs', val: activeClients || 0, icon: '👥', color: 'var(--ac)', sub: `${totalClients} total` },
    { label: 'Alertes envoyées', val: totalAlerts || 0, icon: '📬', color: 'var(--blu)' },
    { label: 'Alertes critiques', val: criticalAlerts || 0, icon: '🚨', color: 'var(--red)' },
    { label: 'MRR estimé', val: `${mrr}€`, icon: '💶', color: 'var(--ora)', sub: 'mensuel récurrent' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-tx tracking-tight">Administration</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--tx2)' }}>
          Dernière synchro: 08/06/2026 · 3 bases actives
        </p>
      </div>

      {/* Urgent banner */}
      <div className="rounded-xl px-4 py-3 flex items-center justify-between mb-5 gap-3"
        style={{ background: 'var(--redd)', border: '1px solid rgba(248,113,113,.3)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
          🚨 URGENT — 12 produits espagnols (MAPA) expirent dans 6 jours — clients ES à notifier
        </p>
        <a href="/admin/pipeline"
          className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
          style={{ background: 'var(--red)', color: '#fff' }}>
          Lancer pipeline →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-4 relative overflow-hidden"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}/>
            <div className="absolute right-3 top-3 text-xl opacity-15">{s.icon}</div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--tx3)' }}>
              {s.label}
            </p>
            <p className="text-3xl font-display font-bold text-tx">{s.val}</p>
            {s.sub && <p className="text-[11px] mt-1" style={{ color: 'var(--tx3)' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Plans distribution */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
          <h3 className="font-display font-bold text-sm mb-4 text-tx">Distribution des plans</h3>
          {(['free','starter','pro','business'] as const).map(plan => {
            const count = planCounts[plan] || 0
            const total = totalClients || 1
            const pct = Math.round((count / total) * 100)
            const colors = { free: 'var(--tx3)', starter: 'var(--blu)', pro: 'var(--ac)', business: 'var(--ora)' }
            return (
              <div key={plan} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold uppercase tracking-wide" style={{ color: colors[plan] }}>
                    {plan}
                  </span>
                  <span style={{ color: 'var(--tx2)' }}>{count} clients · {pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--sf3)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[plan] }}/>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
          <h3 className="font-display font-bold text-sm mb-4 text-tx">Actions rapides</h3>
          <div className="space-y-2.5">
            {[
              { label: '🔄 Lancer le pipeline diff', href: '/admin/pipeline', color: 'var(--ac)' },
              { label: '👥 Gérer les clients', href: '/admin/clients', color: 'var(--blu)' },
              { label: '🗄️ Explorer les bases', href: '/admin/databases', color: 'var(--ora)' },
              { label: '📊 Voir les statistiques', href: '/admin/stats', color: 'var(--tx2)' },
            ].map(action => (
              <a key={action.href} href={action.href}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{ background: 'var(--sf2)', border: '1px solid var(--bd)', color: action.color }}>
                <span>{action.label}</span>
                <span style={{ color: 'var(--tx3)' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
