'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export interface WithdrawalRecord {
  id: string
  amount: number
  bankAccount: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: number
  updatedAt?: number
}

interface WithdrawalFormProps {
  balance: number
  onSubmit: (data: { amount: number; bankAccount: string }) => void
  withdrawalLimit?: number
}

export function WithdrawalForm({ balance, onSubmit, withdrawalLimit = 10000 }: WithdrawalFormProps) {
  const [amount, setAmount] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const withdrawalAmount = parseFloat(amount)
    
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    if (withdrawalAmount > balance) {
      alert('Insufficient balance')
      return
    }
    
    if (withdrawalAmount > withdrawalLimit) {
      alert(`Withdrawal amount exceeds limit of $${withdrawalLimit.toLocaleString()}`)
      return
    }
    
    if (!bankAccount.trim()) {
      alert('Please enter a bank account')
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit({ amount: withdrawalAmount, bankAccount })
      setAmount('')
      setBankAccount('')
    } catch (error) {
      console.error('Withdrawal error:', error)
      alert('Failed to process withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Withdrawal</CardTitle>
        <CardDescription>
          Available balance: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={balance}
              step="0.01"
              required
            />
            <p className="text-xs text-muted-foreground">
              Withdrawal limit: ${withdrawalLimit.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Bank Account</Label>
            <Select value={bankAccount} onValueChange={setBankAccount}>
              <SelectTrigger id="bankAccount">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account1">**** **** **** 1234 (Chase)</SelectItem>
                <SelectItem value="account2">**** **** **** 5678 (Bank of America)</SelectItem>
                <SelectItem value="account3">**** **** **** 9012 (Wells Fargo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          >
            {isSubmitting ? 'Processing...' : 'Withdraw'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface WithdrawalHistoryProps {
  withdrawals: WithdrawalRecord[]
}

export function WithdrawalHistory({ withdrawals }: WithdrawalHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Bank Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No withdrawals yet
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">
                      {withdrawal.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${withdrawal.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {withdrawal.bankAccount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
