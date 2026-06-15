import { LayoutShell } from '@/components/dashboard/LayoutShell'
import { UserProvider } from '@/contexts/UserContext'
import { TourProvider } from '@/contexts/TourContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TourProvider>
        <LayoutShell>
          {children}
        </LayoutShell>
      </TourProvider>
    </UserProvider>
  )
}
