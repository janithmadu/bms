import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Coins } from "lucide-react";

interface BookingFormProps {
  formData: { eventTitle: string; bookerName: string; bookerEmail: string; phoneNumber: string };
  setFormData: (data: any) => void;
  isExistingUser: boolean;
  setIsExistingUser: (value: boolean) => void;
  userId: string;
  setUserId: (id: string) => void;
  fetchTokenData: (id: string) => void;
  tokenData: { tokensAvailable: number; tokensUsed: number; initialCount: number } | null;
  tokensRequired: number;
  selectedStart: string | null;
  selectedDuration: number | null;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BookingForm({
  formData,
  setFormData,
  isExistingUser,
  setIsExistingUser,
  userId,
  setUserId,
  fetchTokenData,
  tokenData,
  tokensRequired,
  selectedStart,
  selectedDuration,
  isLoading,
  onBack,
  onSubmit,
}: BookingFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={onSubmit}>
        <Card className="rounded-2xl shadow-md p-4">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  required
                  value={formData.eventTitle}
                  onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                  placeholder="e.g., Team Meeting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookerName">Your Name *</Label>
                <Input
                  id="bookerName"
                  required
                  value={formData.bookerName}
                  onChange={(e) => setFormData({ ...formData, bookerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookerEmail">Email *</Label>
                <Input
                  id="bookerEmail"
                  type="email"
                  required
                  value={formData.bookerEmail}
                  onChange={(e) => setFormData({ ...formData, bookerEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone *</Label>
                <Input
                  id="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4 border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  id="existingUser"
                  checked={isExistingUser}
                  onCheckedChange={(ch) => setIsExistingUser(ch as boolean)}
                />
                <Label htmlFor="existingUser">Existing user?</Label>
              </div>

              {isExistingUser && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="userId" className="text-sm">
                    User ID
                  </Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      fetchTokenData(e.target.value);
                    }}
                    placeholder="Enter User ID"
                  />
                </div>
              )}
            </div>

            {/* Tokens preview */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-xs text-slate-600">Tokens required</div>
                    <div
                      className={`font-medium ${
                        isExistingUser && tokenData && tokensRequired > (tokenData.tokensAvailable ?? 0)
                          ? "text-red-600"
                          : "text-slate-800"
                      }`}
                    >
                      {isExistingUser
                        ? `${tokensRequired} token${tokensRequired !== 1 ? "s" : ""} Available: ${tokenData?.tokensAvailable ?? 0}`
                        : "No tokens required"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  disabled={isLoading || !selectedStart || !selectedDuration || (isExistingUser && tokensRequired === 0)}
                >
                  {isLoading ? "Creating..." : `Confirm${isExistingUser ? ` (${tokensRequired} token${tokensRequired !== 1 ? "s" : ""})` : ""}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
}
