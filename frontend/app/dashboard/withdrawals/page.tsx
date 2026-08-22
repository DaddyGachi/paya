'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WithdrawalForm, WithdrawalHistory, WithdrawalRecord } from '@/components/dashboard/WithdrawalForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function WithdrawalsPage() {
  const [balance, setBalance] = useState(0)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [balanceRes, withdrawalsRes] = await Promise.all([
        fetch('/api/merchants/balance'),
        fetch('/api/withdrawals')
      ])
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance || 0)
      }
      
      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json()
        setWithdrawals(withdrawalsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawal = async (data: { amount: number; bankAccount: string }) => {
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        await fetchData()
      } else {
        throw new Error('Failed to create withdrawal')
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Withdrawals</h1>
          <p className="text-sm text-muted-foreground mt-1">Withdraw funds to your bank account</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${withdrawals.filter(w => w.status === 'COMPLETED').reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${withdrawals.filter(w => w.status === 'PENDING' || w.status === 'PROCESSING').reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Form and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawalForm 
          balance={balance} 
          onSubmit={handleWithdrawal}
          withdrawalLimit={10000}
        />
        <WithdrawalHistory withdrawals={withdrawals} />
      </div>
    </div>
  )
}
