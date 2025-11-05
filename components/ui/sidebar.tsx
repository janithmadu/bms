"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBrandingStore } from '@/stores/useBrandingStore'
import {
  Building2,
  Calendar,
  Users,
  MapPin,
  Coins,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Palette,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { branding } = useBrandingStore()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Locations', href: '/admin/locations', icon: MapPin },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Tokens', href: '/admin/tokens', icon: Coins, adminOnly: true },
    { name: 'Branding', href: '/admin/branding', icon: Palette, adminOnly: true },
  ]

  const handleLogout = () => {
    signOut({
      callbackUrl: "/auth/login",
    });
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          {branding?.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt={branding.companyName || 'Logo'} 
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <span className="font-bold text-slate-900">
              {branding?.companyName || 'BookingHub'}
            </span>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon
                className={cn(
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section: user info + logout */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        {session?.user && (
          <div className="flex items-center mb-3">
            {/* Avatar/Icon */}

              <User className="h-10 w-10 text-gray-400" />

            {/* Name & Role */}
            <div className="ml-3 text-sm">
              <p className="font-medium text-white">{session.user.name || session.user.email}</p>
              <p className="text-gray-400">{session.user.role || 'Role not set'}</p>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
          Sign out
        </button>
      </div>
    </div>
  )
}