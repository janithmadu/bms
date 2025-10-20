
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface BookingSummaryProps {
  boardroom: any;
  formattedSelectedDate: string;
  selectedStart: string | null;
  selectedDuration: number | null;
  isExistingUser: boolean;
  tokenData: { tokensAvailable: number; tokensUsed: number; initialCount: number } | null;
  onEditDate: () => void;
  onEditTime: () => void;
}

export default function BookingSummary({
  boardroom,
  formattedSelectedDate,
  selectedStart,
  selectedDuration,
  isExistingUser,
  tokenData,
  onEditDate,
  onEditTime,
}: BookingSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="sticky top-24">
        <Card className="rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{boardroom?.name}</div>
                <div className="text-xs text-slate-500">{boardroom?.capacity} people</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-600 space-y-2">
            <div>
              <strong>Date:</strong> {formattedSelectedDate || "-"}
            </div>
            <div>
              <strong>Start:</strong> {selectedStart || "-"}
            </div>
            <div>
              <strong>Duration:</strong> {selectedDuration ? `${Math.floor(selectedDuration / 60)} hr ${selectedDuration % 60} min` : "-"}
            </div>
            <div className="pt-2">
              <strong>Tokens:</strong>
              <div className="mt-1">
                {isExistingUser && tokenData ? (
                  <div className="text-sm">
                    <div>
                      Available: <span className="font-medium text-green-600">{tokenData.tokensAvailable}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">{isExistingUser ? "No user token data" : "No tokens required"}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={onEditDate}>
              Edit date
            </Button>
            <Button variant="ghost" onClick={onEditTime}>
              Edit time
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
