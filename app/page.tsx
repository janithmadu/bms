import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, Calendar, Coins, Users, ArrowRight, MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">BookingHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/booking">Book a Room</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8">
            Modern Meeting Room
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Booking System
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your meeting room reservations with our premium booking platform. 
            Smart token management meets beautiful design.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
              <Link href="/booking">
                Start Booking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">
                Admin Dashboard
                <Building2 className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Multiple Locations</h3>
              <p className="text-sm text-slate-600">Manage bookings across all your office locations</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Booking</h3>
              <p className="text-sm text-slate-600">Intuitive calendar with conflict detection</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Coins className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Token System</h3>
              <p className="text-sm text-slate-600">Fair usage management with automatic renewal</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Team Friendly</h3>
              <p className="text-sm text-slate-600">Perfect for teams of all sizes and needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 border-t border-white/20 mt-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">BookingHub</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 BookingHub. Built with Next.js and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  )
}