"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from '../../utils';


function Select({
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
     return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
     return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
     return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
     className,
     size = "default",
     children,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
     size?: "sm" | "default"
}) {
     return (
          <SelectPrimitive.Trigger
               data-slot="select-trigger"
               data-size={size}
               className={cn(
                    "ndk:border-gray-200 ndk:dark:border-gray-800 ndk:data-[placeholder]:text-gray-500 ndk:dark:data-[placeholder]:text-gray-400 ndk:[&_svg:not([class*='text-'])]:text-gray-500 ndk:dark:[&_svg:not([class*='text-'])]:text-gray-400 ndk:focus-visible:border-gray-900 ndk:dark:focus-visible:border-gray-200 ndk:focus-visible:ring-black/20 ndk:dark:focus-visible:ring-white/20 ndk:aria-invalid:ring-red-500/20 ndk:dark:aria-invalid:ring-red-500/30 ndk:aria-invalid:border-red-500 ndk:bg-white ndk:dark:bg-gray-950 ndk:hover:bg-gray-50 ndk:dark:hover:bg-gray-900 ndk:flex ndk:w-fit ndk:items-center ndk:justify-between ndk:gap-2 ndk:rounded-md ndk:border ndk:px-3 ndk:py-2 ndk:text-sm ndk:whitespace-nowrap ndk:shadow-xs ndk:transition-[color,box-shadow] ndk:outline-none ndk:focus-visible:ring-[3px] ndk:disabled:cursor-not-allowed ndk:disabled:opacity-50 ndk:data-[size=default]:h-9 ndk:data-[size=sm]:h-8 ndk:*:data-[slot=select-value]:line-clamp-1 ndk:*:data-[slot=select-value]:flex ndk:*:data-[slot=select-value]:items-center ndk:*:data-[slot=select-value]:gap-2 ndk:[&_svg]:pointer-events-none ndk:[&_svg]:shrink-0 ndk:[&_svg:not([class*='size-'])]:size-4",
                    className
               )}
               {...props}
          >
               {children}
               <SelectPrimitive.Icon asChild>
                    <ChevronDownIcon className="ndk:size-4 ndk:opacity-50" />
               </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
     )
}

function SelectContent({
     className,
     children,
     position = "item-aligned",
     align = "center",
     container,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
     container?: HTMLElement | null;
}) {
     return (
          <SelectPrimitive.Portal container={container ?? undefined}>
               <SelectPrimitive.Content
                    data-slot="select-content"
                    className={cn(
                         "ndk:bg-white ndk:text-gray-900 ndk:dark:bg-gray-950 ndk:dark:text-gray-100 ndk:data-[state=open]:animate-in ndk:data-[state=closed]:animate-out ndk:data-[state=closed]:fade-out-0 ndk:data-[state=open]:fade-in-0 ndk:data-[state=closed]:zoom-out-95 ndk:data-[state=open]:zoom-in-95 ndk:data-[side=bottom]:slide-in-from-top-2 ndk:data-[side=left]:slide-in-from-right-2 ndk:data-[side=right]:slide-in-from-left-2 ndk:data-[side=top]:slide-in-from-bottom-2 ndk:relative ndk:z-50 ndk:max-h-(--radix-select-content-available-height) ndk:min-w-[8rem] ndk:origin-(--radix-select-content-transform-origin) ndk:overflow-x-hidden ndk:overflow-y-auto ndk:rounded-md ndk:border ndk:border-gray-200 ndk:dark:border-gray-800 ndk:shadow-md",
                         position === "popper" &&
                         "ndk:data-[side=bottom]:translate-y-1 ndk:data-[side=left]:-translate-x-1 ndk:data-[side=right]:translate-x-1 ndk:data-[side=top]:-translate-y-1",
                         className
                    )}
                    position={position}
                    align={align}
                    {...props}
               >
                    <SelectScrollUpButton />
                    <SelectPrimitive.Viewport
                         className={cn(
                              "ndk:p-1",
                              position === "popper" &&
                              "ndk:h-[var(--radix-select-trigger-height)] ndk:w-full ndk:min-w-[var(--radix-select-trigger-width)] ndk:scroll-my-1"
                         )}
                    >
                         {children}
                    </SelectPrimitive.Viewport>
                    <SelectScrollDownButton />
               </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
     )
}

function SelectLabel({
     className,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
     return (
          <SelectPrimitive.Label
               data-slot="select-label"
               className={cn("ndk:text-gray-500 ndk:dark:text-gray-400 ndk:px-2 ndk:py-1.5 ndk:text-xs", className)}
               {...props}
          />
     )
}

function SelectItem({
     className,
     children,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
     return (
          <SelectPrimitive.Item
               data-slot="select-item"
               className={cn(
                    "ndk:focus:bg-gray-50 ndk:dark:focus:bg-gray-900 ndk:focus:text-gray-900 ndk:dark:focus:text-gray-100 ndk:[&_svg:not([class*='text-'])]:text-gray-500 ndk:dark:[&_svg:not([class*='text-'])]:text-gray-400 ndk:relative ndk:flex ndk:w-full ndk:cursor-default ndk:items-center ndk:gap-2 ndk:rounded-sm ndk:py-1.5 ndk:pr-8 ndk:pl-2 ndk:text-sm ndk:outline-hidden ndk:select-none ndk:data-[disabled]:pointer-events-none ndk:data-[disabled]:opacity-50 ndk:[&_svg]:pointer-events-none ndk:[&_svg]:shrink-0 ndk:[&_svg:not([class*='size-'])]:size-4 ndk:*:[span]:last:flex ndk:*:[span]:last:items-center ndk:*:[span]:last:gap-2",
                    className
               )}
               {...props}
          >
               <span
                    data-slot="select-item-indicator"
                    className="ndk:absolute ndk:right-2 ndk:flex ndk:size-3.5 ndk:items-center ndk:justify-center"
               >
                    <SelectPrimitive.ItemIndicator>
                         <CheckIcon className="ndk:size-4" />
                    </SelectPrimitive.ItemIndicator>
               </span>
               <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
          </SelectPrimitive.Item>
     )
}

function SelectSeparator({
     className,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
     return (
          <SelectPrimitive.Separator
               data-slot="select-separator"
               className={cn("ndk:bg-gray-100 ndk:dark:bg-gray-900 ndk:pointer-events-none ndk:-mx-1 ndk:my-1 ndk:h-px", className)}
               {...props}
          />
     )
}

function SelectScrollUpButton({
     className,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
     return (
          <SelectPrimitive.ScrollUpButton
               data-slot="select-scroll-up-button"
               className={cn(
                    "ndk:flex ndk:cursor-default ndk:items-center ndk:justify-center ndk:py-1",
                    className
               )}
               {...props}
          >
               <ChevronUpIcon className="ndk:size-4" />
          </SelectPrimitive.ScrollUpButton>
     )
}

function SelectScrollDownButton({
     className,
     ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
     return (
          <SelectPrimitive.ScrollDownButton
               data-slot="select-scroll-down-button"
               className={cn(
                    "ndk:flex ndk:cursor-default ndk:items-center ndk:justify-center ndk:py-1",
                    className
               )}
               {...props}
          >
               <ChevronDownIcon className="ndk:size-4" />
          </SelectPrimitive.ScrollDownButton>
     )
}

export {
     Select,
     SelectContent,
     SelectGroup,
     SelectItem,
     SelectLabel,
     SelectScrollDownButton,
     SelectScrollUpButton,
     SelectSeparator,
     SelectTrigger,
     SelectValue,
}
