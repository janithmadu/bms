"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { Coins, Plus, RotateCcw, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface TokenData {
  id: string
  initialCount: number
  availableCount: number
  tokensUsedThisMonth: number
  lastRenewalDate: string
}

export default function TokensPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialCount, setInitialCount] = useState('')
  const [additionalTokens, setAdditionalTokens] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/tokens')
      const data = await response.json()
      setTokenData(data)
      setInitialCount(data.initialCount.toString())
    } catch (error) {
      console.error('Error fetching tokens:', error)
      toast.error('Failed to fetch token data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  const handleUpdateInitialCount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!initialCount || isNaN(Number(initialCount))) {
      toast.error('Please enter a valid number')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialCount: Number(initialCount) })
      })

      if (response.ok) {
        toast.success('Initial token count updated successfully')
        fetchTokens()
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.error('Error updating initial count:', error)
      toast.error('Failed to update initial count')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddTokens = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!additionalTokens || isNaN(Number(additionalTokens)) || Number(additionalTokens) <= 0) {
      toast.error('Please enter a valid positive number')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalTokens: Number(additionalTokens) })
      })

      if (response.ok) {
        toast.success(`Added ${additionalTokens} tokens successfully`)
        setAdditionalTokens('')
        fetchTokens()
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

  const handleRenewalTest = async () => {
    if (!confirm('This will reset available tokens to the initial count and reset monthly usage. Continue?')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/tokens/renew', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Tokens renewed successfully')
        fetchTokens()
      } else {
        throw new Error('Failed to renew tokens')
      }
    } catch (error) {
      console.error('Error renewing tokens:', error)
      toast.error('Failed to renew tokens')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Token Management" description="Manage your booking tokens" />
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

  if (!tokenData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Token Management" description="Manage your booking tokens" />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-slate-500">Failed to load token data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const usagePercentage = tokenData.initialCount > 0 
    ? Math.round((tokenData.tokensUsedThisMonth / tokenData.initialCount) * 100)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Token Management" 
        description="Manage your booking tokens and monitor usage"
      />

      {/* Token Statistics */}
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
              {tokenData.availableCount}
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
              {tokenData.initialCount}
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
              {tokenData.tokensUsedThisMonth}
            </div>
            <CardDescription>{usagePercentage}% of monthly limit</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <RotateCcw className="h-4 w-4 mr-2 text-purple-500" />
              Last Renewal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-slate-900 mb-1">
              {format(new Date(tokenData.lastRenewalDate), 'MMM dd')}
            </div>
            <CardDescription>{format(new Date(tokenData.lastRenewalDate), 'yyyy')}</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage</CardTitle>
          <CardDescription>Track your token consumption this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {tokenData.tokensUsedThisMonth}</span>
              <span>Limit: {tokenData.initialCount}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-500">
              {tokenData.availableCount} tokens remaining
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Set Monthly Token Limit</CardTitle>
            <CardDescription>
              Set the number of tokens that will be available each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateInitialCount} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="initial-count">Monthly Token Limit</Label>
                <Input
                  id="initial-count"
                  type="number"
                  value={initialCount}
                  onChange={(e) => setInitialCount(e.target.value)}
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
              Add additional tokens to the current available count
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
            Manually trigger the monthly token renewal process. This is normally handled automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleRenewalTest}
            disabled={isUpdating}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Test Renewal Process
          </Button>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Automatic Renewal:</strong> Tokens are automatically renewed monthly. 
              Set up a cron job to call <code className="bg-slate-200 px-1 rounded">/api/tokens/renew</code> on the 1st of each month.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}