'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Building2, Mail, Phone, Globe, Bell, CreditCard } from 'lucide-react'

interface MerchantSettings {
  businessName: string
  email: string
  phone: string
  website: string
  description: string
  currency: string
  timezone: string
  webhookUrl: string
  notificationEmail: boolean
  notificationSms: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<MerchantSettings>({
    businessName: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    currency: 'USD',
    timezone: 'UTC',
    webhookUrl: '',
    notificationEmail: true,
    notificationSms: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/merchants/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      const response = await fetch('/api/merchants/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof MerchantSettings, value: string | boolean) => {
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your merchant account settings</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg text-sm">
          Settings saved successfully!
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payment">Payment Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Update your business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={settings.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="business@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure your payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select 
                  value={settings.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => handleInputChange('timezone', value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive payment confirmations via email
                  </p>
                </div>
                <input
                  id="email-notifications"
                  type="checkbox"
                  checked={settings.notificationEmail}
                  onChange={(e) => handleInputChange('notificationEmail', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive payment alerts via SMS
                  </p>
                </div>
                <input
                  id="sms-notifications"
                  type="checkbox"
                  checked={settings.notificationSms}
                  onChange={(e) => handleInputChange('notificationSms', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Set up webhooks to receive real-time payment notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                  placeholder="https://yourserver.com/webhook"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send POST requests to this URL for payment events
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Webhook Events</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• payment.created - New payment initiated</li>
                  <li>• payment.confirmed - Payment confirmed on blockchain</li>
                  <li>• payment.failed - Payment failed or expired</li>
                  <li>• withdrawal.completed - Withdrawal processed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
