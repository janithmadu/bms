"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Shield, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
  onSave: () => void
}

interface Location {
  id: string
  name: string
  address: string
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    locationIds: [] as string[]
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLocations()
      
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          role: user.role || 'user',
          status: user.status || 'active',
          locationIds: user.userLocations?.map((ul: any) => ul.location.id) || []
        })
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user',
          status: 'active',
          locationIds: []
        })
      }
    }
  }, [open, user])

 const { data: session, status } = useSession();



  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `/api/locations?userId=${session?.user.id}&role=${session?.user.role}`
      );
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = user ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        // Only include password if it's provided (for updates) or if it's a new user
        ...(formData.password || !user ? { password: formData.password } : {})
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(`User ${user ? 'updated' : 'created'} successfully`)
        onSave()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${user ? 'update' : 'create'} user`)
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error(`Failed to ${user ? 'update' : 'create'} user`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationToggle = (locationId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        locationIds: [...formData.locationIds, locationId]
      })
    } else {
      setFormData({
        ...formData,
        locationIds: formData.locationIds.filter(id => id !== locationId)
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? 'Update the user information and location access below.'
              : 'Fill in the details to create a new user account.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password {user ? '(leave blank to keep current)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={user ? "Enter new password" : "Enter password"}
                  required={!user}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="financeadmin">Finance Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Access
              </CardTitle>
              <CardDescription>
                Select which locations this user can access. Admins have access to all locations by default.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.role === 'admin' ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Admin users have access to all locations automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {locations.length === 0 ? (
                    <p className="text-sm text-slate-500">No locations available</p>
                  ) : (
                    locations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`location-${location.id}`}
                          checked={formData.locationIds.includes(location.id)}
                          onCheckedChange={(checked) => handleLocationToggle(location.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`location-${location.id}`} className="font-medium">
                            {location.name}
                          </Label>
                          <p className="text-sm text-slate-500">{location.address}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}