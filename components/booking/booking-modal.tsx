"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, MapPin, Coins, AlertCircle, CheckCircle } from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardroom: any;
  location: any;
}

interface TokenData {
  tokensAvailable: number;
  tokensUsed: number;
  initialCount: number;
}

export function BookingModal({
  open,
  onOpenChange,
  boardroom,
  location,
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [formData, setFormData] = useState({
    eventTitle: "",
    bookerName: "",
    bookerEmail: "",
    startTime: "",
    endTime: "",
    phoneNumber: "",
  });
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [tokensRequired, setTokensRequired] = useState(0);

  useEffect(() => {
    if (open) {
      fetchTokenData(userId);
      if (boardroom?.id) {
        fetchBoardroomBookings();
      }
    }
  }, [open, boardroom?.id, userId]);

  useEffect(() => {
    calculateTokensRequired();
  }, [formData.startTime, formData.endTime]);

  const fetchTokenData = async (id: string) => {
    try {
      const response = await fetch(`/api/public/users/${id}`);
      const data = await response.json();

      setTokenData(data);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  const fetchBoardroomBookings = async () => {
    try {
      const response = await fetch(`/api/boardrooms/${boardroom.id}`);
      const data = await response.json();
      setExistingBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const calculateTokensRequired = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end > start) {
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        setTokensRequired(Math.ceil(hours));
      } else {
        setTokensRequired(0);
      }
    } else {
      setTokensRequired(0);
    }
  };

  const getBookedTimeslots = () => {
    if (!selectedDate) return [];
    return existingBookings
      .filter((booking) => isSameDay(new Date(booking.date), selectedDate))
      .map((booking) => ({
        start: format(new Date(booking.startTime), "HH:mm"),
        end: format(new Date(booking.endTime), "HH:mm"),
        title: booking.eventTitle,
        status: booking.status || "confirmed",
      }));
  };

const isTimeSlotAvailable = (startTime: string, endTime: string) => {
  const bookedSlots = getBookedTimeslots();

  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  return !bookedSlots.some((slot) => {
    const slotStart = new Date(`2000-01-01T${slot.start}:00`);
    const slotEnd = new Date(`2000-01-01T${slot.end}:00`);

    // Allow exact match: one ends when the other starts
    return start < slotEnd && end > slotStart;
  });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!isTimeSlotAvailable(formData.startTime, formData.endTime)) {
      toast.error("This time slot conflicts with an existing booking");
      return;
    }
    if (tokenData && tokensRequired > tokenData.tokensAvailable) {
      toast.error("Insufficient tokens available for this booking");
      return;
    }
    if (isExistingUser && !userId.trim()) {
      toast.error("User ID is required for existing users");
      return;
    }

    setIsLoading(true);
    try {
      const bookingDate = selectedDate;
      const startDateTime = new Date(bookingDate);
      const endDateTime = new Date(bookingDate);

      const [startHours, startMinutes] = formData.startTime.split(":");
      const [endHours, endMinutes] = formData.endTime.split(":");

      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: bookingDate.toISOString(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          boardroomId: boardroom.id,
          isExistingUser,
          UserID: isExistingUser ? userId : null,
        }),
      });

      if (response.ok) {
        toast.success("Booking confirmed successfully!");
        onOpenChange(false);
        setFormData({
          eventTitle: "",
          bookerName: "",
          bookerEmail: "",
          startTime: "",
          endTime: "",
          phoneNumber: "",
        });
        setUserId("");
        setIsExistingUser(false);
        setSelectedDate(new Date());
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const canBookDate = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);
    return date >= today && date <= maxDate;
  };

  const bookedSlots: any = getBookedTimeslots();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book {boardroom?.name}
          </DialogTitle>
          <DialogDescription className="flex items-center text-slate-600">
            <MapPin className="h-4 w-4 mr-1" />
            {location?.name} - {location?.address}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {boardroom?.imageUrl && (
                  <img
                    src={boardroom.imageUrl}
                    alt={boardroom.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Capacity:</span>
                    <span className="font-medium">
                      {boardroom?.capacity} people
                    </span>
                  </div>
                  {boardroom?.dimensions && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Size:</span>
                      <span className="font-medium">
                        {boardroom.dimensions}
                      </span>
                    </div>
                  )}
                  {boardroom?.facilities?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-slate-600 block mb-2">
                        Facilities:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {boardroom.facilities.map(
                          (facility: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {facility}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                      <span className="font-medium text-green-600">
                        {tokenData.tokensAvailable} tokens
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Required:</span>
                      <span
                        className={`font-medium ${
                          tokensRequired > tokenData.tokensAvailable
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {tokensRequired} token
                        {tokensRequired !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {tokensRequired > tokenData.tokensAvailable && (
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

          {/* Right Column */}
          <div className="space-y-6">
            {selectedDate && bookedSlots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Existing Bookings - {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bookedSlots.map((slot: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          slot.status === "confirmed"
                            ? "bg-red-50"
                            : "bg-yellow-50"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {slot.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600">
                            {slot.start} - {slot.end}
                          </span>
                          <Badge
                            variant={
                              slot.status === "confirmed"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {slot.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="w-full flex flex-col items-center justify-center p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => !canBookDate(date)}
                />
                <p className="text-xs text-slate-500 mt-2">
                  You can book up to 30 days in advance
                </p>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  Fill in your booking information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="eventTitle">Event Title *</Label>
                    <Input
                      id="eventTitle"
                      value={formData.eventTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, eventTitle: e.target.value })
                      }
                      placeholder="e.g., Team Meeting, Client Presentation"
                      required
                    />
                  </div>

                  {/* Existing User Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="existingUser"
                      checked={isExistingUser}
                      onCheckedChange={(checked) =>
                        setIsExistingUser(checked as boolean)
                      }
                    />
                    <Label htmlFor="existingUser">Existing User?</Label>
                  </div>

                  {/* User ID field when checked */}
                  {isExistingUser && (
                    <div className="grid gap-2">
                      <Label htmlFor="userId">User ID *</Label>
                      <Input
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter your User ID"
                        required={isExistingUser}
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="bookerName">Your Name *</Label>
                    <Input
                      id="bookerName"
                      value={formData.bookerName}
                      onChange={(e) =>
                        setFormData({ ...formData, bookerName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bookerEmail">Email Address *</Label>
                    <Input
                      id="bookerEmail"
                      type="email"
                      value={formData.bookerEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookerEmail: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Enter your Phone Number"
                      required
                    />
                  </div>

                  {/* Time selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <select
                        id="startTime"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select time</option>
                        {generateTimeSlots().map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <select
                        id="endTime"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select time</option>
                        {generateTimeSlots()
                          .slice(1)
                          .map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Slot availability */}
                  {formData.startTime &&
                    formData.endTime &&
                    !isTimeSlotAvailable(
                      formData.startTime,
                      formData.endTime
                    ) && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        This time slot conflicts with an existing booking
                      </div>
                    )}

                  {formData.startTime &&
                    formData.endTime &&
                    isTimeSlotAvailable(formData.startTime, formData.endTime) &&
                    tokenData &&
                    tokensRequired <= tokenData.tokensAvailable &&
                    tokensRequired > 0 && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Time slot is available
                      </div>
                    )}

                  <Button
                    type="submit"
                    disabled={
                      isLoading || !selectedDate || tokensRequired === 0
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                  >
                    {isLoading
                      ? "Creating Booking..."
                      : !isExistingUser
                      ? "Book Room"
                      : `Book Room (${tokensRequired} token${
                          tokensRequired !== 1 ? "s" : ""
                        })`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
