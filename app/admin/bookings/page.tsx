"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader } from "@/components/ui/page-header";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  Mail,
  Edit,
  Trash2,
  Plus,
  Phone,
  Download,
} from "lucide-react";
import { format, isToday, isTomorrow, isYesterday, parse } from "date-fns";
import { toast } from "sonner";
import { BookingDialog } from "@/components/admin/booking-dialog";
import { useSession } from "next-auth/react";

interface Booking {
  id: string;
  eventTitle: string;
  bookerName: string;
  bookerEmail: string;
  bookerId: string;
  isExsisting: boolean;
  UserID: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  tokensUsed: number;
  phoneNumber: string;
  status: string;
  boardroom: {
    id: string;
    name: string;
    capacity: number;
    location: {
      id: string;
      name: string;
      address: string;
    };
  };
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
  boardrooms: { id: string; name: string }[];
}

// Utility function to download CSV
const downloadCSV = (data: any[], headers: string[], filename: string) => {
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate time options from 8:00 AM to 11:59 PM in 30-minute increments
const generateTimeOptions = () => {
  const times = [];
  let hour = 8;
  let minute = 0;

  while (hour < 24) {
    const timeStr = format(new Date(2025, 0, 1, hour, minute), "hh:mm a");
    times.push(timeStr);
    minute += 30;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
    if (hour === 24 && minute > 0) break;
  }
  return times;
};

const timeOptions = generateTimeOptions();

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("all");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const { data: session } = useSession();

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    }
  };

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

  useEffect(() => {
    Promise.all([fetchBookings(), fetchLocations()]);
  }, [session?.user.id]);

  const handleDelete = async (bookingId: string, UserID: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? Tokens will be refunded."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        body: JSON.stringify({ UserID }),
      });

      if (response.ok) {
        toast.success("Booking cancelled successfully");
        fetchBookings();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBooking(null);
  };

  const handleSave = () => {
    fetchBookings();
    handleCloseDialog();
  };

  const handleStatusChange = async (
    bookingId: string,
    UserID: string,
    newStatus: string
  ) => {
    const statusText = newStatus === "confirmed" ? "approve" : "cancel";

    if (!confirm(`Are you sure you want to ${statusText} this booking?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, UserID }),
      });

      if (response.ok) {
        toast.success(`Booking ${statusText}ed successfully`);
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${statusText} booking`);
      }
    } catch (error) {
      console.error(`Error ${statusText}ing booking:`, error);
      toast.error(`Failed to ${statusText} booking`);
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const headers = [
      "ID",
      "Event Title",
      "Booker Name",
      "Booker Email",
      "Booker ID",
      "User ID",
      "Date",
      "Start Time",
      "End Time",
      "Duration (mins)",
      "Tokens Used",
      "Phone Number",
      "Status",
      "Boardroom Name",
      "Boardroom Capacity",
      "Location Name",
      "Location Address",
      "Created At",
      "Booking Type"
    ];

    const csvData = filteredBookings.map((booking) => [
      booking.id,
      booking.eventTitle,
      booking.bookerName,
      booking.bookerEmail,
      booking.bookerId,
      booking.UserID,
      booking.date,
      format(new Date(booking.startTime), "HH:mm"),
      format(new Date(booking.endTime), "HH:mm"),
      booking.duration,
      booking.tokensUsed,
      booking.phoneNumber,
      booking.status,
      booking.boardroom.name,
      booking.boardroom.capacity,
      booking.boardroom.location.name,
      booking.boardroom.location.address,
      format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm"),
      booking.isExsisting ? "Internal" : "External"
    ]);

    const dateStr = format(new Date(), "yyyy-MM-dd");
    downloadCSV(csvData, headers, `bookings_export_${dateStr}.csv`);
    toast.success("CSV exported successfully");
  };

  // Time filter logic
  const isBookingInTimeRange = (booking: Booking, startTime: string, endTime: string) => {
    if (startTime === "all" && endTime === "all") return true;

    const bookingStart = parse(format(new Date(booking.startTime), "HH:mm"), "HH:mm", new Date());
    const bookingEnd = parse(format(new Date(booking.endTime), "HH:mm"), "HH:mm", new Date());

    const start = startTime !== "all" ? parse(startTime, "hh:mm a", new Date()) : new Date(2025, 0, 1, 8, 0);
    const end = endTime !== "all" ? parse(endTime, "hh:mm a", new Date()) : new Date(2025, 0, 1, 23, 59);

    return (
      bookingStart.getTime() >= start.getTime() &&
      bookingEnd.getTime() <= end.getTime()
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.boardroom.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === "all" ||
      booking.boardroom.location.id === selectedLocation;
    
    const matchesType =
      selectedType === "all" ||
      booking.isExsisting === (selectedType === "internel" ? true : false);

    const matchesStatus =
      selectedStatus === "all" || booking.status === selectedStatus;
      
    const matchesDate =
      !selectedDate ||
      format(new Date(booking.date), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd");

    const matchesTimeRange = isBookingInTimeRange(booking, selectedStartTime, selectedEndTime);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesStatus &&
      matchesDate &&
      matchesType &&
      matchesTimeRange
    );
  });

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
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Bookings Management"
          description="View and manage all room bookings across locations"
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredBookings.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
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
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full max-w-[300px] rounded-md border"
                  />
                </div>
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
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
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
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
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

                <div className="grid gap-2">
                  <Label>Booking Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Booking Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="internel">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <Select
                    value={selectedStartTime}
                    onValueChange={setSelectedStartTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All start times" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Start Times</SelectItem>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>End Time</Label>
                  <Select
                    value={selectedEndTime}
                    onValueChange={setSelectedEndTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All end times" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All End Times</SelectItem>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Bookings List */}
          <div className="col-span-3">
            {filteredBookings.length === 0 ? (
              <Card className="">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CalendarIcon className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-slate-500 text-center mb-6">
                    {selectedDate ||
                    searchTerm ||
                    selectedLocation !== "all" ||
                    selectedStatus !== "all" ||
                    selectedStartTime !== "all" ||
                    selectedEndTime !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "No bookings have been made yet."}
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {filteredBookings.length} booking
                    {filteredBookings.length !== 1 ? "s" : ""}
                    {selectedDate &&
                      ` for ${format(selectedDate, "MMMM d, yyyy")}`}
                  </p>
                </div>

                {filteredBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {booking.eventTitle}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.boardroom.location.name} -{" "}
                            {booking.boardroom.name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>

                          {/* Status Change Buttons */}
                          {booking.status === "pending" && (
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    booking.id,
                                    booking.UserID,
                                    "confirmed"
                                  )
                                }
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    booking.id,
                                    booking.UserID,
                                    "cancelled"
                                  )
                                }
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          {booking.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(
                                  booking.id,
                                  booking.UserID,
                                  "cancelled"
                                )
                              }
                              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            >
                              Cancel
                            </Button>
                          )}

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
                              onClick={() =>
                                handleDelete(booking.id, booking.UserID)
                              }
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
                          {format(new Date(booking.startTime), "HH:mm")} -{" "}
                          {format(new Date(booking.endTime), "HH:mm")}
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

                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-4 w-4 mr-2" />(
                            {booking.phoneNumber})
                          </div>
                          <div className="text-sm text-slate-500">
                            {booking.isExsisting ? (
                              <>
                                {booking.tokensUsed} token
                                {booking.tokensUsed !== 1 ? "s" : ""} used
                              </>
                            ) : (
                              "External Booking"
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-slate-400">
                            Booker ID: {booking.bookerId}
                          </div>
                          <div className="text-xs text-slate-400">
                            {booking.isExsisting ? (
                              <> User ID: {booking.UserID}</>
                            ) : (
                              <></>
                            )}
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
  );
}