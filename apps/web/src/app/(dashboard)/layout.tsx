import { LayoutShell } from '@/components/dashboard/LayoutShell'
import { UserProvider } from '@/contexts/UserContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LayoutShell>
        {children}
      </LayoutShell>
    </UserProvider>
  )
}
