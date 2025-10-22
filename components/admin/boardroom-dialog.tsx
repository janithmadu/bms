"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CldUploadWidget } from "next-cloudinary"
import { Upload, X, Plus } from "lucide-react"
import { toast } from "sonner"

interface BoardroomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardroom?: any
  locationId: string
  onSave: () => void
}

const commonFacilities = [
  "Projector",
  "TV Screen",
  "Whiteboard",
  "Conference Phone",
  "Video Conferencing",
  "WiFi",
  "Air Conditioning",
  "Natural Light",
  "Flip Chart",
  "Markers",
  "Power Outlets",
  "HDMI Cables",
  "Microphone",
  "Sound System",
  "Catering Setup",
]

export function BoardroomDialog({
  open,
  onOpenChange,
  boardroom,
  locationId,
  onSave,
}: BoardroomDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dimensions: "",
    capacity: "",
    imageUrl: "",
    facilities: [] as string[],
    pricingOptions: [] as {
      seatingArrangement: string
      timeRange: string
      price: string
    }[],
  })
  const [newFacility, setNewFacility] = useState("")
  const [newSeatingArrangement, setNewSeatingArrangement] = useState("")
  const [newTimeRange, setNewTimeRange] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (boardroom) {
      setFormData({
        name: boardroom.name || "",
        description: boardroom.description || "",
        dimensions: boardroom.dimensions || "",
        capacity: boardroom.capacity?.toString() || "",
        imageUrl: boardroom.imageUrl || "",
        facilities: Array.isArray(boardroom.facilities)
          ? boardroom.facilities
          : [],
        pricingOptions: Array.isArray(boardroom.pricingOptions)
          ? boardroom.pricingOptions
          : [],
      })
    } else {
      setFormData({
        name: "",
        description: "",
        dimensions: "",
        capacity: "",
        imageUrl: "",
        facilities: [],
        pricingOptions: [],
      })
    }
  }, [boardroom, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = boardroom ? `/api/boardrooms/${boardroom.id}` : "/api/boardrooms"
      const method = boardroom ? "PUT" : "POST"

      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity),
        locationId: boardroom ? undefined : locationId,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(`Boardroom ${boardroom ? "updated" : "created"} successfully`)
        onSave()
      } else {
        throw new Error(`Failed to ${boardroom ? "update" : "create"} boardroom`)
      }
    } catch (error) {
      console.error("Error saving boardroom:", error)
      toast.error(`Failed to ${boardroom ? "update" : "create"} boardroom`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (result: any) => {
    setFormData({ ...formData, imageUrl: result.info.secure_url })
  }

  const addFacility = (facility: string) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facility],
      })
    }
  }

  const removeFacility = (facilityToRemove: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((f) => f !== facilityToRemove),
    })
  }

  const handleAddCustomFacility = () => {
    if (newFacility.trim()) {
      addFacility(newFacility.trim())
      setNewFacility("")
    }
  }

  const addPricingOption = () => {
    const seating = newSeatingArrangement.trim()
    const time = newTimeRange.trim()
    const price = newPrice.trim()

    if (seating || time || price) {
      setFormData({
        ...formData,
        pricingOptions: [
          ...formData.pricingOptions,
          {
            seatingArrangement: seating,
            timeRange: time,
            price: price,
          },
        ],
      })
      setNewSeatingArrangement("")
      setNewTimeRange("")
      setNewPrice("")
    }
  }

  const removePricingOption = (index: number) => {
    setFormData({
      ...formData,
      pricingOptions: formData.pricingOptions.filter((_, i) => i !== index),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {boardroom ? "Edit Boardroom" : "Add New Boardroom"}
          </DialogTitle>
          <DialogDescription>
            {boardroom
              ? "Update the boardroom information below."
              : "Fill in the details to create a new boardroom."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Conference Room A"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="e.g., 12"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) =>
                  setFormData({ ...formData, dimensions: e.target.value })
                }
                placeholder="e.g., 20ft x 15ft"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the boardroom"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Room Image URL (Optional)</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Enter image URL or upload after creating boardroom"
              />
              {formData.imageUrl && (
                <div className="relative w-full h-48 mt-2">
                  <Image
                    src={formData.imageUrl}
                    alt="Boardroom preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Facilities */}
            <div className="grid gap-2">
              <Label>Facilities & Amenities</Label>

              {formData.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                  {formData.facilities.map((facility, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => removeFacility(facility)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-slate-600">Common facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {commonFacilities
                    .filter(
                      (facility) => !formData.facilities.includes(facility)
                    )
                    .map((facility, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFacility(facility)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {facility}
                      </Button>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="Add custom facility"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomFacility())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomFacility}
                  disabled={!newFacility.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="grid gap-4">
              <Label className="text-lg font-semibold">Pricing Options</Label>

              {formData.pricingOptions.length > 0 && (
                <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                  <p className="text-sm font-medium text-slate-700">
                    Current Pricing:
                  </p>
                  {formData.pricingOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white rounded-md border"
                    >
                      <div className="text-sm">
                        <span className="font-medium">
                          {option.seatingArrangement || "N/A"} seats
                        </span>{" "}
                        -<span className="ml-1">{option.timeRange || "N/A"}</span>{" "}
                        -<span className="ml-2 font-bold text-green-600">
                          {option.price || "N/A"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePricingOption(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="seating" className="text-xs">
                    Seats
                  </Label>
                  <Input
                    id="seating"
                    value={newSeatingArrangement}
                    onChange={(e) =>
                      setNewSeatingArrangement(e.target.value)
                    }
                    placeholder="e.g., 8"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-xs">
                    Time
                  </Label>
                  <Input
                    id="time"
                    value={newTimeRange}
                    onChange={(e) => setNewTimeRange(e.target.value)}
                    placeholder="e.g., 1 hour"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-xs">
                    Price
                  </Label>
                  <Input
                    id="price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g., 7500LKR"
                    className="text-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="default"
                onClick={addPricingOption}
                disabled={
                  !newSeatingArrangement.trim() &&
                  !newTimeRange.trim() &&
                  !newPrice.trim()
                }
                className="w-full justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pricing Option
              </Button>

              <p className="text-xs text-slate-500">
                💡 Fill any field and click &quot;Add&quot; - you can add multiple
                options
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : boardroom ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
