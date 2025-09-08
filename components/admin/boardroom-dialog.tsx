"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CldUploadWidget } from 'next-cloudinary'
import { Upload, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface BoardroomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardroom?: any
  locationId: string
  onSave: () => void
}

const commonFacilities = [
  'Projector', 'TV Screen', 'Whiteboard', 'Conference Phone', 'Video Conferencing',
  'WiFi', 'Air Conditioning', 'Natural Light', 'Flip Chart', 'Markers',
  'Power Outlets', 'HDMI Cables', 'Microphone', 'Sound System', 'Catering Setup'
]

export function BoardroomDialog({ open, onOpenChange, boardroom, locationId, onSave }: BoardroomDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dimensions: '',
    capacity: '',
    imageUrl: '',
    facilities: [] as string[]
  })
  const [newFacility, setNewFacility] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (boardroom) {
      setFormData({
        name: boardroom.name || '',
        description: boardroom.description || '',
        dimensions: boardroom.dimensions || '',
        capacity: boardroom.capacity?.toString() || '',
        imageUrl: boardroom.imageUrl || '',
        facilities: Array.isArray(boardroom.facilities) ? boardroom.facilities : []
      })
    } else {
      setFormData({
        name: '',
        description: '',
        dimensions: '',
        capacity: '',
        imageUrl: '',
        facilities: []
      })
    }
  }, [boardroom, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = boardroom ? `/api/boardrooms/${boardroom.id}` : '/api/boardrooms'
      const method = boardroom ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity),
        locationId: boardroom ? undefined : locationId
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(`Boardroom ${boardroom ? 'updated' : 'created'} successfully`)
        onSave()
      } else {
        throw new Error(`Failed to ${boardroom ? 'update' : 'create'} boardroom`)
      }
    } catch (error) {
      console.error('Error saving boardroom:', error)
      toast.error(`Failed to ${boardroom ? 'update' : 'create'} boardroom`)
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
        facilities: [...formData.facilities, facility]
      })
    }
  }

  const removeFacility = (facilityToRemove: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f !== facilityToRemove)
    })
  }

  const handleAddCustomFacility = () => {
    if (newFacility.trim()) {
      addFacility(newFacility.trim())
      setNewFacility('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {boardroom ? 'Edit Boardroom' : 'Add New Boardroom'}
          </DialogTitle>
          <DialogDescription>
            {boardroom 
              ? 'Update the boardroom information below.'
              : 'Fill in the details to create a new boardroom.'
            }
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 20ft x 15ft"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the boardroom"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Room Image URL (Optional)</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Enter image URL or upload after creating boardroom"
              />
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Boardroom preview"
                  className="w-full h-48 object-cover rounded-lg mt-2"
                />
              )}
            </div>

            {/* Facilities */}
            <div className="grid gap-2">
              <Label>Facilities & Amenities</Label>
              
              {/* Selected Facilities */}
              {formData.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                  {formData.facilities.map((facility, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
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

              {/* Common Facilities */}
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Common facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {commonFacilities
                    .filter(facility => !formData.facilities.includes(facility))
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

              {/* Custom Facility Input */}
              <div className="flex gap-2">
                <Input
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="Add custom facility"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFacility())}
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : boardroom ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}