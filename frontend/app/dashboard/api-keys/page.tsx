'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Copy, Trash2, Key, Eye, EyeOff } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: number
  lastUsed?: number
  isActive: boolean
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read'])
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a key name')
      return
    }

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions
        })
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiKeys([...apiKeys, newKey])
        setShowCreateDialog(false)
        setNewKeyName('')
        setNewKeyPermissions(['read'])
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      alert('Failed to create API key')
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) {
      return
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId))
      }
    } catch (error) {
      console.error('Error revoking API key:', error)
      alert('Failed to revoke API key')
    }
  }

  const copyToClipboard = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const togglePermission = (permission: string) => {
    if (newKeyPermissions.includes(permission)) {
      setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission))
    } else {
      setNewKeyPermissions([...newKeyPermissions, permission])
    }
  }

  const getPermissionBadgeColor = (permission: string) => {
    switch (permission) {
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'write':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">API Keys</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your API keys for programmatic access</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'admin'].map((permission) => (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => togglePermission(permission)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        newKeyPermissions.includes(permission)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey}>
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.filter(k => k.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Keys Used This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.filter(k => k.lastUsed && Date.now() - k.lastUsed < 30 * 24 * 60 * 60 * 1000).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Keep your keys secret. Never share them with anyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No API keys yet</p>
              <p className="text-sm mt-2">Generate your first API key to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {showKey[apiKey.id] ? apiKey.key : `${apiKey.key.slice(0, 8)}${'*'.repeat(24)}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}
                        >
                          {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        >
                          {copiedKey === apiKey.id ? (
                            <span className="text-green-600 text-xs">Copied!</span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Permissions:</span>
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} className={getPermissionBadgeColor(permission)}>
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(apiKey.createdAt).toLocaleString()}
                    {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Using Your API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <code className="text-sm bg-muted px-3 py-2 rounded block">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <code className="text-sm bg-muted px-3 py-2 rounded block">
              POST /api/payments
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
