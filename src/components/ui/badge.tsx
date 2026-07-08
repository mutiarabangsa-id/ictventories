import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#eef0f3] text-[#0a0b0d]",
        secondary: "bg-[#eef0f3] text-[#5b616e]",
        destructive: "bg-[#cf202f] text-white",
        outline: "text-[#0a0b0d] border border-[#dee1e6]",
        success: "bg-[#05b169] text-white",
        warning: "bg-[#f4b000] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }