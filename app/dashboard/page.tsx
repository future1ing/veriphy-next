import { createClient } from '@/lib/supabase/server'
import { Alert, Profile } from '@/types'

const DB_COV = [
  { cc:'EU', flag:'🇪🇺', src:'EU Commission — MRL Database', prods:666, recs:252445, status:'ok', sync:'2026-05-28', col:'#60a5fa' },
  { cc:'MA', flag:'🇲🇦', src:'ONSSA — Index Phytosanitaire', prods:1335, recs:4645, status:'ok', sync:'2026-06-08', col:'#4ade80' },
  { cc:'ES', flag:'🇪🇸', src:'MAPA — Registro Fitosanitarios', prods:3058, recs:1972, status:'warn', sync:'2026-06-08', col:'#fb923c', warn:'408 produits expirent dans 90j' },
  { cc:'TR', flag:'🇹🇷', src:'EU Commission (couverture export)', prods:666, recs:252445, status:'ok', sync:'2026-05-28', col:'#a78bfa' },
  { cc:'EG', flag:'🇪🇬', src:'MALR — Égypte', prods:0, recs:0, status:'pend', sync:'—', col:'#94a3b8' },
] as const

const SEV_COLORS: Record<string, string> = {
  critical: 'var(--red)', warning: 'var(--ora)', info: 'var(--blu)'
}
const SEV_LABELS: Record<string, string> = {
  critical: 'Critique', warning: 'Avertissement', info: 'Information'
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5) as { data: Alert[] | null }

  const unread = (alerts || []).filter(a => !a.is_read).length
  const critical = (alerts || []).filter(a => a.severity === 'critical').length

  return (
    <div>
      {/* Urgent banner */}
      <div className="rounded-xl px-4 py-3 flex items-center justify-between mb-5 gap-3"
        style={{ background: 'var(--redd)', border: '1px solid rgba(248,113,113,.3)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
          🚨 URGENT — 12 produits espagnols expirent dans 6 jours (15/06/2026)
        </p>
        <a href="/dashboard/alerts"
          className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0"
          style={{ background: 'var(--red)', color: '#fff' }}>
          Voir →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {[
          { label: 'Non lus', val: unread, icon: '🔔', color: 'var(--ac)' },
          { label: 'Critiques', val: critical, icon: '🚨', color: 'var(--red)' },
          { label: 'Total alertes', val: alerts?.length || 0, icon: '📋', color: 'var(--blu)' },
          { label: 'Pays couverts', val: 2, icon: '🌍', color: 'var(--ora)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 relative overflow-hidden"
            style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}/>
            <div className="absolute right-3 top-3 text-xl opacity-15">{s.icon}</div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--tx3)' }}>
              {s.label}
            </p>
            <p className="text-3xl font-display font-bold text-tx">{s.val}</p>
          </div>
        ))}
      </div>

      {/* DB Coverage */}
      <div className="mb-5">
        <h3 className="font-display font-bold text-sm mb-3 text-tx">Couverture bases de données</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {DB_COV.map(d => (
            <div key={d.cc} className="rounded-xl p-3.5 flex gap-3 items-start"
              style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
              <span className="text-xl flex-shrink-0">{d.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-tx mb-0.5">{d.cc} — {d.src.split('—')[0].trim()}</p>
                <p className="text-[10.5px] mb-1.5" style={{ color: 'var(--tx3)' }}>{d.src}</p>
                <div className="flex gap-3 text-[11px] flex-wrap">
                  {d.recs > 0 ? (
                    <>
                      <span style={{ color: 'var(--tx2)' }}><strong className="text-tx">{d.prods.toLocaleString()}</strong> produits</span>
                      <span style={{ color: 'var(--tx2)' }}><strong className="text-tx">{d.recs.toLocaleString()}</strong> enreg.</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--tx3)' }}>En attente</span>
                  )}
                </div>
                {'warn' in d && d.warn && (
                  <p className="text-[10.5px] mt-1" style={{ color: 'var(--ora)' }}>⚠️ {d.warn}</p>
                )}
                <div className="h-0.5 rounded mt-2" style={{ background: 'var(--sf3)' }}>
                  <div className="h-full rounded transition-all" style={{
                    width: d.recs > 0 ? '100%' : '0%',
                    background: d.col
                  }}/>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{
                background: d.status === 'ok' ? 'var(--ac)' : d.status === 'warn' ? 'var(--ora)' : 'var(--tx3)'
              }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Recent alerts */}
      <div className="rounded-xl p-5" style={{ background: 'var(--sf)', border: '1px solid var(--bd)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold text-sm text-tx">Dernières alertes réglementaires</h3>
          <a href="/dashboard/alerts" className="text-xs" style={{ color: 'var(--ac)' }}>Voir tout →</a>
        </div>
        {(alerts || []).length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--tx3)' }}>
            <div className="text-3xl mb-2 opacity-40">✅</div>
            <p>Aucune alerte pour vos cultures</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(alerts || []).map(alert => (
              <div key={alert.id} className="grid gap-3 p-3.5 rounded-lg"
                style={{
                  gridTemplateColumns: '4px 1fr auto',
                  background: alert.is_read ? 'var(--sf)' : 'var(--sf2)',
                  border: `1px solid ${alert.is_read ? 'var(--bd)' : 'var(--bd)'}`,
                  borderLeft: `3px solid ${SEV_COLORS[alert.severity]}`,
                }}>
                <div/>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                      style={{
                        background: `${SEV_COLORS[alert.severity]}22`,
                        color: SEV_COLORS[alert.severity]
                      }}>
                      {SEV_LABELS[alert.severity]}
                    </span>
                    <span className="text-[10.5px] px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--sf3)', color: 'var(--tx3)' }}>
                      {alert.country}
                    </span>
                    <span className="text-sm font-semibold text-tx">{alert.substance_name}</span>
                    {!alert.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--ac)' }}/>
                    )}
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--tx2)' }}>{alert.description}</p>
                  <div className="flex gap-3 text-[11px] flex-wrap" style={{ color: 'var(--tx3)' }}>
                    {alert.product_name && <span>🌿 {alert.product_name}</span>}
                    {alert.old_mrl && alert.new_mrl && (
                      <span>{alert.old_mrl} → <strong style={{ color: 'var(--ac)' }}>{alert.new_mrl} mg/kg</strong></span>
                    )}
                    {alert.regulation && <span>📋 {alert.regulation}</span>}
                  </div>
                </div>
                <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--tx3)' }}>
                  {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
