// components/PaymentStep.tsx
"use client";

declare global {
  interface Window {
    payhere: any;
  }
}

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentStepProps {
  locationID: any;
  booking: {
    orderId: string;
    boardroom: any;
    formattedDate: string;
    selectedStart: string;
    selectedDuration: number;

    price: string;
    formData: {
      bookerName: string;
      bookerEmail: string;
      phoneNumber: string;
    };
  };
  onBack: () => void;
  onComplete: () => void;
}

export default function PaymentStep({
  booking,
  onBack,
  onComplete,
  locationID,
}: PaymentStepProps) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const handlePayment = async () => {
    const paymentDetails = {
      order_id: booking.orderId,
      amount: Number(booking.price).toFixed(2),
      currency: "LKR",
      first_name: booking.formData.bookerName.split(" ")[0],
      last_name: booking.formData.bookerName.split(" ").slice(1).join(" "),
      email: booking.formData.bookerEmail,
      phone: booking.formData.phoneNumber,
      address: address || "No Address",
      city: city || "No City",
      country: "Sri Lanka",
    };

    try {
      // Get hash from backend
      const response = await fetch("/api/payhere/checkout?action=start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
      });

      if (!response.ok) throw new Error("Failed to initiate payment");

      const { hash, merchant_id } = await response.json();

      // Initialize PayHere payment
      const payment = {
        sandbox: true, // Set to false for production
        merchant_id,
        return_url: `${window.location.origin}/booking/${locationID.id}`,
        cancel_url: `${window.location.origin}/booking/${locationID.id}`,
        notify_url: `${window.location.origin}api/payhere/checkout?action=notify`,
        items: `${booking.boardroom.name} – ${booking.selectedDuration / 60}h booking`,
        ...paymentDetails,
        hash,
      };

      const form = document.createElement("form");
      form.method = "POST";
      form.action =
        process.env.NEXT_PUBLIC_PAYHERE_ENDPOINT || "https://www.payhere.lk/pay/checkout";

      Object.entries(payment).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      setTimeout(onComplete, 1000);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initialization failed");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment
      </h3>

      <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Order Summary</h4>
          <div className="flex justify-between text-sm">
            <span>Boardroom:</span>
            <span className="font-medium">{booking.boardroom.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Date:</span>
            <span>{booking.formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Time:</span>
            <span>
              {booking.selectedStart} ({booking.selectedDuration / 60}h)
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-green-600">
            <span>Total:</span>
            <span>LKR {booking.price}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Billing Details</h4>
          <p className="text-sm">
            <strong>Name:</strong> {booking.formData.bookerName}
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {booking.formData.bookerEmail}
          </p>
          <p className="text-sm">
            <strong>Phone:</strong> {booking.formData.phoneNumber}
          </p>

          <div className="space-y-3 mt-3">
            <input
              type="text"
              placeholder="Address *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="City *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Redirecting...
            </>
          ) : (
            "Checkout"
          )}
        </button>
      </div>
    </div>
  );
}
