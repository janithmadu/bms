import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, CheckCircle,  Clock, Coins } from "lucide-react";

interface PricingOption {
  price: string;
  timeRange: string;
  seatingArrangement: string;
}

interface BookingSummaryProps {
  step: number;
  boardroom: any;
  formattedSelectedDate: string;
  selectedStart: string | null;
  selectedDuration: number | null;
  setSelectedDuration: (duration: number | null) => void;
  isExistingUser: boolean;
  setIsExistingUser: (value: boolean) => void;
  userId: string;
  setUserId: (id: string) => void;
  fetchTokenData: (id: string) => void;
  tokenData: { tokensAvailable: number; tokensUsed: number; initialCount: number } | null;
  tokensRequired: number;
  isLoading: boolean;
  pricingOptions: PricingOption[];
  onStepBack: () => void;
  onStepForward: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedPriceOptionSeat:string
}

export default function BookingSummary({
  step,
  boardroom,
  formattedSelectedDate,
  selectedStart,
  selectedDuration,
  setSelectedDuration,
  isExistingUser,
  setIsExistingUser,
  selectedPriceOptionSeat,
  userId,
  setUserId,
  fetchTokenData,
  tokenData,
  tokensRequired,
  isLoading,
  pricingOptions,
  onStepBack,
  onStepForward,
  onSubmit,
}: BookingSummaryProps) {
  const getSelectedPriceAndSeating = () => {
    if (!selectedDuration || isExistingUser) return { price: null, seating: null };
    
    const hours = selectedDuration / 60;
    const match = pricingOptions.find(opt => parseInt(opt.timeRange) === hours && selectedPriceOptionSeat === opt.seatingArrangement);
    return { 
      price: match ? match.price : null, 
      seating: match ? match.seatingArrangement : null 
    };
  };

 
  

  const selectedPriceData = getSelectedPriceAndSeating();
   
  const getButtons = () => {
    if (step === 1) {
      const isDisabled = !formattedSelectedDate || (isExistingUser && !userId.trim());
      
      return (
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={onStepForward}
          disabled={isDisabled}
        >
          Continue to Time Selection
        </Button>
      );
    }
    
    if (step === 2) {
      return (
        <>
          <Button variant="outline" className="w-full mb-2" onClick={onStepBack}>
            Back to Date
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            onClick={onStepForward}
            disabled={!selectedStart || !selectedDuration}
          >
            Continue to Confirmation
          </Button>
        </>
      );
    }
    
    if (step === 3) {
      const isDisabled = isLoading || 
        !selectedStart || 
        !selectedDuration || 
        (isExistingUser && (!userId.trim() || (tokenData && tokensRequired > tokenData.tokensAvailable)));
      
      return (
        <>
          <Button variant="outline" className="w-full mb-2" onClick={onStepBack}>
            Back to Time
          </Button>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            onClick={onSubmit}
            disabled={isDisabled as any}
          >
            {isLoading ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Creating Booking...
              </>
            ) : (
              `Confirm Booking ${isExistingUser ? `(${tokensRequired} token${tokensRequired !== 1 ? "s" : ""})` : `LKR ${selectedPriceData.price}`}`
            )}
          </Button>
        </>
      );
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <Card className="rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{boardroom?.name}</div>
                <div className="text-xs text-slate-500">{boardroom?.capacity} people</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="existingUser"
                  checked={isExistingUser}
                  onCheckedChange={(ch) => {
                    setIsExistingUser(ch as boolean);
                    if (!ch) setUserId("");
                  }}
                />
                <Label htmlFor="existingUser" className="text-sm font-medium">Existing user?</Label>
              </div>

              {isExistingUser && (
                <div className="space-y-2">
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      fetchTokenData(e.target.value);
                    }}
                    placeholder="Enter User ID"
                    className={userId.trim() === "" ? "border-red-300" : ""}
                  />
                  {tokenData && (
                    <div className="text-xs text-amber-600 flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Available: <span className="font-medium">{tokenData.tokensAvailable}</span> tokens
                    </div>
                  )}
                  {!userId.trim() && (
                    <div className="text-xs text-red-500">User ID required</div>
                  )}
                </div>
              )}
            </div>

            <div className="text-sm text-slate-600 space-y-2 mt-3">
              <div><strong>Date:</strong> {formattedSelectedDate || "-"}</div>
            </div>
            <div className="mt-6 space-y-2">{getButtons()}</div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <Card className="rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{boardroom?.name}</div>
                <div className="text-xs text-slate-500">{boardroom?.capacity} people</div>
              </div>
            </div>
            
            <div className="text-sm text-slate-600 space-y-2 mt-3">
              <div><strong>Date:</strong> {formattedSelectedDate}</div>
              <div><strong>Start:</strong> {selectedStart || "-"}</div>
              <div><strong>Duration:</strong> {selectedDuration ? `${Math.floor(selectedDuration / 60)} hr ${selectedDuration % 60} min` : "-"}</div>
              
              {isExistingUser ? (
                tokenData && (
                  <div className="text-xs text-amber-600 flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    Tokens Required: <span className="font-medium">{tokensRequired}</span>
                  </div>
                )
              ) : (
                selectedPriceData.price && (
                  <div className="space-y-1">
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Total: <span className="font-medium">LKR {selectedPriceData.price}</span>
                    </div>
                    {selectedPriceData.seating && (
                      <div className="text-xs text-slate-500">
                        {selectedPriceData.seating}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            
            <div className="mt-6 space-y-2">{getButtons()}</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-24 space-y-4">
        <Card className="rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{boardroom?.name}</div>
              <div className="text-xs text-slate-500">{boardroom?.capacity} people</div>
            </div>
          </div>

          <div className="text-sm text-slate-600 space-y-1 mb-4">
            <div><strong>Date:</strong> {formattedSelectedDate}</div>
            <div><strong>Start:</strong> {selectedStart}</div>
            <div><strong>Duration:</strong> {selectedDuration ? `${Math.floor(selectedDuration / 60)} hr ${selectedDuration % 60} min` : "-"}</div>
            
            {isExistingUser ? (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <Coins className="h-3 w-3" />
                Tokens Required: <span className="font-medium">{tokensRequired}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  Total: <span className="font-medium">LKR {selectedPriceData.price}</span>
                </div>
                {selectedPriceData.seating && (
                  <div className="text-xs text-slate-500">
                    {selectedPriceData.seating}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">{getButtons()}</div>
        </Card>
      </div>
    </div>
  );
}