import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  Coins,
  Users,
  ArrowRight,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/10 to-blue-400/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="font-bold text-2xl text-slate-900">
                BookingHub
              </span>
              <p className="text-sm text-slate-600">Premium Meeting Spaces</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-white/50">
              <Link href="/booking">Book a Room</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              <Link href="/auth/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-8">
            <Star className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm font-medium text-slate-700">
              Trusted by 500+ Companies
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-8 leading-tight">
            Modern Meeting Room
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block">
              Booking Revolution
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your workspace with our intelligent booking platform.
            <span className="font-semibold text-slate-700">
              Smart token management
            </span>{" "}
            meets
            <span className="font-semibold text-slate-700">
              {" "}
              beautiful design
            </span>{" "}
            for the ultimate meeting experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg"
            >
              <Link href="/booking">
                Start Booking Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white shadow-lg px-8 py-4 text-lg"
            >
              <Link href="/auth/login">
                <Building2 className="mr-3 h-6 w-6" />
                Admin Dashboard
              </Link>
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative mb-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <img
                src="https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Modern meeting room"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Available Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Multiple Locations
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Seamlessly manage bookings across all your office locations with
                centralized control.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Smart Booking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Intelligent calendar system with real-time conflict detection
                and availability optimization.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Token System
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Fair usage management with automatic monthly renewal and
                transparent token tracking.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Team Collaboration
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Built for teams of all sizes with role-based access and
                collaborative booking features.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">
              Trusted by Industry Leaders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  500+
                </div>
                <div className="text-slate-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  10K+
                </div>
                <div className="text-slate-600">Bookings/Month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  99.9%
                </div>
                <div className="text-slate-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  24/7
                </div>
                <div className="text-slate-600">Support</div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-slate-900">
                Why Choose BookingHub?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">
                      Instant Booking
                    </h3>
                    <p className="text-slate-600">
                      Book meeting rooms in seconds with our streamlined
                      interface and real-time availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">
                      Enterprise Security
                    </h3>
                    <p className="text-slate-600">
                      Bank-level security with role-based access control and
                      comprehensive audit trails.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">
                      User Management
                    </h3>
                    <p className="text-slate-600">
                      Advanced user management with location-based access
                      control and permission systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Team collaboration"
                className="w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-12 border-t border-white/20 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900">
                BookingHub
              </span>
              <p className="text-sm text-slate-600">Premium Meeting Spaces</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} BookingHub. Built with Next.js,
            Tailwind CSS, and modern web technologies. Powered by{" "}
            <span className="font-semibold">IWT</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
