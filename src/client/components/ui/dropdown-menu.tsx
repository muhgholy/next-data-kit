"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { cn } from '../../utils';

function DropdownMenu({
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
     return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
     return (
          <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
     )
}

function DropdownMenuTrigger({
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
     return (
          <DropdownMenuPrimitive.Trigger
               data-slot="dropdown-menu-trigger"
               {...props}
          />
     )
}

function DropdownMenuContent({
     className,
     sideOffset = 4,
     container,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
     container?: HTMLElement | null;
}) {
     return (
          <DropdownMenuPrimitive.Portal container={container ?? undefined}>
               <DropdownMenuPrimitive.Content
                    data-slot="dropdown-menu-content"
                    sideOffset={sideOffset}
                    className={cn(
                         "ndk:bg-white ndk:text-gray-900 ndk:dark:bg-gray-950 ndk:dark:text-gray-100 ndk:data-[state=open]:animate-in ndk:data-[state=closed]:animate-out ndk:data-[state=closed]:fade-out-0 ndk:data-[state=open]:fade-in-0 ndk:data-[state=closed]:zoom-out-95 ndk:data-[state=open]:zoom-in-95 ndk:data-[side=bottom]:slide-in-from-top-2 ndk:data-[side=left]:slide-in-from-right-2 ndk:data-[side=right]:slide-in-from-left-2 ndk:data-[side=top]:slide-in-from-bottom-2 ndk:z-50 ndk:max-h-(--radix-dropdown-menu-content-available-height) ndk:min-w-[8rem] ndk:origin-(--radix-dropdown-menu-content-transform-origin) ndk:overflow-x-hidden ndk:overflow-y-auto ndk:rounded-md ndk:border ndk:border-gray-200 ndk:dark:border-gray-800 ndk:p-1 ndk:shadow-md",
                         className
                    )}
                    {...props}
               />
          </DropdownMenuPrimitive.Portal>
     )
}

function DropdownMenuGroup({
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
     return (
          <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
     )
}

function DropdownMenuItem({
     className,
     inset,
     variant = "default",
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
     inset?: boolean
     variant?: "default" | "destructive"
}) {
     return (
          <DropdownMenuPrimitive.Item
               data-slot="dropdown-menu-item"
               data-inset={inset}
               data-variant={variant}
               className={cn(
                    "ndk:focus:bg-gray-50 ndk:dark:focus:bg-gray-900 ndk:focus:text-gray-900 ndk:dark:focus:text-gray-100 ndk:data-[variant=destructive]:text-red-600 ndk:dark:data-[variant=destructive]:text-red-500 ndk:data-[variant=destructive]:focus:bg-red-500/10 ndk:dark:data-[variant=destructive]:focus:bg-red-500/15 ndk:data-[variant=destructive]:focus:text-red-700 ndk:dark:data-[variant=destructive]:focus:text-red-400 ndk:data-[variant=destructive]:*:[svg]:!text-red-600 ndk:dark:data-[variant=destructive]:*:[svg]:!text-red-500 ndk:[&_svg:not([class*='text-'])]:text-gray-500 ndk:dark:[&_svg:not([class*='text-'])]:text-gray-400 ndk:relative ndk:flex ndk:cursor-default ndk:items-center ndk:gap-2 ndk:rounded-sm ndk:px-2 ndk:py-1.5 ndk:text-sm ndk:outline-hidden ndk:select-none ndk:data-[disabled]:pointer-events-none ndk:data-[disabled]:opacity-50 ndk:data-[inset]:pl-8 ndk:[&_svg]:pointer-events-none ndk:[&_svg]:shrink-0 ndk:[&_svg:not([class*='size-'])]:size-4",
                    className
               )}
               {...props}
          />
     )
}

function DropdownMenuCheckboxItem({
     className,
     children,
     checked,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
     return (
          <DropdownMenuPrimitive.CheckboxItem
               data-slot="dropdown-menu-checkbox-item"
               className={cn(
                    "ndk:focus:bg-gray-50 ndk:dark:focus:bg-gray-900 ndk:focus:text-gray-900 ndk:dark:focus:text-gray-100 ndk:relative ndk:flex ndk:cursor-default ndk:items-center ndk:gap-2 ndk:rounded-sm ndk:py-1.5 ndk:pr-2 ndk:pl-8 ndk:text-sm ndk:outline-hidden ndk:select-none ndk:data-[disabled]:pointer-events-none ndk:data-[disabled]:opacity-50 ndk:[&_svg]:pointer-events-none ndk:[&_svg]:shrink-0 ndk:[&_svg:not([class*='size-'])]:size-4",
                    className
               )}
               checked={checked}
               {...props}
          >
               <span className="ndk:pointer-events-none ndk:absolute ndk:left-2 ndk:flex ndk:size-3.5 ndk:items-center ndk:justify-center">
                    <DropdownMenuPrimitive.ItemIndicator>
                         <CheckIcon className="ndk:size-4" />
                    </DropdownMenuPrimitive.ItemIndicator>
               </span>
               {children}
          </DropdownMenuPrimitive.CheckboxItem>
     )
}

function DropdownMenuRadioGroup({
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
     return (
          <DropdownMenuPrimitive.RadioGroup
               data-slot="dropdown-menu-radio-group"
               {...props}
          />
     )
}

function DropdownMenuRadioItem({
     className,
     children,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
     return (
          <DropdownMenuPrimitive.RadioItem
               data-slot="dropdown-menu-radio-item"
               className={cn(
                    "ndk:focus:bg-gray-50 ndk:dark:focus:bg-gray-900 ndk:focus:text-gray-900 ndk:dark:focus:text-gray-100 ndk:relative ndk:flex ndk:cursor-default ndk:items-center ndk:gap-2 ndk:rounded-sm ndk:py-1.5 ndk:pr-2 ndk:pl-8 ndk:text-sm ndk:outline-hidden ndk:select-none ndk:data-[disabled]:pointer-events-none ndk:data-[disabled]:opacity-50 ndk:[&_svg]:pointer-events-none ndk:[&_svg]:shrink-0 ndk:[&_svg:not([class*='size-'])]:size-4",
                    className
               )}
               {...props}
          >
               <span className="ndk:pointer-events-none ndk:absolute ndk:left-2 ndk:flex ndk:size-3.5 ndk:items-center ndk:justify-center">
                    <DropdownMenuPrimitive.ItemIndicator>
                         <CircleIcon className="ndk:size-2 ndk:fill-current" />
                    </DropdownMenuPrimitive.ItemIndicator>
               </span>
               {children}
          </DropdownMenuPrimitive.RadioItem>
     )
}

function DropdownMenuLabel({
     className,
     inset,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
     inset?: boolean
}) {
     return (
          <DropdownMenuPrimitive.Label
               data-slot="dropdown-menu-label"
               data-inset={inset}
               className={cn(
                    "ndk:px-2 ndk:py-1.5 ndk:text-sm ndk:font-medium ndk:data-[inset]:pl-8",
                    className
               )}
               {...props}
          />
     )
}

function DropdownMenuSeparator({
     className,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
     return (
          <DropdownMenuPrimitive.Separator
               data-slot="dropdown-menu-separator"
               className={cn("ndk:bg-gray-100 ndk:dark:bg-gray-900 ndk:-mx-1 ndk:my-1 ndk:h-px", className)}
               {...props}
          />
     )
}

function DropdownMenuShortcut({
     className,
     ...props
}: React.ComponentProps<"span">) {
     return (
          <span
               data-slot="dropdown-menu-shortcut"
               className={cn(
                    "ndk:text-gray-500 ndk:dark:text-gray-400 ndk:ml-auto ndk:text-xs ndk:tracking-widest",
                    className
               )}
               {...props}
          />
     )
}

function DropdownMenuSub({
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
     return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
     className,
     inset,
     children,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
     inset?: boolean
}) {
     return (
          <DropdownMenuPrimitive.SubTrigger
               data-slot="dropdown-menu-sub-trigger"
               data-inset={inset}
               className={cn(
                    "ndk:focus:bg-gray-50 ndk:dark:focus:bg-gray-900 ndk:focus:text-gray-900 ndk:dark:focus:text-gray-100 ndk:data-[state=open]:bg-gray-50 ndk:dark:data-[state=open]:bg-gray-900 ndk:data-[state=open]:text-gray-900 ndk:dark:data-[state=open]:text-gray-100 ndk:[&_svg:not([class*='text-'])]:text-gray-500 ndk:dark:[&_svg:not([class*='text-'])]:text-gray-400 ndk:flex ndk:cursor-default ndk:items-center ndk:gap-2 ndk:rounded-sm ndk:px-2 ndk:py-1.5 ndk:text-sm ndk:outline-hidden ndk:select-none ndk:data-[inset]:pl-8 ndk:[&_svg]:pointer-events-none ndk:[&_svg]:shrink-0 ndk:[&_svg:not([class*='size-'])]:size-4",
                    className
               )}
               {...props}
          >
               {children}
               <ChevronRightIcon className="ndk:ml-auto ndk:size-4" />
          </DropdownMenuPrimitive.SubTrigger>
     )
}

function DropdownMenuSubContent({
     className,
     ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
     return (
          <DropdownMenuPrimitive.SubContent
               data-slot="dropdown-menu-sub-content"
               className={cn(
                    "ndk:bg-white ndk:text-gray-900 ndk:dark:bg-gray-950 ndk:dark:text-gray-100 ndk:data-[state=open]:animate-in ndk:data-[state=closed]:animate-out ndk:data-[state=closed]:fade-out-0 ndk:data-[state=open]:fade-in-0 ndk:data-[state=closed]:zoom-out-95 ndk:data-[state=open]:zoom-in-95 ndk:data-[side=bottom]:slide-in-from-top-2 ndk:data-[side=left]:slide-in-from-right-2 ndk:data-[side=right]:slide-in-from-left-2 ndk:data-[side=top]:slide-in-from-bottom-2 ndk:z-50 ndk:min-w-[8rem] ndk:origin-(--radix-dropdown-menu-content-transform-origin) ndk:overflow-hidden ndk:rounded-md ndk:border ndk:border-gray-200 ndk:dark:border-gray-800 ndk:p-1 ndk:shadow-lg",
                    className
               )}
               {...props}
          />
     )
}

export {
     DropdownMenu,
     DropdownMenuPortal,
     DropdownMenuTrigger,
     DropdownMenuContent,
     DropdownMenuGroup,
     DropdownMenuLabel,
     DropdownMenuItem,
     DropdownMenuCheckboxItem,
     DropdownMenuRadioGroup,
     DropdownMenuRadioItem,
     DropdownMenuSeparator,
     DropdownMenuShortcut,
     DropdownMenuSub,
     DropdownMenuSubTrigger,
     DropdownMenuSubContent,
}
