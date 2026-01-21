'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '../../utils';

function Checkbox({
     className,
     ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
     return (
          <CheckboxPrimitive.Root
               data-slot="checkbox"
               className={cn(
                    'ndk:peer ndk:border-gray-200 ndk:bg-white ndk:text-gray-900 ndk:dark:border-gray-800 ndk:dark:bg-gray-950 ndk:dark:text-gray-100 ndk:data-[state=checked]:bg-gray-900 ndk:data-[state=checked]:text-white ndk:dark:data-[state=checked]:bg-gray-100 ndk:dark:data-[state=checked]:text-gray-900 ndk:data-[state=checked]:border-gray-900 ndk:dark:data-[state=checked]:border-gray-100 ndk:focus-visible:border-gray-900 ndk:dark:focus-visible:border-gray-200 ndk:focus-visible:ring-black/20 ndk:dark:focus-visible:ring-white/20 ndk:aria-invalid:ring-red-500/20 ndk:dark:aria-invalid:ring-red-500/30 ndk:aria-invalid:border-red-500 ndk:size-4 ndk:shrink-0 ndk:rounded-[4px] ndk:border ndk:shadow-xs ndk:transition-shadow ndk:outline-none ndk:focus-visible:ring-[3px] ndk:disabled:cursor-not-allowed ndk:disabled:opacity-50',
                    className
               )}
               {...props}
          >
               <CheckboxPrimitive.Indicator
                    data-slot="checkbox-indicator"
                    className="ndk:grid ndk:place-content-center ndk:text-current ndk:transition-none"
               >
                    <CheckIcon className="ndk:size-3.5" />
               </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
     );
}

export { Checkbox };
