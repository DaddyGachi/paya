'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { PaymentChart, TransactionCountChart } from '@/components/dashboard/Chart'
import { PaymentTable, PaymentRecord } from '@/components/dashboard/PaymentTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowUpRight, Bell, CreditCard } from 'lucide-react'

export default function Dashboard() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    fetchPayments()
    fetchBalance()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/merchants/balance')
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = payments.filter(p => p.status === 'PAID' || p.status === 'CONFIRMED').reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0)
  const recentPayments = payments.slice(0, 5)

  // Generate mock chart data
  const generateChartData = () => {
    const data = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: Math.random() * 5000 + 1000,
        count: Math.floor(Math.random() * 20) + 1
      })
    }
    return data
  }

  const chartData = generateChartData()

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Merchant Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your payment overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            <Badge variant="secondary" className="ml-2">3</Badge>
          </Button>
          <Link href="/checkout">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard 
          balance={balance} 
          change={12.5} 
          label="Available Balance (USDC)"
        />
        <BalanceCard 
          balance={paidAmount} 
          change={8.2} 
          label="Total Revenue"
          showIcon={false}
        />
        <BalanceCard 
          balance={pendingAmount} 
          label="Pending Settlement"
          showIcon={false}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/checkout">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create Payment</p>
                  <p className="text-sm text-muted-foreground">Generate payment link</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/withdrawals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Withdraw Funds</p>
                  <p className="text-sm text-muted-foreground">Transfer to bank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/payments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">View Payments</p>
                  <p className="text-sm text-muted-foreground">Payment history</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/api-keys">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">Manage access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart data={chartData} title="Payment Volume" />
        <TransactionCountChart data={chartData} title="Transaction Count" />
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Link href="/dashboard/payments">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <PaymentTable payments={recentPayments} />
        </CardContent>
      </Card>
    </div>
  )
}
