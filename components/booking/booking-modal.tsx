"use client";

import { useEffect, useMemo, useState } from "react";
import {
  format,
  addDays,
  isSameDay,
  startOfDay,
  getHours,
  getMinutes,
} from "date-fns";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

import BoardroomDetails from "./BoardroomDetails";
import DateSelector from "./DateSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import { StepPill } from "./StepPill";
import { Calendar, Clock, CheckCircle } from "lucide-react";

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
  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [tokensRequired, setTokensRequired] = useState<number>(0);
  const [selectedPriceOption,setselectedPriceOption]= useState<string>("");
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

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedDate(new Date());
      setSelectedStart(null);
      setSelectedDuration(null);
      setIsExistingUser(false);
      setUserId("");
      setTokenData(null);
      fetchBoardroomBookings();
    }
  }, [open, boardroom?.id]);

  useEffect(() => {
    if (isExistingUser && tokenData && selectedDuration) {
      const hours = selectedDuration / 60;
      setTokensRequired(Math.ceil(hours));
    } else {
      setTokensRequired(0);
    }
  }, [selectedDuration, isExistingUser, tokenData]);

  const fetchTokenData = async (id: string) => {
    try {
      if (!id) {
        setTokenData(null);
        return;
      }
      const res = await fetch(`/api/public/users/${id}`);
      if (!res.ok) {
        setTokenData(null);
        return;
      }
      const data = await res.json();
      setTokenData(data);
    } catch (err) {
      console.error("fetchTokenData error:", err);
      setTokenData(null);
    }
  };

  const fetchBoardroomBookings = async () => {
    if (!boardroom?.id) return;
    try {
      const res = await fetch(`/api/boardrooms/${boardroom.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setExistingBookings(data.bookings || []);
    } catch (err) {
      console.error("fetchBoardroomBookings error:", err);
    }
  };

  const generateTimeSlots = (intervalMinutes = 30) => {
    const slots: string[] = [];
    const now = new Date();
    const isToday = selectedDate && isSameDay(selectedDate, now);
    const currentHour = getHours(now);
    const currentMinute = getMinutes(now);
    const startHour = isToday ? currentHour + (currentMinute >= 30 ? 1 : 0) : 0;

    for (let hour = startHour; hour < 24; hour++) {
      const base = hour * 60;
      const startMinute =
        isToday && hour === startHour && currentMinute > 0 && currentMinute < 30
          ? 30
          : 0;
      for (let m = startMinute; m < 60; m += intervalMinutes) {
        const hh = Math.floor((base + m) / 60);
        const mm = (base + m) % 60;
        slots.push(
          `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
        );
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

  const bookedIntervalsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return existingBookings
      .filter((b) => isSameDay(new Date(b.date || b.startTime), selectedDate))
      .map((b) => ({
        start: new Date(b.startTime),
        end: new Date(b.endTime),
      }));
  }, [existingBookings, selectedDate]);

  const intervalOverlaps = (start: Date, end: Date) => {
    return bookedIntervalsForSelectedDate.some(
      (bi) => start < bi.end && end > bi.start
    );
  };

  const isStartAvailableForDuration = (
    startHHMM: string,
    durationMinutes: number
  ) => {
    if (!selectedDate) return false;
    const start = parseTimeToDate(selectedDate, startHHMM);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const lastPossible = addDays(startOfDay(selectedDate), 1);
    if (end > lastPossible) return false;
    return !intervalOverlaps(start, end);
  };

  const availableStartSlots = useMemo(() => {
    if (!selectedDate) return [];
    const all = generateTimeSlots(30);
    return all.filter((slot) => isStartAvailableForDuration(slot, 30));
  }, [selectedDate, existingBookings]);

  const allowedDurationsForStart = (startHHMM: string) => {
    const choices = Array.from({ length: 48 }, (_, i) => (i + 1) * 30);
    return choices.filter((dur) => isStartAvailableForDuration(startHHMM, dur));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedStart || !selectedDuration) {
      toast.error("Please complete all selections");
      return;
    }
    if (isExistingUser && !userId.trim()) {
      toast.error("User ID required for existing users");
      return;
    }
    if (
      isExistingUser &&
      tokenData &&
      tokensRequired > tokenData.tokensAvailable
    ) {
      toast.error("Insufficient tokens for this booking");
      return;
    }

    setIsLoading(true);
    try {
      const start = parseTimeToDate(selectedDate, selectedStart);
      const end = new Date(start.getTime() + selectedDuration * 60 * 1000);

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
        setFormData({
          eventTitle: "",
          bookerName: "",
          bookerEmail: "",
          phoneNumber: "",
        });
        setUserId("");
        setIsExistingUser(false);
        setSelectedStart(null);
        setSelectedDuration(null);
        setStep(1);
        onOpenChange(false);
      } else {
        const err = await resp.json();
        toast.error(err?.error || "Failed to create booking");
      }
    } catch (err) {
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  const canBookDate = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);
    return date >= today && date <= maxDate;
  };

  const formattedSelectedDate = selectedDate
    ? format(selectedDate, "MMMM d, yyyy")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book {boardroom?.name}
          </DialogTitle>
          <DialogDescription className="flex items-center text-slate-600">
            <MapPin className="h-4 w-4 mr-1" />
            {location?.name} - {location?.address}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 px-4">
          <div className="flex items-center gap-4">
            <StepPill
              idx={1}
              title="Details & Date"
              active={step === 1}
              done={step > 1}
              icon={Calendar}
            />
            <div className="h-[2px] flex-1 bg-slate-200" />
            <StepPill
              idx={2}
              title="Choose Time"
              active={step === 2}
              done={step > 2}
              icon={Clock}
            />
            <div className="h-[2px] flex-1 bg-slate-200" />
            <StepPill
              idx={3}
              title="Confirm"
              active={step === 3}
              done={step > 3}
              icon={CheckCircle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4 pb-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="md:flex gap-4">
                <BoardroomDetails boardroom={boardroom} />
                <DateSelector
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  canBookDate={canBookDate}
                />
              </div>
            )}
            {step === 2 && (
              <TimeSlotSelector
                selectedDate={selectedDate}
               setSelectedPriceOption={setselectedPriceOption}
                availableStartSlots={availableStartSlots}
                generateTimeSlots={generateTimeSlots}
                allowedDurationsForStart={allowedDurationsForStart}
                selectedStart={selectedStart}
                setSelectedStart={setSelectedStart}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                formattedSelectedDate={formattedSelectedDate}
                isExistingUser={isExistingUser}
                pricingOptions={boardroom?.pricingOptions || []}
                tokenData={tokenData}
                tokensRequired={tokensRequired}
              />
            )}
            {step === 3 && (
              <BookingForm formData={formData} setFormData={setFormData} />
            )}
          </div>

          <BookingSummary
            step={step}
            boardroom={boardroom}
            formattedSelectedDate={formattedSelectedDate}
            selectedStart={selectedStart}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
              selectedPriceOptionSeat={selectedPriceOption}
            isExistingUser={isExistingUser}
            setIsExistingUser={setIsExistingUser}
            userId={userId}
            setUserId={setUserId}
            fetchTokenData={fetchTokenData}
            tokenData={tokenData}
            tokensRequired={tokensRequired}
            isLoading={isLoading}
            pricingOptions={boardroom?.pricingOptions || []}
            onStepBack={() => setStep((prev) => Math.max(1, prev - 1))}
            onStepForward={() => {
              // STEP 1 VALIDATION
              if (step === 1) {
                if (!selectedDate) {
                  toast.error("Please select a date");
                  return;
                }
                if (isExistingUser && !userId.trim()) {
                  toast.error("Please enter User ID for existing user");
                  return;
                }
              }

              // STEP 2 VALIDATION
              if (step === 2 && (!selectedStart || !selectedDuration)) {
                toast.error("Please select a start time and duration");
                return;
              }

              setStep((prev) => Math.min(3, prev + 1));
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
