import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type Severity } from '@/types'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get profile for plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, min_severity')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const allowedSeverities = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].severities

  const { searchParams } = new URL(req.url)
  const severity = searchParams.get('severity')
  const isRead = searchParams.get('is_read')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('alerts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .in('severity', allowedSeverities)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (severity && allowedSeverities.includes(severity as Severity)) {
    query = query.eq('severity', severity)
  }
  if (isRead !== null) {
    query = query.eq('is_read', isRead === 'true')
  }
  if (source) {
    query = query.eq('source', source)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ alerts: data, total: count, plan })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { alert_id, read_all } = await req.json()

  if (read_all) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (alert_id) {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alert_id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
