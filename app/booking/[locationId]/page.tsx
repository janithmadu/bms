"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, MapPin, Users, Maximize2, Calendar, Building2, Search, Star, Clock, Wifi, Coffee, Car, Shield, Sparkles, CircleCheck as CheckCircle, Filter } from 'lucide-react'
import { BookingModal } from '@/components/booking/booking-modal'

interface Boardroom {
  id: string
  name: string
  description?: string
  dimensions?: string
  capacity: number
  imageUrl?: string
  facilities: string[]
}

interface Location {
  id: string
  name: string
  address: string
  description?: string
  imageUrl?: string
  boardrooms: Boardroom[]
}

export default function LocationBoardroomsPage() {
  const params = useParams()
  const locationId = params.locationId as string
  const [location, setLocation] = useState<Location | null>(null)
  const [selectedBoardroom, setSelectedBoardroom] = useState<Boardroom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [capacityFilter, setCapacityFilter] = useState<string>('all')

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/public/locations/${locationId}`)
        if (response.ok) {
          const data = await response.json()
          setLocation(data)
        }
      } catch (error) {
        console.error('Error fetching location:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocation()
  }, [locationId])

  const handleBookRoom = (boardroom: Boardroom) => {
    setSelectedBoardroom(boardroom)
    setIsModalOpen(true)
  }

  const filteredBoardrooms = location?.boardrooms.filter(boardroom => {
    const matchesSearch = boardroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         boardroom.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCapacity = capacityFilter === 'all' || 
                           (capacityFilter === 'small' && boardroom.capacity <= 6) ||
                           (capacityFilter === 'medium' && boardroom.capacity > 6 && boardroom.capacity <= 12) ||
                           (capacityFilter === 'large' && boardroom.capacity > 12)
    
    return matchesSearch && matchesCapacity
  }) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-slate-200 rounded-xl w-48"></div>
            <div className="h-80 bg-slate-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-56 bg-slate-200"></div>
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
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-2xl bg-white/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-6">
              <Building2 className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-4">Location Not Found</h3>
            <p className="text-slate-500 text-center mb-8 text-lg">
              The location you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Link href="/booking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Locations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-green-400/15 to-blue-400/15 blur-3xl animate-pulse" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
          {/* Enhanced Back Button */}
          <Button variant="ghost" asChild className="mb-8 hover:bg-white/60 transition-all duration-300 group">
            <Link href="/booking" className="flex items-center text-lg font-medium">
              <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to All Locations
            </Link>
          </Button>

          {/* Enhanced Location Hero Section */}
          <Card className="mb-12 bg-white/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl overflow-hidden">
            <div className="relative h-80 md:h-96">
              {location.imageUrl ? (
                <Image
                  src={location.imageUrl}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                  <Building2 className="h-32 w-32 text-slate-400" />
                </div>
              )}
              
              {/* Enhanced Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Floating Elements */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-slate-700">Available Now</span>
                  </div>
                  <div className="bg-amber-400/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
                    <Star className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">Premium</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                      {location.name}
                    </h1>
                    <div className="flex items-center text-white/90 mb-4 text-lg">
                      <MapPin className="h-6 w-6 mr-3 flex-shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    {location.description && (
                      <p className="text-white/80 max-w-3xl text-lg leading-relaxed">
                        {location.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="hidden md:flex flex-col space-y-3 ml-8">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[120px]">
                      <div className="text-3xl font-bold mb-1">{location.boardrooms.length}</div>
                      <div className="text-sm opacity-90">Boardrooms</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[120px]">
                      <div className="text-3xl font-bold mb-1">
                        {Math.max(...location.boardrooms.map(r => r.capacity), 0)}
                      </div>
                      <div className="text-sm opacity-90">Max Capacity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Search and Filter Section */}
          <Card className="mb-12 bg-white/90 backdrop-blur-xl border-2 border-white/30 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search boardrooms by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white/80 border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 rounded-xl text-base"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Capacity:</span>
                  </div>
                  <div className="flex space-x-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'small', label: '1-6' },
                      { value: 'medium', label: '7-12' },
                      { value: 'large', label: '13+' }
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={capacityFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCapacityFilter(filter.value)}
                        className={`${
                          capacityFilter === filter.value 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-white/80 hover:bg-white border-slate-200 hover:border-blue-300'
                        } transition-all duration-200`}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {(searchTerm || capacityFilter !== 'all') && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {filteredBoardrooms.length} of {location.boardrooms.length} boardrooms
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setCapacityFilter('all')
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boardrooms Section */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Available Boardrooms
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Choose from {filteredBoardrooms.length} premium meeting space{filteredBoardrooms.length !== 1 ? 's' : ''} 
                designed for productivity and success
              </p>
            </div>

            {filteredBoardrooms.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-xl border-2 border-white/30 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-6">
                    <Calendar className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-4">
                    {searchTerm || capacityFilter !== 'all' ? 'No matching boardrooms' : 'No Boardrooms Available'}
                  </h3>
                  <p className="text-slate-500 text-center text-lg mb-6">
                    {searchTerm || capacityFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'This location doesn\'t have any boardrooms set up yet.'
                    }
                  </p>
                  {(searchTerm || capacityFilter !== 'all') && (
                    <Button
                      onClick={() => {
                        setSearchTerm('')
                        setCapacityFilter('all')
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBoardrooms.map((boardroom, index) => (
                  <Card 
                    key={boardroom.id}
                    className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white/90 backdrop-blur-xl border-2 border-white/30 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Enhanced Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      {boardroom.imageUrl ? (
                        <Image
                          src={boardroom.imageUrl}
                          alt={boardroom.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                          <Calendar className="h-20 w-20 text-slate-400" />
                        </div>
                      )}
                      
                      {/* Overlay with Quick Stats */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-medium">{boardroom.capacity}</span>
                            </div>
                            {boardroom.dimensions && (
                              <div className="flex items-center space-x-1">
                                <Maximize2 className="h-4 w-4" />
                                <span className="text-sm font-medium">{boardroom.dimensions}</span>
                              </div>
                            )}
                          </div>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        </div>
                      </div>

                      {/* Capacity Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-700 shadow-lg">
                          {boardroom.capacity} seats
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                        {boardroom.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600 line-clamp-2 leading-relaxed">
                        {boardroom.description || 'Modern meeting room with all essential amenities for productive meetings'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Room Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <div className="text-lg font-bold text-blue-600">{boardroom.capacity}</div>
                          <div className="text-xs text-slate-600">People</div>
                        </div>
                        {boardroom.dimensions && (
                          <div className="text-center p-3 bg-green-50 rounded-xl">
                            <Maximize2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <div className="text-sm font-bold text-green-600">{boardroom.dimensions}</div>
                            <div className="text-xs text-slate-600">Size</div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Facilities */}
                      {boardroom.facilities.length > 0 && (
                        <div className="mb-6">
                          <div className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                            Facilities & Amenities
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {boardroom.facilities.slice(0, 4).map((facility, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-slate-100 hover:bg-slate-200 transition-colors">
                                {facility}
                              </Badge>
                            ))}
                            {boardroom.facilities.length > 4 && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                +{boardroom.facilities.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Enhanced CTA Button */}
                      <Button 
                        onClick={() => handleBookRoom(boardroom)}
                        className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                      >
                        <Calendar className="h-5 w-5 mr-3" />
                        Book This Room
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Footer CTA */}
          <div className="text-center">
            <Card className="bg-white/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl max-w-4xl mx-auto">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Ready to Book Your Meeting Space?
                </h3>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Experience premium meeting facilities with instant booking and professional support
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => filteredBoardrooms.length > 0 && handleBookRoom(filteredBoardrooms[0])}
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-xl"
                    disabled={filteredBoardrooms.length === 0}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Now
                  </Button>
                  <Button size="lg" variant="outline" asChild className="bg-white/80 hover:bg-white border-2 border-slate-200 hover:border-blue-300 px-8 py-4 text-lg">
                    <Link href="/booking">
                      <Building2 className="h-5 w-5 mr-2" />
                      Explore Other Locations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Modal */}
      {selectedBoardroom && (
        <BookingModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          boardroom={selectedBoardroom}
          location={location}
        />
      )}
    </>
  )
}