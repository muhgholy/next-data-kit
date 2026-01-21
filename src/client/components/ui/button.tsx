import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '../../utils';

const buttonVariants = cva(
     "ndk:inline-flex ndk:items-center ndk:justify-center ndk:gap-2 ndk:whitespace-nowrap ndk:rounded-md ndk:text-sm ndk:font-medium ndk:transition-all ndk:disabled:pointer-events-none ndk:disabled:opacity-50 ndk:[&_svg]:pointer-events-none ndk:[&_svg:not([class*='size-'])]:size-4 ndk:shrink-0 ndk:[&_svg]:shrink-0 ndk:outline-none ndk:focus-visible:ring-black/20 ndk:dark:focus-visible:ring-white/20 ndk:focus-visible:ring-[3px] ndk:aria-invalid:ring-red-500/20 ndk:dark:aria-invalid:ring-red-500/30 ndk:aria-invalid:border-red-500",
     {
          variants: {
               variant: {
                    default: "ndk:bg-gray-900 ndk:text-white ndk:hover:bg-gray-800 ndk:dark:bg-gray-100 ndk:dark:text-gray-900 ndk:dark:hover:bg-gray-200",
                    destructive:
                         "ndk:bg-red-600 ndk:text-white ndk:hover:bg-red-700 ndk:dark:bg-red-600 ndk:dark:hover:bg-red-500",
                    outline:
                         "ndk:border ndk:border-gray-200 ndk:bg-white ndk:text-gray-900 ndk:shadow-xs ndk:hover:bg-gray-50 ndk:dark:border-gray-800 ndk:dark:bg-gray-950 ndk:dark:text-gray-100 ndk:dark:hover:bg-gray-900",
                    secondary:
                         "ndk:bg-gray-100 ndk:text-gray-900 ndk:hover:bg-gray-200 ndk:dark:bg-gray-900 ndk:dark:text-gray-100 ndk:dark:hover:bg-gray-800",
                    ghost:
                         "ndk:hover:bg-gray-100 ndk:hover:text-gray-900 ndk:dark:hover:bg-gray-900 ndk:dark:hover:text-gray-100",
                    link: "ndk:text-gray-900 ndk:underline-offset-4 ndk:hover:underline ndk:dark:text-gray-100",
               },
               size: {
                    default: "ndk:h-9 ndk:px-4 ndk:py-2 ndk:has-[>svg]:px-3",
                    sm: "ndk:h-8 ndk:rounded-md ndk:gap-1.5 ndk:px-3 ndk:has-[>svg]:px-2.5",
                    lg: "ndk:h-10 ndk:rounded-md ndk:px-6 ndk:has-[>svg]:px-4",
                    icon: "ndk:size-9",
                    "icon-sm": "ndk:size-8",
                    "icon-lg": "ndk:size-10",
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
