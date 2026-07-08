import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#0052ff] text-white hover:bg-[#003ecc]",
        destructive: "bg-[#cf202f] text-white hover:bg-[#b01b27]",
        outline: "bg-transparent text-[#0a0b0d] border border-[#dee1e6] hover:bg-[#f7f7f7]",
        secondary: "bg-[#eef0f3] text-[#0a0b0d] hover:bg-[#dee1e6]",
        ghost: "bg-transparent text-[#0a0b0d] hover:bg-[#f7f7f7]",
        link: "bg-transparent text-[#0052ff] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-5 py-3 text-base",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }), "rounded-full")} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }