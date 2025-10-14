"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  Clock,
  Users,
  MapPin,
  Coins,
  AlertCircle,
} from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: any;
  onSave: () => void;
}

interface Location {
  id: string;
  name: string;
  boardrooms: {
    id: string;
    name: string;
    capacity: number;
  }[];
}

interface TokenData {
  availableCount: number;
  tokensUsedThisMonth: number;
  initialCount: number;
}

interface UserTokenData {
  tokenLimit: number;
  tokensUsed: number;
  tokensAvailable: number;
}

export function BookingDialog({
  open,
  onOpenChange,
  booking,
  onSave,
}: BookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [formData, setFormData] = useState({
    eventTitle: "",
    bookerName: "",
    bookerEmail: "",
    startTime: "",
    endTime: "",
    boardroomId: "",
    locationId: "",
    phoneNumber: "",
    isExsisting: 0,
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [userTokenData, setUserTokenData] = useState<UserTokenData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tokensRequired, setTokensRequired] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userId, setUserId] = useState("");
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  const fetchBoardroomBookings = async () => {
    try {
      const response = await fetch(`/api/boardrooms/${formData.boardroomId}`);
      const data = await response.json();
      setExistingBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    if (open) {
      if (formData.boardroomId) {
        fetchBoardroomBookings();
      }
    }
  }, [open, formData.boardroomId]);

  useEffect(() => {
    if (open) {
      fetchLocations();
      fetchTokenData();

      if (booking) {
        setFormData({
          eventTitle: booking.eventTitle || "",
          bookerName: booking.bookerName || "",
          bookerEmail: booking.bookerEmail || "",
          startTime: format(new Date(booking.startTime), "HH:mm"),
          endTime: format(new Date(booking.endTime), "HH:mm"),
          boardroomId: booking.boardroom?.id || "",
          locationId: booking.boardroom?.location?.id || "",
          phoneNumber: booking.phoneNumber || "",
          isExsisting: booking.isExsisting || 0,
        });
        setSelectedDate(new Date(booking.date));
      } else {
        setFormData({
          eventTitle: "",
          bookerName: "",
          bookerEmail: "",
          startTime: "",
          endTime: "",
          boardroomId: "",
          locationId: "",
          phoneNumber: "",
          isExsisting: 0,
        });
        setSelectedDate(new Date());
      }

      // Reset user-related states
      setIsExistingUser(false);
      setUserId("");
      setUserTokenData(null);
    }
  }, [open, booking]);

  useEffect(() => {
    calculateTokensRequired();
  }, [formData.startTime, formData.endTime]);

  useEffect(() => {
    // Fetch user token data when userId changes and isExistingUser is true
    if (isExistingUser && userId) {
      const delayDebounceFn = setTimeout(() => {
        fetchUserTokenData(userId);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(delayDebounceFn);
    } else {
      setUserTokenData(null);
    }
  }, [userId, isExistingUser]);

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
    }
  };

  const fetchTokenData = async () => {
    try {
      const response = await fetch("/api/tokens");
      const data = await response.json();
      setTokenData(data);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  const fetchUserTokenData = async (id: string) => {
    if (!id) return;

    setIsFetchingUser(true);
    try {
      const response = await fetch(`/api/public/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUserTokenData(data);
      } else {
        setUserTokenData(null);
        toast.error("User not found or error fetching user data");
      }
    } catch (error) {
      console.error("Error fetching user token data:", error);
      toast.error("Failed to fetch user data");
      setUserTokenData(null);
    } finally {
      setIsFetchingUser(false);
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
    const data = existingBookings
      .filter((booking) => isSameDay(new Date(booking.date), selectedDate))
      .map((booking) => ({
        start: format(new Date(booking.startTime), "HH:mm"),
        end: format(new Date(booking.endTime), "HH:mm"),
        title: booking.eventTitle,
        status: booking.status || "confirmed",
      }));

    return data;
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

    // Check token availability based on whether it's an existing user or not
    if (isExistingUser && userTokenData) {
      if (tokensRequired > userTokenData.tokensAvailable && isExistingUser) {
        toast.error("Insufficient tokens available for this user");
        return;
      }
    } else if (
      tokenData &&
      tokensRequired > tokenData.availableCount &&
      !booking &&
      isExistingUser
    ) {
      toast.error("Insufficient tokens available for this booking");
      return;
    }

    setIsLoading(true);
    try {
      const bookingDate = selectedDate;
      console.log(bookingDate);

      const startDateTime = new Date(bookingDate);
      const endDateTime = new Date(bookingDate);

      const [startHours, startMinutes] = formData.startTime.split(":");
      const [endHours, endMinutes] = formData.endTime.split(":");

      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const url = booking
        ? `/api/admin/bookings/${booking.id}`
        : "/api/bookings";
      const method = booking ? "PUT" : "POST";

      // Include userId if it's an existing user
      const requestBody: any = {
        ...formData,
        date: bookingDate.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        boardroomId: formData.boardroomId,
        isExistingUser,
        UserID: userId,
        bookerId: session?.user.id,
      };

      if (isExistingUser && userId) {
        requestBody.userId = userId;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success(
          `Booking ${booking ? "updated" : "created"} successfully!`
        );
        onSave();
      } else {
        const error = await response.json();
        toast.error(
          error.error || `Failed to ${booking ? "update" : "create"} booking`
        );
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error(`Failed to ${booking ? "update" : "create"} booking`);
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

  const selectedLocation = locations.find(
    (loc) => loc.id === formData.locationId
  );
  const selectedBoardroom = selectedLocation?.boardrooms.find(
    (room) => room.id === formData.boardroomId
  );

  // Determine which token data to use
  const displayTokenData = isExistingUser ? userTokenData : tokenData;
  const availableTokens = isExistingUser
    ? userTokenData?.tokensAvailable || 0
    : tokenData?.availableCount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Edit Booking" : "Create New Booking"}
          </DialogTitle>
          <DialogDescription>
            {booking
              ? "Update the booking information below."
              : "Fill in the details to create a new booking."}
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
                  Location and Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Select
                    value={formData.locationId}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        locationId: value,
                        boardroomId: "",
                      })
                    }
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, boardroomId: value })
                    }
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
            {displayTokenData && (
              <Card className={!isExistingUser ? "hidden" : "inline"}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-amber-500" />
                    {isExistingUser ? "User Token Usage" : "Token Usage"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Available:</span>
                      <span className="font-medium text-green-600">
                        {availableTokens} tokens
                      </span>
                    </div>
                    {isExistingUser && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">
                            Total Limit:
                          </span>
                          <span className="font-medium">
                            {userTokenData?.tokenLimit} tokens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Used:</span>
                          <span className="font-medium">
                            {userTokenData?.tokensUsed} tokens
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Required:</span>
                      <span
                        className={`font-medium ${
                          tokensRequired > availableTokens
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {tokensRequired} token{tokensRequired !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {tokensRequired > availableTokens &&
                      !booking &&
                      isExistingUser && (
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
                  {/* Existing User Checkbox and User ID Field */}
                  <div className="space-y-3 p-3 border rounded-lg">
                    {!booking && (
                      <div className="flex items-center space-x-2">
                        <>
                          <Label
                            htmlFor="existingUser"
                            className="text-sm font-medium leading-none"
                          >
                            Existing User?
                          </Label>
                          <Checkbox
                            id="existingUser"
                            checked={isExistingUser}
                            onCheckedChange={(checked) =>
                              setIsExistingUser(checked === true)
                            }
                          />
                        </>
                      </div>
                    )}

                    {isExistingUser && (
                      <div className="grid gap-2 mt-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="Enter user ID"
                          disabled={isFetchingUser}
                        />
                        {isFetchingUser && (
                          <p className="text-xs text-slate-500">
                            Fetching user data...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

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

                  <div className="grid gap-2">
                    <Label htmlFor="bookerName">Booker Name *</Label>
                    <Input
                      id="bookerName"
                      value={formData.bookerName}
                      onChange={(e) =>
                        setFormData({ ...formData, bookerName: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookerEmail: e.target.value,
                        })
                      }
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bookerEmail">Phone Number *</Label>
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
                      placeholder="Enter Phone Number"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Select
                        value={formData.startTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, startTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeSlots().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Select
                        value={formData.endTime}
                        onValueChange={(value) =>
                          setFormData({ ...formData, endTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeSlots()
                            .slice(1)
                            .map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
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
                        (isExistingUser && !userId) ||
                        (isExistingUser && isFetchingUser) ||
                        (tokensRequired > availableTokens &&
                          !booking &&
                          isExistingUser) ||
                        !isTimeSlotAvailable(
                          formData.startTime,
                          formData.endTime
                        ) ||
                        tokensRequired === 0
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading
                        ? "Saving..."
                        : booking
                        ? "Update Booking"
                        : isExistingUser
                        ? `Create Booking (${tokensRequired} token${
                            tokensRequired !== 1 ? "s" : ""
                          })`
                        : `Create Booking`}
                    </Button>
                  </DialogFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
