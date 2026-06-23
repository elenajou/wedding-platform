import { redirect } from 'next/navigation'
import { getDashboardSession } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getDashboardSession()
  if (!session) redirect('/dashboard/login')
  return <>{children}</>
}
