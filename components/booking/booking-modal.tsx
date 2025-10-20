
"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addDays, isSameDay, startOfDay, getHours, getMinutes } from "date-fns";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, CheckCircle, Clock, MapPin } from "lucide-react";

import BoardroomDetails from "./BoardroomDetails";
import DateSelector from "./DateSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import { StepPill } from "./StepPill";

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

export function BookingModal({ open, onOpenChange, boardroom, location }: BookingModalProps) {
  // Steps: 1 = details + calendar, 2 = timeslot selection, 3 = details & confirm
  const [step, setStep] = useState<number>(1);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null); // "HH:mm"
  const [selectedDuration, setSelectedDuration] = useState<number | null>(60); // minutes
  const [tokensRequired, setTokensRequired] = useState<number>(0);

  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userId, setUserId] = useState("");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const [formData, setFormData] = useState({
    eventTitle: "",
    bookerName: "",
    bookerEmail: "",
    phoneNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedDate(new Date());
      setSelectedStart(null);
      setSelectedDuration(60);
      fetchBoardroomBookings();
      fetchTokenData(userId);
    }
  }, [open, boardroom?.id]);

  // Token calculation only for existing users with token data
  useEffect(() => {
    if (isExistingUser && tokenData && selectedStart && selectedDuration) {
      const hours = selectedDuration / 60;
      setTokensRequired(Math.ceil(hours));
    } else {
      setTokensRequired(0);
    }
  }, [selectedStart, selectedDuration, isExistingUser, tokenData]);

  // --- API fetches ---
  const fetchTokenData = async (id: string) => {
    try {
      if (!id) {
        return;
      }
      const res = await fetch(`/api/public/users/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setTokenData(data);
    } catch (err) {
      console.error("fetchTokenData error:", err);
    }
  };

  const fetchBoardroomBookings = async () => {
    if (!boardroom?.id) return;
    try {
      const res = await fetch(`/api/boardrooms/${boardroom.id}`);
      if (!res.ok) {
        console.error("Failed to fetch bookings");
        return;
      }
      const data = await res.json();
      setExistingBookings(data.bookings || []);
    } catch (err) {
      console.error("fetchBoardroomBookings error:", err);
    }
  };

  // --- Utilities to generate and check timeslots ---
  const generateTimeSlots = (intervalMinutes = 30) => {
    const slots: string[] = [];
    const now = new Date();
    const isToday = selectedDate && isSameDay(selectedDate, now);
    const currentHour = getHours(now);
    const currentMinute = getMinutes(now);
    // If today, start from the next 30-minute slot after current time
    const startHour = isToday ? currentHour + (currentMinute >= 30 ? 1 : 0) : 0;

    for (let hour = startHour; hour < 24; hour++) {
      const base = hour * 60;
      // If today and starting from current hour, adjust starting minute
      const startMinute = isToday && hour === startHour && currentMinute > 0 && currentMinute < 30 ? 30 : 0;
      for (let m = startMinute; m < 60; m += intervalMinutes) {
        const hh = Math.floor((base + m) / 60);
        const mm = (base + m) % 60;
        slots.push(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const parseTimeToDate = (date: Date, timeHHMM: string) => {
    const [hh, mm] = timeHHMM.split(":").map((x) => parseInt(x, 10));
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  };

  // Booked intervals for selectedDate => array of { start: Date, end: Date }
  const bookedIntervalsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return existingBookings
      .filter((b) => {
        const bookingDate = new Date(b.date || b.startTime);
        return isSameDay(bookingDate, selectedDate);
      })
      .map((b) => {
        const s = new Date(b.startTime);
        const e = new Date(b.endTime);
        return { start: s, end: e };
      });
  }, [existingBookings, selectedDate]);

  // Check if a proposed interval overlaps bookings
  const intervalOverlaps = (start: Date, end: Date) => {
    return bookedIntervalsForSelectedDate.some((bi) => start < bi.end && end > bi.start);
  };

  // Is a start slot available for a given duration
  const isStartAvailableForDuration = (startHHMM: string, durationMinutes: number) => {
    if (!selectedDate) return false;
    const start = parseTimeToDate(selectedDate, startHHMM);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    // Don't allow end beyond next day 00:00
    const lastPossible = addDays(startOfDay(selectedDate), 1);
    if (end > lastPossible) return false;
    return !intervalOverlaps(start, end);
  };

  // Available start slots (not conflicting even for minimal duration 30m)
  const availableStartSlots = useMemo(() => {
    if (!selectedDate) return [];
    const all = generateTimeSlots(30);
    return all.filter((slot) => isStartAvailableForDuration(slot, 30));
  }, [selectedDate, existingBookings]);

  // Duration choices from 30 min to 24 hours in 30 min increments
  const allowedDurationsForStart = (startHHMM: string) => {
    const choices = Array.from({ length: 48 }, (_, i) => (i + 1) * 30); // 30 min to 1440 min (24 hours)
    return choices.filter((dur) => isStartAvailableForDuration(startHHMM, dur));
  };

  // --- Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please choose a date");
      return;
    }
    if (!selectedStart || !selectedDuration) {
      toast.error("Please select a start time and duration");
      return;
    }
    if (isExistingUser && !userId.trim()) {
      toast.error("User ID required for existing users");
      return;
    }
    if (isExistingUser && tokenData && tokensRequired > tokenData.tokensAvailable) {
      toast.error("Insufficient tokens for this booking");
      return;
    }

    setIsLoading(true);
    try {
      const start = parseTimeToDate(selectedDate, selectedStart);
      const end = new Date(start.getTime() + selectedDuration * 60 * 1000);

      // Double-check no overlap before sending
      if (intervalOverlaps(start, end)) {
        toast.error("Selected slot conflicts with an existing booking");
        setIsLoading(false);
        return;
      }

      const resp = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString(),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          boardroomId: boardroom.id,
          isExistingUser,
          UserID: isExistingUser ? userId : null,
        }),
      });

      if (resp.ok) {
        toast.success("Booking confirmed!");
        // Reset & close
        setFormData({ eventTitle: "", bookerName: "", bookerEmail: "", phoneNumber: "" });
        setUserId("");
        setIsExistingUser(false);
        setSelectedStart(null);
        setSelectedDuration(60);
        setStep(1);
        onOpenChange(false);
      } else {
        const err = await resp.json();
        toast.error(err?.error || "Failed to create booking");
      }
    } catch (err) {
      console.error("create booking error", err);
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helpers for UI ---
  const canBookDate = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);
    return date >= today && date <= maxDate;
  };

  const formattedSelectedDate = selectedDate ? format(selectedDate, "MMMM d, yyyy") : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book {boardroom?.name}</DialogTitle>
          <DialogDescription className="flex items-center text-slate-600">
            <MapPin className="h-4 w-4 mr-1" />
            {location?.name} - {location?.address}
          </DialogDescription>
        </DialogHeader>

        {/* Progress / Stepper */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-4">
            <StepPill idx={1} title="Details & Date" active={step === 1} done={step > 1} icon={Calendar} />
            <div className="h-[2px] flex-1 bg-slate-200" />
            <StepPill idx={2} title="Choose Time" active={step === 2} done={step > 2} icon={Clock} />
            <div className="h-[2px] flex-1 bg-slate-200" />
            <StepPill idx={3} title="Confirm" active={step === 3} done={step > 3} icon={CheckCircle} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4 pb-8">
          {/* LEFT: Main content (step/card area) */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="md:flex gap-4">
                <BoardroomDetails boardroom={boardroom} />
                <DateSelector
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  canBookDate={canBookDate}
                  onContinue={() => setStep(2)}
                />
              </div>
            )}
            {step === 2 && (
              <TimeSlotSelector
                selectedDate={selectedDate}
                availableStartSlots={availableStartSlots}
                generateTimeSlots={generateTimeSlots}
                allowedDurationsForStart={allowedDurationsForStart}
                selectedStart={selectedStart}
                setSelectedStart={setSelectedStart}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
                formattedSelectedDate={formattedSelectedDate}
              />
            )}
            {step === 3 && (
              <BookingForm
                formData={formData}
                setFormData={setFormData}
                isExistingUser={isExistingUser}
                setIsExistingUser={setIsExistingUser}
                userId={userId}
                setUserId={setUserId}
                fetchTokenData={fetchTokenData}
                tokenData={tokenData}
                tokensRequired={tokensRequired}
                selectedStart={selectedStart}
                selectedDuration={selectedDuration}
                isLoading={isLoading}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
              />
            )}
          </div>

          {/* RIGHT: Sticky summary */}
          <BookingSummary
            boardroom={boardroom}
            formattedSelectedDate={formattedSelectedDate}
            selectedStart={selectedStart}
            selectedDuration={selectedDuration}
            isExistingUser={isExistingUser}
            tokenData={tokenData}
            onEditDate={() => setStep(1)}
            onEditTime={() => setStep(2)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
