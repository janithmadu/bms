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
        const data = await response.json()
        toast.error(data.error)
        // throw new Error(`Failed to ${location ? 'update' : 'create'} location`)
        
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
              <Label>Image URL (Optional)</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Enter image URL or upload after creating location"
              />
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Location preview"
                  className="w-full h-32 object-cover rounded-lg mt-2"
                />
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