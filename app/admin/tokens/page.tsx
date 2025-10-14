"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { Coins, Plus, RotateCcw, TrendingUp, Calendar, User, Users } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'

interface UserTokenData {
  id: string
  name: string | null
  email: string
  role: string
  tokensAvailable: number
  tokensUsed: number
  tokenLimit: number
  lastTokenReset: string
}

export default function TokensPage() {
  const [users, setUsers] = useState<UserTokenData[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [additionalTokens, setAdditionalTokens] = useState('')
  const [newTokenLimit, setNewTokenLimit] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin"

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/tokens')
      const data = await response.json()
      setUsers(data)
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch user data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddTokens = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !additionalTokens || isNaN(Number(additionalTokens)) || Number(additionalTokens) <= 0) {
      toast.error('Please select a user and enter a valid positive number')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUserId, 
          additionalTokens: Number(additionalTokens) 
        })
      })

      if (response.ok) {
        toast.success(`Added ${additionalTokens} tokens to user successfully`)
        setAdditionalTokens('')
        fetchUsers()
      } else {
        throw new Error('Failed to add tokens')
      }
    } catch (error) {
      console.error('Error adding tokens:', error)
      toast.error('Failed to add tokens')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateTokenLimit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !newTokenLimit || isNaN(Number(newTokenLimit)) || Number(newTokenLimit) <= 0) {
      toast.error('Please select a user and enter a valid positive number')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUserId, 
          newTokenLimit: Number(newTokenLimit) 
        })
      })

      if (response.ok) {
        toast.success('Token limit updated successfully')
        setNewTokenLimit('')
        fetchUsers()
      } else {
        throw new Error('Failed to update token limit')
      }
    } catch (error) {
      console.error('Error updating token limit:', error)
      toast.error('Failed to update token limit')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRenewalTest = async () => {
    if (!confirm('This will reset all user tokens. Continue?')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tokens/renew', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('All user tokens reset successfully')
        fetchUsers()
      } else {
        throw new Error('Failed to reset tokens')
      }
    } catch (error) {
      console.error('Error resetting tokens:', error)
      toast.error('Failed to reset tokens')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader title="Unauthorized" description="You do not have permission to access this page." />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-slate-500">Only administrators can manage tokens.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Token Management" description="Manage user booking tokens" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const selectedUser = users.find(user => user.id === selectedUserId) || users[0]
  const usagePercentage = selectedUser?.tokenLimit > 0 
    ? Math.round((selectedUser.tokensUsed / selectedUser.tokenLimit) * 100)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Token Management" 
        description="Manage booking tokens for individual users"
      />

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
          <CardDescription>Choose a user to manage their tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="user-select">User</Label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* User Token Statistics */}
      {selectedUser && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                  <Coins className="h-4 w-4 mr-2 text-blue-500" />
                  Available Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {selectedUser.tokensAvailable}
                </div>
                <CardDescription>Ready for booking</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  Monthly Limit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {selectedUser.tokenLimit}
                </div>
                <CardDescription>Tokens per month</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                  Used This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {selectedUser.tokensUsed}
                </div>
                <CardDescription>{usagePercentage}% of monthly limit</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                  <RotateCcw className="h-4 w-4 mr-2 text-purple-500" />
                  Last Reset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-slate-900 mb-1">
                  {format(new Date(selectedUser.lastTokenReset), 'MMM dd')}
                </div>
                <CardDescription>{format(new Date(selectedUser.lastTokenReset), 'yyyy')}</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Usage Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Usage for {selectedUser.name}</CardTitle>
              <CardDescription>Track token consumption this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: {selectedUser.tokensUsed}</span>
                  <span>Limit: {selectedUser.tokenLimit}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  {selectedUser.tokensAvailable} tokens remaining
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Token Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Set Monthly Token Limit</CardTitle>
            <CardDescription>
              Set the monthly token limit for the selected user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateTokenLimit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="token-limit">Monthly Token Limit</Label>
                <Input
                  id="token-limit"
                  type="number"
                  value={newTokenLimit}
                  onChange={(e) => setNewTokenLimit(e.target.value)}
                  placeholder="Enter monthly limit"
                  min="1"
                  required
                />
              </div>
              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? 'Updating...' : 'Update Monthly Limit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Extra Tokens</CardTitle>
            <CardDescription>
              Add additional tokens to the selected user available count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTokens} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="additional-tokens">Tokens to Add</Label>
                <Input
                  id="additional-tokens"
                  type="number"
                  value={additionalTokens}
                  onChange={(e) => setAdditionalTokens(e.target.value)}
                  placeholder="Enter number of tokens"
                  min="1"
                  required
                />
              </div>
              <Button type="submit" disabled={isUpdating} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isUpdating ? 'Adding...' : 'Add Tokens'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Token Renewal</CardTitle>
          <CardDescription>
            Manually reset all user tokens. This is normally handled automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleRenewalTest}
            disabled={isUpdating}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All User Tokens
          </Button>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Automatic Renewal:</strong> User tokens are automatically reset monthly. 
              Set up a cron job to call <code className="bg-slate-200 px-1 rounded">/api/users/tokens</code> on the 1st of each month.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* All Users Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Users Summary
          </CardTitle>
          <CardDescription>
            Overview of token usage across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-right py-2">Available</th>
                  <th className="text-right py-2">Used</th>
                  <th className="text-right py-2">Limit</th>
                  <th className="text-right py-2">Usage %</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userUsage = user.tokenLimit > 0 
                    ? Math.round((user.tokensUsed / user.tokenLimit) * 100)
                    : 0
                  
                  return (
                    <tr key={user.id} className="border-b">
                      <td className="py-2">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="py-2 capitalize">{user.role}</td>
                      <td className="text-right py-2 font-medium">{user.tokensAvailable}</td>
                      <td className="text-right py-2">{user.tokensUsed}</td>
                      <td className="text-right py-2">{user.tokenLimit}</td>
                      <td className="text-right py-2">{userUsage}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}