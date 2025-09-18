"use client"

import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, DoorOpen, ArrowRight, Building2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string
  description?: string
  imageUrl?: string
  boardrooms: { id: string; name: string; capacity: number; imageUrl?: string }[]
}

// SWR fetcher
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json())

export default function BookingPage() {
   const { data: locations = [], isLoading, mutate } = useSWR<Location[]>('/api/public/locations', fetcher, {
    refreshInterval: 5000,
  })

  // Add a manual refresh function
  const handleRefresh = () => {
    mutate()
  }
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-12 bg-slate-200 rounded w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-slate-200 rounded mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Book Your Perfect Space
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover and reserve premium boardrooms and meeting spaces across our locations. 
            Find the ideal environment for your next important meeting.
          </p>
        </div>

        {/* Locations Grid */}
        {locations.length === 0 ? (
          <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Locations Available</h3>
              <p className="text-slate-500 text-center">
                There are currently no locations set up for booking. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Location</h2>
              <p className="text-slate-600">Select a location to view available boardrooms</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((location) => (
                <Card 
                  key={location.id} 
                  className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {location.imageUrl ? (
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {location.name}
                    </CardTitle>
                    <CardDescription className="flex items-center text-slate-600">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{location.address}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {location.description && (
                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {location.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-sm text-slate-500">
                        <DoorOpen className="h-4 w-4 mr-1" />
                        {location.boardrooms.length} boardroom{location.boardrooms.length !== 1 ? 's' : ''} available
                      </div>
                    </div>

                    <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-200 group-hover:shadow-xl">
                      <Link href={`/booking/${location.id}`}>
                        View Boardrooms
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
