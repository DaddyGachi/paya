import * as React from "react"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
>(({ className, children, value: controlledValue, defaultValue, onValueChange, ...props }, ref) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '')
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }, [controlledValue, onValueChange])
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div ref={ref} className={className || ''} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value
  
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-background text-foreground shadow-sm' : ''} ${className || ''}`}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value
  
  if (!isActive) return null
  
  return (
    <div
      ref={ref}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
