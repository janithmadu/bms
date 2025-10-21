import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingFormProps {
  formData: { eventTitle: string; bookerName: string; bookerEmail: string; phoneNumber: string };
  setFormData: (data: any) => void;
}

export default function BookingForm({ formData, setFormData }: BookingFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}