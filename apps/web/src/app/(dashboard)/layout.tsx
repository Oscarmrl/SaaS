import { Sidebar } from '@/components/dashboard/Sidebar'
import { UserProvider } from '@/contexts/UserContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="flex-1 ml-[72px] overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  )
}
