import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar as CalIcon, Clock } from "lucide-react";

interface TimeSlotSelectorProps {
  selectedDate: Date | undefined;
  availableStartSlots: string[];
  generateTimeSlots: (interval: number) => string[];
  allowedDurationsForStart: (startHHMM: string) => number[];
  selectedStart: string | null;
  setSelectedStart: (start: string | null) => void;
  selectedDuration: number | null;
  setSelectedDuration: (duration: number | null) => void;
  onBack: () => void;
  onContinue: () => void;
  formattedSelectedDate: string;
}

export default function TimeSlotSelector({
  selectedDate,
  availableStartSlots,
  generateTimeSlots,
  allowedDurationsForStart,
  selectedStart,
  setSelectedStart,
  selectedDuration,
  setSelectedDuration,
  onBack,
  onContinue,
  formattedSelectedDate,
}: TimeSlotSelectorProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl shadow-md p-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalIcon className="h-4 w-4 text-slate-500" />
              {formattedSelectedDate || "Select a date"}
            </span>
            <span className="text-sm text-slate-500">{availableStartSlots.length} available starts</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {availableStartSlots.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No available slots on this date.</div>
          ) : (
            <>
              <div className="text-xs text-slate-600 mb-2">
                White slots are available, red slots are booked.
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {generateTimeSlots(30).map((slot) => {
                  const available = availableStartSlots.includes(slot);
                  const selected = selectedStart === slot;
                  return (
                    <motion.button
                      key={slot}
                      disabled={!available}
                      onClick={() => {
                        if (!available) return;
                        setSelectedStart(slot);
                        // Choose default duration as 60 if allowed, else pick first allowed
                        const allowed = allowedDurationsForStart(slot);
                        setSelectedDuration(available ? (allowed.includes(60) ? 60 : allowed[0] ?? null) : null);
                      }}
                      className={`text-sm px-3 py-2 rounded-lg border transition-colors duration-150 ${
                        available
                          ? selected
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent"
                            : "bg-white border-slate-200 hover:shadow"
                          : "bg-red-100 text-red-700 border-red-200 cursor-not-allowed animate-pulse-glow-booked"
                      }`}
                      animate={
                        !available
                          ? {
                              boxShadow: [
                                "0 0 8px rgba(239, 68, 68, 0.3)",
                                "0 0 12px rgba(239, 68, 68, 0.5)",
                                "0 0 8px rgba(239, 68, 68, 0.3)",
                              ],
                              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                            }
                          : {}
                      }
                      title={available ? "Available" : "Booked"}
                    >
                      {slot}
                    </motion.button>
                  );
                })}
              </div>

              {/* Duration choices (appear after choosing a start) */}
              {selectedStart && (
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl shadow-sm border border-slate-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Selected start: <span className="font-semibold text-blue-600">{selectedStart}</span>
                  </div>
                  {allowedDurationsForStart(selectedStart).length === 0 ? (
                    <div className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> No valid durations
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                      {allowedDurationsForStart(selectedStart).map((dur) => {
                        const hours = dur / 60;
                        const label = hours % 1 === 0 ? `${hours} hr` : `${Math.floor(hours)} hr ${dur % 60} min`;
                        return (
                          <motion.button
                            key={dur}
                            onClick={() => setSelectedDuration(dur)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                              selectedDuration === dur
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {label}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={onBack}>
                      Back
                    </Button>
                    <Button
                      onClick={onContinue}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      disabled={!selectedStart || !selectedDuration}
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
