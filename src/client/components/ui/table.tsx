'use client';

import * as React from 'react';
import { cn } from '../../utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
     return (
          <div data-slot="table-container" className="ndk:relative ndk:w-full ndk:overflow-x-auto">
               <table
                    data-slot="table"
                    className={cn('ndk:w-full ndk:caption-bottom ndk:text-sm', className)}
                    {...props}
               />
          </div>
     );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
     return (
          <thead
               data-slot="table-header"
               className={cn('ndk:[&_tr]:border-b', className)}
               {...props}
          />
     );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
     return (
          <tbody
               data-slot="table-body"
               className={cn('ndk:[&_tr:last-child]:border-0', className)}
               {...props}
          />
     );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
     return (
          <tfoot
               data-slot="table-footer"
               className={cn(
                    'ndk:bg-gray-50/70 ndk:dark:bg-gray-900/40 ndk:border-t ndk:border-gray-200 ndk:dark:border-gray-800 ndk:font-medium ndk:[&>tr]:last:border-b-0',
                    className
               )}
               {...props}
          />
     );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
     return (
          <tr
               data-slot="table-row"
               className={cn(
                    'ndk:hover:bg-gray-50 ndk:dark:hover:bg-gray-900 ndk:data-[state=selected]:bg-gray-50 ndk:dark:data-[state=selected]:bg-gray-900 ndk:border-b ndk:border-gray-100 ndk:dark:border-gray-800 ndk:transition-colors',
                    className
               )}
               {...props}
          />
     );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
     return (
          <th
               data-slot="table-head"
               className={cn(
                    'ndk:text-gray-900 ndk:dark:text-gray-100 ndk:h-10 ndk:px-2 ndk:text-left ndk:align-middle ndk:font-medium ndk:whitespace-nowrap ndk:[&:has([role=checkbox])]:pr-0 ndk:[&>[role=checkbox]]:translate-y-[2px]',
                    className
               )}
               {...props}
          />
     );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
     return (
          <td
               data-slot="table-cell"
               className={cn(
                    'ndk:p-2 ndk:align-middle ndk:whitespace-nowrap ndk:[&:has([role=checkbox])]:pr-0 ndk:[&>[role=checkbox]]:translate-y-[2px]',
                    className
               )}
               {...props}
          />
     );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
     return (
          <caption
               data-slot="table-caption"
               className={cn('ndk:text-gray-500 ndk:dark:text-gray-400 ndk:mt-4 ndk:text-sm', className)}
               {...props}
          />
     );
}

export {
     Table,
     TableHeader,
     TableBody,
     TableFooter,
     TableHead,
     TableRow,
     TableCell,
     TableCaption,
};
