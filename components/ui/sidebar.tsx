"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, MapPin, Coins, BarChart3, Settings, Calendar } from 'lucide-react'
  Building2, 
  DoorOpen, 
  Calendar, 
  Coins, 
  Menu, 
  X,
  LogOut,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

const navigation = [
  {
    name: 'Dashboard',
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    href: '/admin',
    icon: Home,
  },
  {
    name: 'Locations',
    href: '/admin/locations',
    icon: Building2,
  },
  {
    name: 'Boardrooms',
    href: '/admin/boardrooms',
    icon: DoorOpen,
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    name: 'Tokens',
    href: '/admin/tokens',
    icon: Coins,
  },
]

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900">BookingHub</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mr-3",
                    isActive ? "text-blue-700" : "text-slate-500"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="w-full justify-start text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}