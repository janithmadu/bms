"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Clock, Users, MapPin, Coins, AlertCircle } from 'lucide-react'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: any
  onSave: () => void
}

interface Location {
  id: string
  name: string
  boardrooms: {
    id: string
    name: string
    capacity: number
  }[]
}

interface TokenData {
  availableCount: number
  tokensUsedThisMonth: number
  initialCount: number
}

export function BookingDialog({ open, onOpenChange, booking, onSave }: BookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    eventTitle: '',
    bookerName: '',
    bookerEmail: '',
    startTime: '',
    endTime: '',
    boardroomId: '',
    locationId: ''
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tokensRequired, setTokensRequired] = useState(0)

  useEffect(() => {
    if (open) {
      fetchLocations()
      fetchTokenData()
      
      if (booking) {
        setFormData({
          eventTitle: booking.eventTitle || '',
          bookerName: booking.bookerName || '',
          bookerEmail: booking.bookerEmail || '',
          startTime: format(new Date(booking.startTime), 'HH:mm'),
          endTime: format(new Date(booking.endTime), 'HH:mm'),
          boardroomId: booking.boardroom?.id || '',
          locationId: booking.boardroom?.location?.id || ''
        })
        setSelectedDate(new Date(booking.date))
      } else {
        setFormData({
          eventTitle: '',
          bookerName: '',
          bookerEmail: '',
          startTime: '',
          endTime: '',
          boardroomId: '',
          locationId: ''
        })
        setSelectedDate(new Date())
      }
    }
  }, [open, booking])

  useEffect(() => {
    calculateTokensRequired()
  }, [formData.startTime, formData.endTime])

const { data: session, status } = useSession();

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `/api/locations?userId=${session?.user.id}&role=${session?.user.role}`
      );
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenData = async () => {
    try {
      const response = await fetch('/api/tokens')
      const data = await response.json()
      setTokenData(data)
    } catch (error) {
      console.error('Error fetching token data:', error)
    }
  }

  const calculateTokensRequired = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      
      if (end > start) {
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        setTokensRequired(Math.ceil(hours))
      } else {
        setTokensRequired(0)
      }
    } else {
      setTokensRequired(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    if (tokenData && tokensRequired > tokenData.availableCount && !booking) {
      toast.error('Insufficient tokens available for this booking')
      return
    }

    setIsLoading(true)
    try {
      const bookingDate = selectedDate
      const startDateTime = new Date(bookingDate)
      const endDateTime = new Date(bookingDate)
      
      const [startHours, startMinutes] = formData.startTime.split(':')
      const [endHours, endMinutes] = formData.endTime.split(':')
      
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes))
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))

      const url = booking ? `/api/admin/bookings/${booking.id}` : '/api/bookings'
      const method = booking ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: bookingDate.toISOString(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          boardroomId: formData.boardroomId
        })
      })

      if (response.ok) {
        toast.success(`Booking ${booking ? 'updated' : 'created'} successfully!`)
        onSave()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${booking ? 'update' : 'create'} booking`)
      }
    } catch (error) {
      console.error('Error saving booking:', error)
      toast.error(`Failed to ${booking ? 'update' : 'create'} booking`)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const canBookDate = (date: Date) => {
    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30)
    return date >= today && date <= maxDate
  }

  const selectedLocation = locations.find(loc => loc.id === formData.locationId)
  const selectedBoardroom = selectedLocation?.boardrooms.find(room => room.id === formData.boardroomId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? 'Edit Booking' : 'Create New Booking'}
          </DialogTitle>
          <DialogDescription>
            {booking 
              ? 'Update the booking information below.'
              : 'Fill in the details to create a new booking.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column - Calendar and Room Selection */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => !canBookDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Location and Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location & Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Select 
                    value={formData.locationId} 
                    onValueChange={(value) => setFormData({...formData, locationId: value, boardroomId: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Boardroom</Label>
                  <Select 
                    value={formData.boardroomId} 
                    onValueChange={(value) => setFormData({...formData, boardroomId: value})}
                    disabled={!formData.locationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select boardroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedLocation?.boardrooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} (Capacity: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBoardroom && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {selectedBoardroom.capacity} people
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Token Information */}
            {tokenData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-amber-500" />
                    Token Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Available:</span>
                      <span className="font-medium text-green-600">{tokenData.availableCount} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Required:</span>
                      <span className={`font-medium ${tokensRequired > tokenData.availableCount ? 'text-red-600' : 'text-blue-600'}`}>
                        {tokensRequired} token{tokensRequired !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {tokensRequired > tokenData.availableCount && !booking && (
                      <div className="flex items-center text-red-600 text-sm mt-2">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Insufficient tokens available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="eventTitle">Event Title *</Label>
                    <Input
                      id="eventTitle"
                      value={formData.eventTitle}
                      onChange={(e) => setFormData({...formData, eventTitle: e.target.value})}
                      placeholder="e.g., Team Meeting, Client Presentation"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bookerName">Booker Name *</Label>
                    <Input
                      id="bookerName"
                      value={formData.bookerName}
                      onChange={(e) => setFormData({...formData, bookerName: e.target.value})}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bookerEmail">Email Address *</Label>
                    <Input
                      id="bookerEmail"
                      type="email"
                      value={formData.bookerEmail}
                      onChange={(e) => setFormData({...formData, bookerEmail: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Select 
                        value={formData.startTime} 
                        onValueChange={(value) => setFormData({...formData, startTime: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeSlots().map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Select 
                        value={formData.endTime} 
                        onValueChange={(value) => setFormData({...formData, endTime: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeSlots().slice(1).map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !selectedDate ||
                        !formData.startTime ||
                        !formData.endTime ||
                        !formData.boardroomId ||
                        (tokenData && tokensRequired > tokenData.availableCount && !booking) ||
                        tokensRequired === 0
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Saving...' : booking ? 'Update Booking' : `Create Booking (${tokensRequired} token${tokensRequired !== 1 ? 's' : ''})`}
                    </Button>
                  </DialogFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}