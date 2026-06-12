import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { count: unreadCount } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" userName={profile?.name || 'Admin'} unreadCount={unreadCount || 0} />
      <main className="ml-60 flex-1 p-7 min-h-screen">
        {children}
      </main>
    </div>
  )
}
