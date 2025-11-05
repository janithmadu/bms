{"code":"rate-lding2, Cal\enaPcP's"n" h a,us"i"Y)ic4 " -0cp /  <r=-sles   .nPeex-ax {e-wd  0-wke -cpt-
   g ","po/"r-grL m mH=  :to --,0e''/ ffeh-w5:0pteOut, ChartBar as BarChart3, Coins, Palette } from 'lucide-react' as BarChart3, Settings, LogOut, Chrome as Home, Palette } from 'lucide-react' icon: MapPin },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Tokens', href: '/admin/tokens', icon: Coins },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession() // get current user

  const handleLogout = () => {
    signOut({
      callbackUrl: "/auth/login",
    });
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Building2 className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-semibold text-white">Admin</span>
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
