"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/ui/page-header'
import { Plus, Search, Filter, Users, Edit, Trash2, MapPin, Mail, Shield } from 'lucide-react'
import { UserDialog } from '@/components/admin/user-dialog'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  userLocations: {
    location: {
      id: string
      name: string
    }
  }[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        throw new Error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  const handleSave = () => {
    fetchUsers()
    handleCloseDialog()
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Management" description="Manage system users and their permissions" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-slate-200 rounded"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader 
          title="User Management" 
          description="Manage system users and their location access permissions"
        >
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Users List */}
          <div className="lg:col-span-3">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No users found</h3>
                  <p className="text-slate-500 text-center mb-6">
                    {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'No users have been created yet.'
                    }
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First User
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-blue-500" />
                            {user.name}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Location Access */}
                        <div>
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            Location Access ({user.userLocations.length})
                          </div>
                          {user.userLocations.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.userLocations.map((userLocation, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {userLocation.location.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No location access assigned</p>
                          )}
                        </div>

                        {/* Created Date */}
                        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        user={editingUser}
        onSave={handleSave}
      />
    </>
  )
}