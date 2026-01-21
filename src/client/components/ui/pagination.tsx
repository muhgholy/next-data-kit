'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '../../utils';
import { buttonVariants, type Button } from './button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('ndk:flex', className)}
            {...props}
        />
    );
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('ndk:flex ndk:flex-row ndk:items-center ndk:gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'disabled' | 'onClick' | 'type'> &
    Omit<React.ComponentProps<'button'>, 'type' | 'onClick' | 'disabled'>;

function PaginationLink({
    className,
    isActive,
    size = 'icon',
    type = 'button',
    ...props
}: PaginationLinkProps) {
    return (
        <button
            aria-current={isActive ? 'page' : undefined}
            data-slot="pagination-link"
            data-active={isActive ? 'true' : 'false'}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size,
                }),
                className
            )}
            type={type}
            {...props}
        />
    );
}

function PaginationPrevious({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn('ndk:gap-1 ndk:px-2.5 ndk:sm:pl-2.5', className)}
            {...props}
        >
            <ChevronLeft className="ndk:size-4" aria-hidden="true" />
            <span className="ndk:hidden ndk:sm:block">Previous</span>
        </PaginationLink>
    );
}

function PaginationNext({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn('ndk:gap-1 ndk:px-2.5 ndk:sm:pr-2.5', className)}
            {...props}
        >
            <span className="ndk:hidden ndk:sm:block">Next</span>
            <ChevronRight className="ndk:size-4" aria-hidden="true" />
        </PaginationLink>
    );
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden="true"
            data-slot="pagination-ellipsis"
            className={cn('ndk:flex ndk:size-9 ndk:items-center ndk:justify-center', className)}
            {...props}
        >
            <MoreHorizontal className="ndk:size-4" aria-hidden="true" />
            <span className="ndk:sr-only">More pages</span>
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
};
