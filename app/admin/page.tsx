"use client"

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, DoorOpen, Calendar, Coins, Users, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalLocations: number
  totalBoardrooms: number
  totalBookings: number
  availableTokens: number
  tokensUsedThisMonth: number
  recentBookings: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [locationsRes, tokensRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/tokens')
        ])

        const locations = await locationsRes.json()
        const tokens = await tokensRes.json()

        const totalBoardrooms = locations.reduce((acc: number, loc: any) => acc + loc.boardrooms.length, 0)

        setStats({
          totalLocations: locations.length,
          totalBoardrooms,
          totalBookings: 0, // This would come from a bookings endpoint
          availableTokens: tokens.availableCount,
          tokensUsedThisMonth: tokens.tokensUsedThisMonth,
          recentBookings: []
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Locations',
      value: stats?.totalLocations || 0,
      icon: Building2,
      description: 'Active locations',
      color: 'bg-blue-500'
    },
    {
      title: 'Boardrooms',
      value: stats?.totalBoardrooms || 0,
      icon: DoorOpen,
      description: 'Available rooms',
      color: 'bg-green-500'
    },
    {
      title: 'Available Tokens',
      value: stats?.availableTokens || 0,
      icon: Coins,
      description: 'Ready for booking',
      color: 'bg-amber-500'
    },
    {
      title: 'Tokens Used',
      value: stats?.tokensUsedThisMonth || 0,
      icon: TrendingUp,
      description: 'This month',
      color: 'bg-purple-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your booking system" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your booking system"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color}`} />
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest bookings and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No recent activity</p>
              <p className="text-sm">Bookings will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Booking System</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Token System</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}