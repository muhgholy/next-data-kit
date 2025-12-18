import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '../../utils';

const buttonVariants = cva(
     "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-black/20 dark:focus-visible:ring-white/20 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/30 aria-invalid:border-red-500",
     {
          variants: {
               variant: {
                    default: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
                    destructive:
                         "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
                    outline:
                         "border border-gray-200 bg-white text-gray-900 shadow-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900",
                    secondary:
                         "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
                    ghost:
                         "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-gray-100",
                    link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-100",
               },
               size: {
                    default: "h-9 px-4 py-2 has-[>svg]:px-3",
                    sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                    lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                    icon: "size-9",
                    "icon-sm": "size-8",
                    "icon-lg": "size-10",
               },
          },
          defaultVariants: {
               variant: "default",
               size: "default",
          },
     }
)

const Button = React.forwardRef<
     HTMLButtonElement,
     React.ComponentPropsWithoutRef<"button"> &
     VariantProps<typeof buttonVariants> & {
          asChild?: boolean
     }
>(function Button(
     {
          className,
          variant = "default",
          size = "default",
          asChild = false,
          ...props
     },
     ref
) {
     const Comp = asChild ? Slot : "button"

     return (
          <Comp
               ref={ref}
               data-slot="button"
               data-variant={variant}
               data-size={size}
               className={cn(buttonVariants({ variant, size, className }))}
               {...props}
          />
     )
})

Button.displayName = "Button"

export { Button, buttonVariants }
