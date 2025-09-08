
import AdminSidebar from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex  bg-slate-50">
      <AdminSidebar />
      <main className="w-full min-h-full">
        <div className="px-4 min-h-full   min-w-full sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}