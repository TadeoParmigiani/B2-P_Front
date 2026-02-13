import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  displayValue: string
  setDisplayValue: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("useSelect must be used within a Select")
  }
  return context
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

function Select({ children, value: controlledValue, onValueChange, defaultValue = "" }: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [displayValue, setDisplayValue] = React.useState("")
  
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }, [isControlled, onValueChange])

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, displayValue, setDisplayValue }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect()
    
    const classes = `flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 ring-offset-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`
    
    const chevronClasses = `h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`
    
    return (
      <button
        type="button"
        ref={ref}
        className={classes}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        {...props}
      >
        {children}
        <ChevronDown className={chevronClasses} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { displayValue } = useSelect()
  
  const classes = !displayValue ? "text-zinc-500" : ""
  
  return (
    <span className={classes}>
      {displayValue || placeholder}
    </span>
  )
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelect()
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        const trigger = contentRef.current.parentElement?.querySelector("button")
        if (trigger && !trigger.contains(e.target as Node)) {
          setOpen(false)
        }
      }
    }
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  const classes = `absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-md ${
    open ? "" : "hidden"
  } ${className || ""}`

  return (
    <div
      ref={contentRef}
      className={classes}
      aria-hidden={!open}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setDisplayValue } = useSelect()
  const isSelected = selectedValue === value
  
  const label = React.useMemo(() => getNodeText(children).trim(), [children])

  const handleClick = () => {
    onValueChange(value)
    setDisplayValue(label)
  }

  React.useEffect(() => {
    if (isSelected) {
      setDisplayValue(label)
    }
  }, [isSelected, label, setDisplayValue])

  const classes = `relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-zinc-800 hover:text-white ${isSelected ? "bg-zinc-800" : ""} ${className || ""}`
  
  return (
    <div className={classes} onClick={handleClick} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-green-500" />}
      </span>
      {children}
    </div>
  )
}

function getNodeText(node: React.ReactNode): string {
  if (node == null) return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join("")

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>
    return getNodeText(element.props.children)
  }

  return ""
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}