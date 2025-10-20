import AdminSidebar from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import UseStoreInitiate from '@/components/UseStoreInitiate'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <UseStoreInitiate/>
      <main className="ml-64 w-[calc(100%-16rem)] min-h-full">
        <div className="px-4 min-h-full min-w-full sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
