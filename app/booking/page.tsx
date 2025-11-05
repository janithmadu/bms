"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, DoorOpen, ArrowRight, Building2, Search, Star, Users, Calendar, Clock, CheckCircle, Sparkles } from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string
  description?: string
  imageUrl?: string
  boardrooms: { id: string; name: string; capacity: number; imageUrl?: string }[]
}

export default function BookingPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/public/locations')
        const data = await response.json()
        setLocations(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-16 bg-slate-200 rounded-2xl w-96 mx-auto mb-6"></div>
            <div className="h-8 bg-slate-200 rounded-xl w-2/3 mx-auto mb-4"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-64 bg-slate-200"></div>
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-slate-200 rounded mb-4"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/30 to-pink-400/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-green-400/20 to-blue-400/20 blur-3xl animate-pulse" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 left-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 right-40 w-5 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-20">
          {/* Floating Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full border border-white/30 shadow-2xl mb-8 transform hover:scale-105 transition-all duration-300">
            <Sparkles className="h-5 w-5 text-amber-500 mr-3 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">Premium Meeting Spaces Available</span>
            <Star className="h-5 w-5 text-amber-500 ml-3" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 mb-8 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              Meeting Space
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Discover premium boardrooms and meeting spaces designed for success. 
            <span className="font-semibold text-slate-800"> Book instantly</span> and 
            <span className="font-semibold text-slate-800"> elevate your meetings</span> to the next level.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search locations by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 pl-16 pr-6 text-lg bg-white/90 backdrop-blur-xl border-2 border-white/30 rounded-2xl shadow-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{locations.length}+</div>
              <div className="text-slate-600 font-medium">Locations</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <DoorOpen className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{locations.reduce((acc, loc) => acc + loc.boardrooms.length, 0)}+</div>
              <div className="text-slate-600 font-medium">Boardrooms</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
              <div className="text-slate-600 font-medium">Available</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
              <div className="text-slate-600 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-6">
                <Building2 className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">
                {searchTerm ? 'No locations found' : 'No Locations Available'}
              </h3>
              <p className="text-slate-500 text-center text-lg">
                {searchTerm 
                  ? `No locations match "${searchTerm}". Try a different search term.`
                  : 'There are currently no locations set up for booking. Please check back later.'
                }
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm('')}
                  variant="outline" 
                  className="mt-6 bg-white/80 hover:bg-white border-2 border-slate-200 hover:border-blue-300"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Choose Your Ideal Location
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Select from our premium locations to discover available boardrooms and meeting spaces
              </p>
              {searchTerm && (
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                  <Search className="h-4 w-4 mr-2" />
                  Showing results for "{searchTerm}"
                </div>
              )}
            </div>
            
            {/* Enhanced Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredLocations.map((location, index) => (
                <Card 
                  key={location.id} 
                  className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white/90 backdrop-blur-xl border-2 border-white/30 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Enhanced Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    {location.imageUrl ? (
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                        <Building2 className="h-20 w-20 text-slate-400" />
                      </div>
                    )}
                    
                    {/* Overlay with Stats */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <DoorOpen className="h-4 w-4" />
                            <span className="text-sm font-medium">{location.boardrooms.length} rooms</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {Math.max(...location.boardrooms.map(r => r.capacity), 0)} max
                            </span>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-lg">
                        Available Now
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                      {location.name}
                    </CardTitle>
                    <CardDescription className="flex items-center text-slate-600 text-base">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{location.address}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {location.description && (
                      <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                        {location.description}
                      </p>
                    )}
                    
                    {/* Enhanced Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {location.boardrooms.length}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">Boardrooms</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {location.boardrooms.reduce((acc, room) => acc + room.capacity, 0)}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">Total Capacity</div>
                      </div>
                    </div>

                    {/* Enhanced CTA Button */}
                    <Button asChild className="w-full h-14 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                      <Link href={`/booking/${location.id}`} className="flex items-center justify-center">
                        <Calendar className="h-5 w-5 mr-3" />
                        Explore Boardrooms
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Enhanced Footer CTA */}
        <div className="text-center mt-20">
          <div className="bg-white/90 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-12 shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Book Your Perfect Meeting Space?
            </h3>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands of satisfied customers who trust us with their important meetings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-xl">
                <Calendar className="h-5 w-5 mr-2" />
                Start Booking Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white/80 hover:bg-white border-2 border-slate-200 hover:border-blue-300 px-8 py-4 text-lg">
                <Building2 className="h-5 w-5 mr-2" />
                View All Locations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}