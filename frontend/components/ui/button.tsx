import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap border-[4px] border-black transition-none outline-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[4px] active:translate-x-[4px] active:shadow-none select-none group/button",
  {
    variants: {
      variant: {
        default: "bg-[#5d4037] text-[#f4dcb3] shadow-[4px_4px_0px_0px_#2a1a15] hover:bg-[#6d4c41]",
        outline: "bg-[#f4dcb3] text-[#3e2723] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:bg-[#e6ccb2]",
        outline2: "bg-[#ffffff] text-[#3e2723] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] hover:bg-[#ffffff]",
        secondary: "bg-[#8b4513] text-white shadow-[4px_4px_0px_0px_#3e2723] hover:bg-[#a0522d]",
        ghost: "border-transparent hover:bg-black/5 active:bg-black/10 shadow-none active:translate-y-0 active:translate-x-0",
        destructive: "bg-[#d32f2f] text-white shadow-[4px_4px_0px_0px_#7b1a1a] hover:bg-[#e53935]",
        link: "border-transparent shadow-none underline-offset-4 hover:underline text-[#5d4037] active:translate-y-0",
      },
      size: {
        default: "h-12 px-6 text-2xl",
        xs: "h-8 px-2 text-lg border-[2px]",
        sm: "h-10 px-4 text-xl border-[3px]",
        lg: "h-14 px-8 text-3xl",
        icon: "size-12",
        "icon-xs": "size-8 border-[2px]",
        "icon-sm": "size-10 border-[3px]",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ fontFamily: "var(--font-body)", imageRendering: "pixelated" }}
      {...props}
    />
  )
}

export { Button, buttonVariants }