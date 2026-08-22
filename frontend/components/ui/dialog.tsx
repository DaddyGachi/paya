import * as React from "react"

const Dialog = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, children, open, onOpenChange, ...props }, ref) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div
        ref={ref}
        className={`relative bg-background rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild = false, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props
    })
  }
  return (
    <button ref={ref} className={className || ''} {...props}>
      {children}
    </button>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className || ''} {...props}>
    {children}
  </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`mb-4 ${className || ''}`} {...props}>
    {children}
  </div>
))
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h2 ref={ref} className={`text-lg font-semibold ${className || ''}`} {...props}>
    {children}
  </h2>
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p ref={ref} className={`text-sm text-muted-foreground ${className || ''}`} {...props}>
    {children}
  </p>
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className || ''}`} {...props}>
    {children}
  </div>
))
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
