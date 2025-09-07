"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CldUploadWidget } from 'next-cloudinary'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface LocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location?: any
  onSave: () => void
}

export function LocationDialog({ open, onOpenChange, location, onSave }: LocationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    imageUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        description: location.description || '',
        imageUrl: location.imageUrl || ''
      })
    } else {
      setFormData({
        name: '',
        address: '',
        description: '',
        imageUrl: ''
      })
    }
  }, [location, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = location ? `/api/locations/${location.id}` : '/api/locations'
      const method = location ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(`Location ${location ? 'updated' : 'created'} successfully`)
        onSave()
      } else {
        throw new Error(`Failed to ${location ? 'update' : 'create'} location`)
      }
    } catch (error) {
      console.error('Error saving location:', error)
      toast.error(`Failed to ${location ? 'update' : 'create'} location`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (result: any) => {
    setFormData({ ...formData, imageUrl: result.info.secure_url })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          <DialogDescription>
            {location 
              ? 'Update the location information below.'
              : 'Fill in the details to create a new location.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter location name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Image</Label>
              {formData.imageUrl ? (
                <div className="relative">
                  <img
                    src={formData.imageUrl}
                    alt="Location"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <CldUploadWidget
                  uploadPreset="unsigned_preset" // You'll need to create this in Cloudinary
                  onSuccess={handleImageUpload}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => open()}
                      className="h-32 border-dashed"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-600">Click to upload image</p>
                      </div>
                    </Button>
                  )}
                </CldUploadWidget>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : location ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}