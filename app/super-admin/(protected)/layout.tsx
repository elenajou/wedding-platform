import { redirect } from 'next/navigation'
import { getSuperAdminSession } from '@/lib/auth'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSuperAdminSession()
  if (!session) redirect('/super-admin/login')
  return <>{children}</>
}
