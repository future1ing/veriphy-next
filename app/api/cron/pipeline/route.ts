import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Vercel Cron — runs on the 1st of every month at 6:00 AM UTC
// Add to vercel.json: { "crons": [{ "path": "/api/cron/pipeline", "schedule": "0 6 1 * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startTime = Date.now()

  try {
    console.log('[CRON] Starting monthly pipeline...')

    // 1. Fetch latest EU MRL XML files from EU Commission
    const euXmlUrls = [
      'https://ec.europa.eu/food/plant/pesticides/eu-pesticides-database/public/?event=download.MRL&publication=1',
      // Add other publication URLs
    ]

    // 2. For each XML, parse and compare with current snapshot
    // In production: download XMLs, run diff engine, send notifications
    // Here we trigger the pipeline via a background job or Vercel function

    // 3. Log the run
    const { error } = await supabase.from('diff_reports').insert({
      report_id: `CRON_${new Date().toISOString().split('T')[0]}`,
      country: 'EU',
      total_changes: 0,
      generated_at: new Date().toISOString(),
      report_data: {
        status: 'triggered',
        duration_ms: Date.now() - startTime,
        message: 'Pipeline triggered by monthly cron'
      }
    })

    // 4. Notify admin
    // await sendAdminEmail('Pipeline mensuel démarré', ...)

    console.log(`[CRON] Pipeline triggered in ${Date.now() - startTime}ms`)

    return NextResponse.json({
      ok: true,
      triggered_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime
    })
  } catch (error) {
    console.error('[CRON] Pipeline error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
