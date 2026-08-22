'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface ChartData {
  date: string
  amount: number
  count?: number
}

interface PaymentChartProps {
  data: ChartData[]
  title?: string
}

export function PaymentChart({ data, title = 'Payment Volume' }: PaymentChartProps) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const formatData = () => {
    if (timeRange === 'daily') return data.slice(-7)
    if (timeRange === 'weekly') return data.slice(-4)
    return data.slice(-12)
  }

  const chartData = formatData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Volume ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface TransactionCountChartProps {
  data: ChartData[]
  title?: string
}

export function TransactionCountChart({ data, title = 'Transaction Count' }: TransactionCountChartProps) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const formatData = () => {
    if (timeRange === 'daily') return data.slice(-7)
    if (timeRange === 'weekly') return data.slice(-4)
    return data.slice(-12)
  }

  const chartData = formatData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))"
                name="Transactions"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
