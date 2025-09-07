"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { PageHeader } from '@/components/ui/page-header'
import { Calendar as CalendarIcon, Search, Filter, Users, MapPin, Clock, Mail, Edit, Trash2, Plus } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { toast } from 'sonner'
import { BookingDialog } from '@/components/admin/booking-dialog'

interface Booking {
  id: string
  eventTitle: string
  bookerName: string
  bookerEmail: string
  date: string
  startTime: string
  endTime: string
  duration: number
  tokensUsed: number
  status: string
  boardroom: {
    id: string
    name: string
    capacity: number
    location: {
      id: string
      name: string
      address: string
    }
  }
  createdAt: string
}

interface Location {
  id: string
  name: string
  boardrooms: { id: string; name: string }[]
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to fetch bookings')
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([fetchBookings(), fetchLocations()])
  }, [])

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Tokens will be refunded.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Booking cancelled successfully')
        fetchBookings()
      } else {
        throw new Error('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingBooking(null)
  }

  const handleSave = () => {
    fetchBookings()
    handleCloseDialog()
  }

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d, yyyy')
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.boardroom.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = selectedLocation === 'all' || booking.boardroom.location.id === selectedLocation
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus
    const matchesDate = !selectedDate || format(new Date(booking.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

    return matchesSearch && matchesLocation && matchesStatus && matchesDate
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bookings" description="Manage all room bookings" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader 
          title="Bookings Management" 
          description="View and manage all room bookings across locations"
        >
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters and Calendar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Filter by Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(undefined)}
                  className="w-full mt-2"
                >
                  Clear Date Filter
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Bookings List */}
          <div className="lg:col-span-3">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CalendarIcon className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No bookings found</h3>
                  <p className="text-slate-500 text-center mb-6">
                    {selectedDate || searchTerm || selectedLocation !== 'all' || selectedStatus !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'No bookings have been made yet.'
                    }
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                    {selectedDate && ` for ${format(selectedDate, 'MMMM d, yyyy')}`}
                  </p>
                </div>

                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{booking.eventTitle}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.boardroom.location.name} - {booking.boardroom.name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>
                            {booking.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(booking)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(booking.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {getDateLabel(booking.date)}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="h-4 w-4 mr-2" />
                          {booking.boardroom.capacity} capacity
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {booking.bookerName} ({booking.bookerEmail})
                          </div>
                          <div className="text-sm text-slate-500">
                            {booking.tokensUsed} token{booking.tokensUsed !== 1 ? 's' : ''} used
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        booking={editingBooking}
        onSave={handleSave}
      />
    </>
  )
}