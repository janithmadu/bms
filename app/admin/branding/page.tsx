"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Palette, Upload, Eye, RotateCcw, Save, Building2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useBrandingStore } from '@/stores/useBrandingStore'
import { useSession } from 'next-auth/react'

const defaultColors = {
  primaryColor: '#3b82f6',
  secondaryColor: '#6366f1', 
  accentColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  cardColor: '#ffffff',
  borderColor: '#e2e8f0',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  errorColor: '#ef4444'
}

const colorPresets = [
  {
    name: 'Default Blue',
    colors: defaultColors
  },
  {
    name: 'Purple Theme',
    colors: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#a855f7',
      accentColor: '#c084fc',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      cardColor: '#ffffff',
      borderColor: '#e2e8f0',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444'
    }
  },
  {
    name: 'Green Theme',
    colors: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#34d399',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      cardColor: '#ffffff',
      borderColor: '#e2e8f0',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444'
    }
  },
  {
    name: 'Dark Theme',
    colors: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      cardColor: '#1e293b',
      borderColor: '#334155',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444'
    }
  }
]

export default function BrandingPage() {
  const { data: session } = useSession()
  const { branding, loading, updateBranding, fetchBranding, applyBrandingToDOM } = useBrandingStore()
  const [formData, setFormData] = useState({
    logoUrl: '',
    companyName: '',
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
    backgroundColor: '',
    textColor: '',
    cardColor: '',
    borderColor: '',
    successColor: '',
    warningColor: '',
    errorColor: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (session?.user.role !== 'admin') {
      return
    }
    fetchBranding()
  }, [session, fetchBranding])

  useEffect(() => {
    if (branding) {
      setFormData({
        logoUrl: branding.logoUrl || '',
        companyName: branding.companyName || '',
        primaryColor: branding.primaryColor || '',
        secondaryColor: branding.secondaryColor || '',
        accentColor: branding.accentColor || '',
        backgroundColor: branding.backgroundColor || '',
        textColor: branding.textColor || '',
        cardColor: branding.cardColor || '',
        borderColor: branding.borderColor || '',
        successColor: branding.successColor || '',
        warningColor: branding.warningColor || '',
        errorColor: branding.errorColor || ''
      })
    }
  }, [branding])

  if (session?.user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Unauthorized"
          description="You do not have permission to access this page."
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-slate-500">Only administrators can manage branding.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreview = () => {
    setPreviewMode(true)
    // Temporarily apply colors for preview
    const root = document.documentElement
    Object.entries(formData).forEach(([key, value]) => {
      if (key.includes('Color') && value) {
        const cssVar = key.replace('Color', '').replace(/([A-Z])/g, '-$1').toLowerCase()
        root.style.setProperty(`--${cssVar}`, value)
      }
    })
    toast.success('Preview applied! Click "Exit Preview" to revert.')
  }

  const handleExitPreview = () => {
    setPreviewMode(false)
    applyBrandingToDOM()
    toast.info('Preview exited, reverted to saved colors.')
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateBranding(formData)
      toast.success('Branding updated successfully!')
      setPreviewMode(false)
    } catch (error) {
      toast.error('Failed to update branding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default colors?')) {
      setFormData(prev => ({ ...prev, ...defaultColors }))
      toast.info('Colors reset to default')
    }
  }

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setFormData(prev => ({ ...prev, ...preset.colors }))
    toast.success(`Applied ${preset.name} preset`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Branding" description="Customize your system's appearance" />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Branding"
        description="Customize your system's logo, colors, and overall appearance"
      >
        <div className="flex gap-2">
          {previewMode ? (
            <Button variant="outline" onClick={handleExitPreview}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Exit Preview
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Changes
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logo">Logo & Company</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company name and logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="Enter logo URL or upload image"
                />
                {formData.logoUrl && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Logo Preview:</p>
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ImageIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Logo Guidelines</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Recommended size: 120x40px to 200x60px</li>
                      <li>• Supported formats: PNG, JPG, SVG</li>
                      <li>• Use transparent background for best results</li>
                      <li>• Logo will appear in navigation and login pages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          {/* Color Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Color Presets</CardTitle>
              <CardDescription>
                Quick start with pre-designed color schemes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {colorPresets.map((preset, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Button size="sm" variant="outline">Apply</Button>
                    </div>
                    <div className="flex space-x-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.primaryColor }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.secondaryColor }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.accentColor }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.successColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Primary Colors
              </CardTitle>
              <CardDescription>
                Main colors used throughout the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Used for buttons, links, and highlights</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Used for secondary actions and accents</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Used for special highlights and badges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background & Layout</CardTitle>
              <CardDescription>
                Colors for backgrounds, cards, and layout elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardColor">Card Background</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="cardColor"
                      type="color"
                      value={formData.cardColor}
                      onChange={(e) => handleInputChange('cardColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.cardColor}
                      onChange={(e) => handleInputChange('cardColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={formData.borderColor}
                      onChange={(e) => handleInputChange('borderColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.borderColor}
                      onChange={(e) => handleInputChange('borderColor', e.target.value)}
                      placeholder="#e2e8f0"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Status Colors</CardTitle>
              <CardDescription>
                Colors for success, warning, and error states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="successColor">Success Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="successColor"
                      type="color"
                      value={formData.successColor}
                      onChange={(e) => handleInputChange('successColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.successColor}
                      onChange={(e) => handleInputChange('successColor', e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warningColor">Warning Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="warningColor"
                      type="color"
                      value={formData.warningColor}
                      onChange={(e) => handleInputChange('warningColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.warningColor}
                      onChange={(e) => handleInputChange('warningColor', e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="errorColor">Error Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="errorColor"
                      type="color"
                      value={formData.errorColor}
                      onChange={(e) => handleInputChange('errorColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.errorColor}
                      onChange={(e) => handleInputChange('errorColor', e.target.value)}
                      placeholder="#ef4444"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your branding changes will look across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Components */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Component Preview</h3>
                
                {/* Buttons Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium">Buttons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="destructive">Delete Button</Button>
                  </div>
                </div>

                {/* Cards Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium">Cards & Badges</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sample Card</CardTitle>
                        <CardDescription>This is how cards will look</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Card content with your custom colors.</p>
                        <div className="flex gap-2 mt-3">
                          <Badge>Active</Badge>
                          <Badge variant="secondary">Pending</Badge>
                          <Badge variant="outline">Draft</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Another Card</CardTitle>
                        <CardDescription>Multiple cards showcase</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Success:</span>
                            <span className="text-green-600 font-medium">✓ Complete</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Warning:</span>
                            <span className="text-yellow-600 font-medium">⚠ Pending</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Error:</span>
                            <span className="text-red-600 font-medium">✗ Failed</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Form Elements Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium">Form Elements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preview-input">Sample Input</Label>
                      <Input id="preview-input" placeholder="Enter text here..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preview-select">Sample Select</Label>
                      <select id="preview-select" className="w-full p-2 border rounded-md">
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Preview Notes</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Changes shown here reflect your current settings</li>
                      <li>• Use "Preview Changes" to temporarily apply colors</li>
                      <li>• Save changes to make them permanent across the system</li>
                      <li>• Colors will be applied to all pages and components</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}