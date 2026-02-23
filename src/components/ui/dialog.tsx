import * as React from "react"
import { X } from "lucide-react"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a Dialog")
  }
  return context
}

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [isControlled, onOpenChange])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function DialogTrigger({ children, asChild, onClick, ...props }: DialogTriggerProps) {
  const { setOpen } = useDialog()
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { onClick?: (e: React.MouseEvent) => void }
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        if (childProps.onClick) {
          childProps.onClick(e)
        }
        setOpen(true)
      },
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

function DialogOverlay({ className, loading = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { loading?: boolean }) {
  const { setOpen } = useDialog()
  
  const classes = `fixed inset-0 z-50 bg-black/80 ${className || ""}`
  
  return (
    <div
      className={classes}
      onClick={() => {
        if (!loading) setOpen(false)
      }}
      {...props}
    />
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean
}

function DialogContent({ className, children, loading = false, ...props }: DialogContentProps) {
  const { open, setOpen } = useDialog()
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, setOpen, loading])

  if (!open) return null

  const classes = `fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-zinc-800 bg-zinc-900 p-6 shadow-lg sm:rounded-lg ${className || ""}`

  return (
    <>
      <DialogOverlay loading={loading} />
      <div
        className={classes}
        {...props}
      >
        {children}
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm text-zinc-400 opacity-70 ring-offset-zinc-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
      </div>
    </>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const classes = `flex flex-col space-y-1.5 text-center sm:text-left ${className || ""}`
  
  return (
    <div
      className={classes}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const classes = `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`
  
  return (
    <div
      className={classes}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const classes = `text-lg font-semibold leading-none tracking-tight text-white ${className || ""}`
  
  return (
    <h2
      className={classes}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const classes = `text-sm text-zinc-400 ${className || ""}`
  
  return (
    <p
      className={classes}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}