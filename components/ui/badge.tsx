import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30",
        secondary: "border-transparent bg-[#1e1e1e] text-[#e8e8e8]",
        destructive: "border-transparent bg-[#e53030]/20 text-[#e53030] border-[#e53030]/30",
        outline: "text-[#e8e8e8] border-[#1e1e1e]",
        genre: "border-[#1e1e1e] bg-[#141414] text-[#9ca3af] uppercase tracking-wider text-[10px]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
