'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../utils';

function Popover(
     props: React.ComponentProps<typeof PopoverPrimitive.Root>
) {
     return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(
     props: React.ComponentProps<typeof PopoverPrimitive.Trigger>
) {
     return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
     className,
     align = 'center',
     sideOffset = 4,
     container,
     ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
     container?: HTMLElement | null;
}) {
     return (
          <PopoverPrimitive.Portal container={container ?? undefined}>
               <PopoverPrimitive.Content
                    data-slot="popover-content"
                    align={align}
                    sideOffset={sideOffset}
                    className={cn(
                         'ndk:bg-white ndk:text-gray-900 ndk:dark:bg-gray-950 ndk:dark:text-gray-100 ndk:data-[state=open]:animate-in ndk:data-[state=closed]:animate-out ndk:data-[state=closed]:fade-out-0 ndk:data-[state=open]:fade-in-0 ndk:data-[state=closed]:zoom-out-95 ndk:data-[state=open]:zoom-in-95 ndk:data-[side=bottom]:slide-in-from-top-2 ndk:data-[side=left]:slide-in-from-right-2 ndk:data-[side=right]:slide-in-from-left-2 ndk:data-[side=top]:slide-in-from-bottom-2 ndk:z-50 ndk:w-72 ndk:origin-(--radix-popover-content-transform-origin) ndk:rounded-md ndk:border ndk:border-gray-200 ndk:dark:border-gray-800 ndk:p-4 ndk:shadow-md ndk:outline-hidden',
                         className
                    )}
                    {...props}
               />
          </PopoverPrimitive.Portal>
     );
}

function PopoverAnchor(
     props: React.ComponentProps<typeof PopoverPrimitive.Anchor>
) {
     return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
