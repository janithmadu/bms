"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Building2, Calendar, Users, MapPin, Settings, LogOut, BarChart3, Coins, Palette } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useBrandingStore } from '@/stores/useBrandingStore'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Venues', href: '/admin/venues', icon: MapPin },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Tokens', href: '/admin/tokens', icon: Coins },
  { name: 'Branding', href: '/admin/branding', icon: Palette },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { branding } = useBrandingStore()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-slate-200">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-200">
          <Link href="/admin" className="flex items-center space-x-3">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName || 'Logo'} 
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-900">{branding?.companyName || 'BookingHub'}</span>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-3 py-4">
          <div className="space-y-1">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                // Hide branding for non-admin users
                if (item.name === 'Branding' && session?.user.role !== 'admin') {
                  return null
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive
                          ? 'text-blue-700'
                          : 'text-slate-400 group-hover:text-slate-500'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-200 p-4">
        {session?.user && (
          <div className="mb-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-slate-500">{session.user.role || 'User'}</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-slate-700 hover:text-slate-900"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}