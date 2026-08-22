'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface BalanceCardProps {
  balance: number
  change?: number
  label?: string
  showIcon?: boolean
}

export function BalanceCard({ 
  balance, 
  change = 0, 
  label = 'Balance',
  showIcon = true 
}: BalanceCardProps) {
  const isPositive = change >= 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {showIcon && (
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {change !== 0 && (
          <div className={`flex items-center text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(change).toFixed(2)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
