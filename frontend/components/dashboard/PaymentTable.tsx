'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Download, Eye } from 'lucide-react'
import { useState } from 'react'

export interface PaymentRecord {
  id: string
  amount: number
  merchant: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CONFIRMED'
  depositAddress: string
  memo: string
  createdAt: number
  updatedAt?: number
  txHash?: string
  currency?: string
}

interface PaymentTableProps {
  payments: PaymentRecord[]
  onRowClick?: (payment: PaymentRecord) => void
}

export function PaymentTable({ payments, onRowClick }: PaymentTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CONFIRMED'>('all')
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.merchant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Merchant', 'Amount', 'Status', 'Currency', 'Created At', 'Transaction Hash']
    const rows = filteredPayments.map(p => [
      p.id,
      p.merchant,
      p.amount.toFixed(2),
      p.status,
      p.currency || 'USDC',
      new Date(p.createdAt).toISOString(),
      p.txHash || 'N/A'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Merchant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">
                      {payment.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm">{payment.merchant}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Payment ID</p>
                                  <p className="text-sm font-mono">{selectedPayment.id}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Merchant</p>
                                  <p className="text-sm">{selectedPayment.merchant}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Amount</p>
                                  <p className="text-sm font-medium">${selectedPayment.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge className={getStatusColor(selectedPayment.status)}>
                                    {selectedPayment.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Deposit Address</p>
                                  <p className="text-sm font-mono text-xs">{selectedPayment.depositAddress}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Memo</p>
                                  <p className="text-sm font-mono">{selectedPayment.memo}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Created</p>
                                  <p className="text-sm">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Transaction Hash</p>
                                  <p className="text-sm font-mono text-xs">{selectedPayment.txHash || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
