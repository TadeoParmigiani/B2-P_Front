import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "border-transparent bg-green-500 text-zinc-950",
    secondary: "border-transparent bg-zinc-800 text-zinc-100",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "text-zinc-100 border-zinc-700",
  }

  const classes = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className || ""}`

  return (
    <span
      className={classes}
      {...props}
    />
  )
}

export { Badge }