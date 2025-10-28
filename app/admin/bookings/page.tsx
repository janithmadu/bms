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
  Loader2,
  Coins,
  X,
} from "lucide-react";
import {
  format,
  isToday,
  parse,
  isWithinInterval,
  startOfMinute,
  addMinutes,
} from "date-fns";
import { toast } from "sonner";
import { BookingDialog } from "@/components/admin/booking-dialog";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@prisma/client";

// === 1. UPDATE: Add financeStatus to Booking ===
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
  price?: number;
  phoneNumber: string;
  status: string;
  financeStatus?: "finance-pending" | "finance-approved" | "finance-rejected"; // ← NEW
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

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const downloadCSV = (data: any[], headers: string[], filename: string) => {
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      row
        .map((field: any) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    ),
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
  const [selectedBoardroom, setSelectedBoardroom] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("all");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("all");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isGlobalActionLoading, setIsGlobalActionLoading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        const allowedLocationIds =
          session?.user?.userLocations?.map((loc) => loc.locationId) || [];

        const filteredBookings = data.filter((booking: Booking) =>
          allowedLocationIds.includes(booking.boardroom.location.id)
        );

        if (session?.user.role === "admin") {
          setBookings(data);
        } else {
          setBookings(filteredBookings);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
      if (response.status === 401) {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `/api/locations?userId=${session?.user.id}&role=${session?.user.role}`
      );
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
      setLocations([]);
    }
  };

  const fetchAvailableSlots = async () => {
    if (
      !selectedDate ||
      selectedLocation === "all" ||
      selectedBoardroom === "all"
    ) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    try {
      const now = new Date();
      const minutes = now.getMinutes();
      const roundedMinutes = minutes < 30 ? 30 : 60;
      const currentTime = addMinutes(
        startOfMinute(now),
        roundedMinutes - minutes
      );

      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const earliestStartTime = isToday(selectedDate)
        ? addMinutes(startOfMinute(new Date()), roundedMinutes - minutes)
        : dayStart;

      const boardroomBookings = bookings.filter(
        (booking) =>
          booking.boardroom.id === selectedBoardroom &&
          format(new Date(booking.date), "yyyy-MM-dd") ===
            format(selectedDate, "yyyy-MM-dd")
      );

      const latestEndTime = boardroomBookings.reduce((latest, booking) => {
        const bookingEnd = new Date(booking.endTime);
        return bookingEnd > latest ? bookingEnd : latest;
      }, earliestStartTime);

      const allSlots: TimeSlot[] = [];
      let currentTimeSlot = new Date(latestEndTime);

      if (
        currentTimeSlot.getMinutes() !== 0 &&
        currentTimeSlot.getMinutes() !== 30
      ) {
        const minutesToNextSlot =
          currentTimeSlot.getMinutes() < 30
            ? 30 - currentTimeSlot.getMinutes()
            : 60 - currentTimeSlot.getMinutes();
        currentTimeSlot = addMinutes(currentTimeSlot, minutesToNextSlot);
      }

      while (currentTimeSlot < dayEnd) {
        const slotStart = new Date(currentTimeSlot);
        const slotEnd = new Date(currentTimeSlot.getTime() + 30 * 60 * 1000);

        allSlots.push({
          startTime: format(slotStart, "hh:mm a"),
          endTime: format(slotEnd, "hh:mm a"),
          isAvailable: true,
        });
        currentTimeSlot = slotEnd;
      }

      const available = allSlots.map((slot) => {
        const slotStart = parse(slot.startTime, "hh:mm a", selectedDate);
        const slotEnd = parse(slot.endTime, "hh:mm a", selectedDate);
        const isBooked = boardroomBookings.some(
          (booking) =>
            isWithinInterval(slotStart, {
              start: new Date(booking.startTime),
              end: new Date(booking.endTime),
            }) ||
            isWithinInterval(slotEnd, {
              start: new Date(booking.startTime),
              end: new Date(booking.endTime),
            }) ||
            (new Date(booking.startTime) <= slotStart &&
              new Date(booking.endTime) >= slotEnd)
        );
        return { ...slot, isAvailable: !isBooked };
      });

      setAvailableSlots(available);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (session?.user.id && session?.user.role) {
      Promise.all([fetchBookings(), fetchLocations(), fetchUsers()]);
    }
  }, [session?.user.id, session?.user.role]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate, selectedLocation, selectedBoardroom]);

  const handleDelete = async (bookingId: string, UserID: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? Tokens will be refunded."
      )
    )
      return;

    setIsGlobalActionLoading(true);
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
    } finally {
      setIsGlobalActionLoading(false);
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

    if (!confirm(`Are you sure you want to ${statusText} this booking?`))
      return;

    setIsGlobalActionLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setIsGlobalActionLoading(false);
    }
  };

  // === 2. NEW: Finance Approval Handler ===
  const handleFinanceStatusChange = async (
    bookingId: string,
    newStatus: "finance-approved" | "finance-rejected"
  ) => {
    const action =
      newStatus === "finance-approved" ? "finance-approve" : "finance-reject";

    if (
      !confirm(`Are you sure you want to ${action} this booking financially?`)
    )
      return;

    setIsGlobalActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/bookings/${bookingId}/finance-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ financeStatus: newStatus }),
        }
      );

      if (response.ok) {
        toast.success(`Finance ${action}ed successfully`);
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Failed to ${action} booking`);
    } finally {
      setIsGlobalActionLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedDate(new Date());
    setSelectedLocation("all");
    setSelectedBoardroom("all");
    setSelectedStatus("all");
    setSelectedType("all");
    setSelectedStartTime("all");
    setSelectedEndTime("all");
    setAvailableSlots([]);
    toast.success("Filters cleared");
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
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
      "Finance Status",
      "Boardroom Name",
      "Boardroom Capacity",
      "Location Name",
      "Location Address",
      "Created At",
      "Booking Type",
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
      booking.financeStatus || "N/A",
      booking.boardroom.name,
      booking.boardroom.capacity,
      booking.boardroom.location.name,
      booking.boardroom.location.address,
      format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm"),
      booking.isExsisting ? "Internal" : "External",
    ]);

    const dateStr = format(new Date(), "yyyy-MM-dd");
    downloadCSV(csvData, headers, `bookings_export_${dateStr}.csv`);
    toast.success("CSV exported successfully");
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      !searchTerm ||
      booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.boardroom.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === "all" ||
      booking.boardroom.location.id === selectedLocation;
    const matchesBoardroom =
      selectedBoardroom === "all" || booking.boardroom.id === selectedBoardroom;
    const matchesType =
      selectedType === "all" ||
      booking.isExsisting === (selectedType === "internal");
    const matchesStatus =
      selectedStatus === "all" || booking.status === selectedStatus;
    const matchesDate =
      !selectedDate ||
      format(new Date(booking.date), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd");

    const matchesTimeRange = (startTime: string, endTime: string) => {
      if (startTime === "all" && endTime === "all") return true;
      const bookingStart = parse(
        format(new Date(booking.startTime), "HH:mm"),
        "HH:mm",
        new Date()
      );
      const bookingEnd = parse(
        format(new Date(booking.endTime), "HH:mm"),
        "HH:mm",
        new Date()
      );
      const start =
        startTime !== "all"
          ? parse(startTime, "hh:mm a", new Date())
          : new Date(2025, 0, 1, 8, 0);
      const end =
        endTime !== "all"
          ? parse(endTime, "hh:mm a", new Date())
          : new Date(2025, 0, 1, 23, 59);
      return (
        bookingStart.getTime() >= start.getTime() &&
        bookingEnd.getTime() <= end.getTime()
      );
    };

    return (
      matchesSearch &&
      matchesLocation &&
      matchesBoardroom &&
      matchesStatus &&
      matchesDate &&
      matchesType &&
      matchesTimeRange(selectedStartTime, selectedEndTime)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bookings" description="Manage all room bookings" />
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      {isGlobalActionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-lg font-medium">Processing action...</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <PageHeader
          title="Bookings Management"
          description="View and manage all room bookings across locations"
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredBookings.length === 0 || isGlobalActionLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <Dialog
              open={isFilterModalOpen}
              onOpenChange={setIsFilterModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (locations.length === 0 && !isLoading) {
                      toast.info("Loading locations...");
                      fetchLocations().then(() => setIsFilterModalOpen(true));
                    } else {
                      setIsFilterModalOpen(true);
                    }
                  }}
                  disabled={isGlobalActionLoading}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {filteredBookings.length !== bookings.length && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0">
                      {filteredBookings.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Filter Bookings</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFilterModalOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="search"
                        placeholder="Search by title, name, email, or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedBoardroom("all");
                          setAvailableSlots([]);
                        }}
                        className="rounded-md border w-full"
                      />
                      {selectedDate && (
                        <p className="text-sm text-slate-500">
                          {format(selectedDate, "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        value={selectedLocation}
                        onValueChange={(value) => {
                          setSelectedLocation(value);
                          setSelectedBoardroom("all");
                          setAvailableSlots([]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Locations ({locations.length})
                          </SelectItem>
                          {locations.length > 0 ? (
                            locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem
                              value="no-locations"
                              disabled
                              className="text-slate-400"
                            >
                              No locations available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedLocation !== "all" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Boardroom</Label>
                        <Select
                          value={selectedBoardroom}
                          onValueChange={(value) => {
                            setSelectedBoardroom(value);
                            setAvailableSlots([]);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All boardrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Boardrooms</SelectItem>
                            {locations
                              .find((loc) => loc.id === selectedLocation)
                              ?.boardrooms.map((boardroom) => (
                                <SelectItem
                                  key={boardroom.id}
                                  value={boardroom.id}
                                >
                                  {boardroom.name}
                                </SelectItem>
                              )) || (
                              <SelectItem
                                value="no-boardrooms"
                                disabled
                                className="text-slate-400"
                              >
                                No boardrooms available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedDate &&
                    selectedLocation !== "all" &&
                    selectedBoardroom !== "all" && (
                      <div className="space-y-2">
                        <Label>Available Time Slots</Label>
                        {isLoadingSlots ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                            {availableSlots.map((slot, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="text-sm"
                                onClick={() => {
                                  setSelectedStartTime(slot.startTime);
                                  setSelectedEndTime(slot.endTime);
                                  setIsFilterModalOpen(false);
                                  toast.success(
                                    `Selected slot: ${slot.startTime} - ${slot.endTime}`
                                  );
                                }}
                              >
                                {slot.startTime} - {slot.endTime}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            {isToday(selectedDate)
                              ? "No slots available after current time."
                              : "No available slots for the selected criteria."}
                          </p>
                        )}
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
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
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Booking Type</Label>
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsFilterModalOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isGlobalActionLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </PageHeader>

        <div className="lg:col-span-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CalendarIcon className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No bookings found
                </h3>
                <p className="text-slate-500 text-center mb-6">
                  {searchTerm ||
                  selectedDate ||
                  selectedLocation !== "all" ||
                  selectedBoardroom !== "all" ||
                  selectedStatus !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "No bookings have been made yet."}
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isGlobalActionLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Booking
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Showing {filteredBookings.length} of {bookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""}
                {selectedDate && ` for ${format(selectedDate, "MMMM d, yyyy")}`}
              </p>

              {filteredBookings.map((booking) => {
                const isExternal = !booking.isExsisting;
                const userRole = session?.user.role;

                return (
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

                        {/* === ACTION BUTTONS === */}
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`
    inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
    ${
      booking.status === "confirmed"
        ? "bg-green-100 text-green-800 border-green-300"
        : booking.status === "pending"
        ? "bg-amber-100 text-amber-800 border-amber-300"
        : booking.status === "cancelled"
        ? "bg-red-100 text-red-800 border-red-300"
        : "bg-gray-100 text-gray-800 border-gray-300"
    }
  `}
                          >
                            {booking.status}
                          </Badge>

                          <Badge
                            className={`
    inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
    ${
      booking.financeStatus === "finance-approved"
        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
        : booking.financeStatus === "finance-pending"
        ? "bg-orange-100 text-orange-800 border-orange-300"
        : booking.financeStatus === "finance-rejected"
        ? "bg-red-100 text-red-800 border-red-300"
        : "bg-gray-100 text-gray-800 border-gray-300"
    }
  `}
                          >
                            {booking.financeStatus ?? "N/A"}
                          </Badge>

                          {/* Pending: Internal → Normal Approve/Reject */}
                          {booking.status === "pending" &&
                            booking.financeStatus !== "finance-pending" &&
                            userRole !== "financeadmin" && (
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
                                  disabled={isGlobalActionLoading}
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
                                  disabled={isGlobalActionLoading}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}

                          {/* Pending: External → Finance Admin */}
                          {booking.status === "pending" &&
                            isExternal &&
                            userRole === "financeadmin" &&
                            (!booking.financeStatus ||
                              booking.financeStatus === "finance-pending") && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleFinanceStatusChange(
                                      booking.id,
                                      "finance-approved"
                                    )
                                  }
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  disabled={isGlobalActionLoading}
                                >
                                  Finance Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleFinanceStatusChange(
                                      booking.id,
                                      "finance-rejected"
                                    )
                                  }
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  disabled={isGlobalActionLoading}
                                >
                                  Finance Reject
                                </Button>
                              </div>
                            )}

                          {/* Pending: External → Manager Final Approve */}
                          {booking.status === "pending" &&
                            isExternal &&
                            userRole === "manager" &&
                            booking.financeStatus === "finance-approved" && (
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
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                disabled={isGlobalActionLoading}
                              >
                                Final Approve
                              </Button>
                            )}

                          {/* Confirmed → Cancel */}
                          {booking.status === "confirmed" &&
                            userRole !== "financeadmin" && (
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
                                disabled={isGlobalActionLoading}
                              >
                                Cancel
                              </Button>
                            )}

                          {/* Edit / Delete */}
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(booking)}
                              disabled={
                                isGlobalActionLoading ||
                                userRole === "financeadmin"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                booking.status !== "cancelled" ||
                                isGlobalActionLoading ||
                                userRole === "financeadmin"
                              }
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
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        {booking?.price && booking.price > 0 && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Coins className="h-4 w-4 mr-2" />
                            {booking.price} LKR
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {booking.bookerName} ({booking.bookerEmail})
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {booking.phoneNumber}
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
                          {booking.isExsisting && (
                            <div className="text-xs text-slate-400">
                              User :{" "}
                              {users.find((user) => user.id === booking.UserID)
                                ?.name ?? booking.UserID}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
