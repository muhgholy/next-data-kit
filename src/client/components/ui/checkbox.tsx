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
                    'peer border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white dark:data-[state=checked]:bg-gray-100 dark:data-[state=checked]:text-gray-900 data-[state=checked]:border-gray-900 dark:data-[state=checked]:border-gray-100 focus-visible:border-gray-900 dark:focus-visible:border-gray-200 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/30 aria-invalid:border-red-500 size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                    className
               )}
               {...props}
          >
               <CheckboxPrimitive.Indicator
                    data-slot="checkbox-indicator"
                    className="grid place-content-center text-current transition-none"
               >
                    <CheckIcon className="size-3.5" />
               </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
     );
}

export { Checkbox };
