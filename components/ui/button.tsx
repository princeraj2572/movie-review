import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#c9a84c] text-black hover:bg-[#f0c060] font-semibold tracking-wide",
        destructive: "bg-[#e53030] text-white hover:bg-[#991b1b]",
        outline: "border border-[#1e1e1e] bg-transparent text-[#e8e8e8] hover:bg-[#141414] hover:border-[#c9a84c]/50",
        secondary: "bg-[#141414] text-[#e8e8e8] hover:bg-[#1e1e1e] border border-[#1e1e1e]",
        ghost: "hover:bg-[#141414] text-[#e8e8e8]",
        link: "text-[#c9a84c] underline-offset-4 hover:underline p-0 h-auto",
        cinema: "bg-transparent border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black tracking-widest uppercase text-xs font-semibold",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-sm",
        sm: "h-8 px-3 text-xs rounded-sm",
        lg: "h-12 px-8 rounded-sm text-base",
        xl: "h-14 px-10 rounded-sm text-base",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
