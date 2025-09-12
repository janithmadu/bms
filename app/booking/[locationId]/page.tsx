"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Users, Maximize2, Calendar, Building2 } from 'lucide-react'
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
  }, [])

  const handleBookRoom = (boardroom: Boardroom) => {
    setSelectedBoardroom(boardroom)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-48"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-200 rounded mb-4"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md bg-white/80 backdrop-blur-sm border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Location Not Found</h3>
            <p className="text-slate-500 text-center mb-6">
              The location you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/booking">Back to Locations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6 hover:bg-white/50 transition-colors">
            <Link href="/booking" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Locations
            </Link>
          </Button>

          {/* Location Header */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden">
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-100 to-slate-200">
              {location.imageUrl ? (
                <Image
                  src={location.imageUrl}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building2 className="h-24 w-24 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{location.name}</h1>
                <div className="flex items-center text-white/90 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  {location.address}
                </div>
                {location.description && (
                  <p className="text-white/80 max-w-2xl">{location.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Boardrooms Section */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Available Boardrooms</h2>
            <p className="text-slate-600 mb-8">
              Choose from {location.boardrooms.length} premium meeting space{location.boardrooms.length !== 1 ? 's' : ''} at this location
            </p>

            {location.boardrooms.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No Boardrooms Available</h3>
                  <p className="text-slate-500 text-center">
                    This location doesn&apos;t have any boardrooms set up yet. Please check back later.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {location.boardrooms.map((boardroom) => (
                  <Card 
                    key={boardroom.id}
                    className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {boardroom.imageUrl ? (
                        <Image
                          src={boardroom.imageUrl}
                          alt={boardroom.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Calendar className="h-16 w-16 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {boardroom.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {boardroom.description || 'Modern meeting room with all essential amenities'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {/* Room Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-600">
                            <Users className="h-4 w-4 mr-2" />
                            Up to {boardroom.capacity} people
                          </div>
                          {boardroom.dimensions && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Maximize2 className="h-4 w-4 mr-2" />
                              {boardroom.dimensions}
                            </div>
                          )}
                        </div>

                        {/* Facilities */}
                        {boardroom.facilities.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {boardroom.facilities.slice(0, 3).map((facility, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                              {boardroom.facilities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{boardroom.facilities.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleBookRoom(boardroom)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-200 group-hover:shadow-xl"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book This Room
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
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