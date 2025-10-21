import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar as CalIcon, Clock, Coins } from "lucide-react";
import { useState } from "react";

interface TimeSlotSelectorProps {
  selectedDate: Date | undefined;
  availableStartSlots: string[];
  generateTimeSlots: (interval: number) => string[];
  allowedDurationsForStart: (startHHMM: string) => number[];
  selectedStart: string | null;
  setSelectedStart: (start: string | null) => void;
  selectedDuration: number | null;
  setSelectedDuration: (duration: number | null) => void;
  formattedSelectedDate: string;
  isExistingUser: boolean;
  pricingOptions: any[];
  tokenData: any;
  tokensRequired: number;
    setSelectedPriceOption: React.Dispatch<React.SetStateAction<string>>;
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
  formattedSelectedDate,
  setSelectedPriceOption,
  isExistingUser,
  pricingOptions,
  tokenData,
  tokensRequired,
}: TimeSlotSelectorProps) {
  // FIXED: Store selected pricing option
  const [selectedPricingOption, setSelectedPricingOption] = useState<any>(null);

  const generateDurationOptions = () => {
    const options = [];
    for (let i = 1; i <= 48; i++) {
      const minutes = i * 30;
      const hours = minutes / 60;
      options.push({
        minutes,
        label:
          hours % 1 === 0
            ? `${hours} hr`
            : `${Math.floor(hours)} hr ${minutes % 60} min`,
      });
    }
    return options;
  };

  // Handle pricing option selection
  const handlePricingSelect = (option: any) => {
    setSelectedPricingOption(option);
    setSelectedDuration(parseInt(option.timeRange) * 60);
    setSelectedPriceOption(option.seatingArrangement)
    
  };

  // Handle token duration selection
  const handleTokenDurationSelect = (minutes: number) => {
    setSelectedPricingOption(null);
    setSelectedDuration(minutes);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl shadow-md p-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalIcon className="h-4 w-4 text-slate-500" />
              {formattedSelectedDate || "Select a date"}
            </span>
            <span className="text-sm text-slate-500">
              {availableStartSlots.length} available starts
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {availableStartSlots.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No available slots on this date.
            </div>
          ) : (
            <>
              {/* TIME SLOTS */}
              <div className="text-xs text-slate-600 mb-2">
                White slots are available, red slots are booked.
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
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
                        setSelectedDuration(null);
                        setSelectedPricingOption(null); // FIXED: Reset pricing
                      }}
                      className={`text-sm px-3 py-2 rounded-lg border transition-colors duration-150 ${
                        available
                          ? selected
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent"
                            : "bg-white border-slate-200 hover:shadow"
                          : "bg-red-100 text-red-700 border-red-200 cursor-not-allowed"
                      }`}
                      title={available ? "Available" : "Booked"}
                    >
                      {slot}
                    </motion.button>
                  );
                })}
              </div>

              {/* DURATION OPTIONS - EXISTING USER */}
              {isExistingUser && selectedStart && (
                <motion.div
                  className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-sm font-medium mb-3 text-amber-700">
                    <Clock className="h-4 w-4" />
                    Select Duration (Tokens)
                  </div>

                  {/* TOKENS INFO */}
                  {tokenData && (
                    <div className="mb-3 p-2 bg-white rounded-lg text-xs">
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-medium text-green-600">
                          {tokenData.tokensAvailable}
                        </span>
                      </div>
                      <div
                        className={`${
                          tokensRequired > tokenData.tokensAvailable
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        Required: {tokensRequired} token
                        {tokensRequired !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}

                  {/* 30-MIN SLOTS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                    {generateDurationOptions().map((opt) => {
                      const available = allowedDurationsForStart(
                        selectedStart
                      ).includes(opt.minutes);
                      return (
                        <motion.button
                          key={opt.minutes}
                          disabled={!available}
                          onClick={() => handleTokenDurationSelect(opt.minutes)}
                          className={`px-2 py-2 rounded text-xs font-medium border transition-all ${
                            available
                              ? selectedDuration === opt.minutes
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {opt.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* DURATION OPTIONS - NEW USER - FIXED BOTH SELECTIONS */}
              {!isExistingUser && selectedStart && (
                <motion.div
                  className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-sm font-medium mb-3 text-green-700">
                    <Coins className="h-4 w-4" />
                    Select Duration (LKR)
                  </div>

                  <div className="space-y-2">
                    {pricingOptions.map((opt) => {
                      const durationMinutes = parseInt(opt.timeRange) * 60;
                      const available =
                        allowedDurationsForStart(selectedStart).includes(
                          durationMinutes
                        );
                      const isSelected = selectedPricingOption === opt; // FIXED: EXACT MATCH!
                      return (
                        <motion.button
                          key={`${opt.timeRange}-${opt.seatingArrangement}`}
                          disabled={!available}
                          onClick={() => handlePricingSelect(opt)}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            available && isSelected
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-md"
                              : available
                              ? "bg-white border-slate-200 hover:bg-green-50"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {opt.timeRange}hr ({opt.seatingArrangement} seats)
                            </span>
                            <span className="text-lg font-bold">
                              LKR {opt.price}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
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
