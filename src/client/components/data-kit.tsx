'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { useDataKit } from '../hooks/useDataKit';
import { usePagination } from '../hooks/usePagination';
import {
     Button,
     Pagination,
     PaginationContent,
     PaginationEllipsis,
     PaginationItem,
     PaginationLink,
     PaginationNext,
     PaginationPrevious,
     Popover,
     PopoverContent,
     PopoverTrigger,
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
     Switch,
} from './ui';
import type {
     TDataKitInput,
     TDataKitResult,
     TDataKitFilterItem,
     TDataKitSelectableItem,
     TDataKitMemoryMode,
     TExtractDataKitItemType,
     TUseDataKitReturn,
     TDataKitRef,
} from '../../types';


const DataKitInner = <
     TAction extends (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TDataKitSelectableItem>>
>(props: Readonly<{
     action: TAction;
     query?: Record<string, unknown>;
     filters?: TDataKitFilterItem[];
     limit?: { default: number };
     defaultSort?: { path: string; value: 1 | -1 }[];
     className?: string;
     autoFetch?: boolean;
     debounce?: number;
     refetchInterval?: number;
     memory?: TDataKitMemoryMode;
     manual?: boolean;
     pagination?: 'SIMPLE' | 'NUMBER';
     children: (dataKit: TUseDataKitReturn<unknown, TExtractDataKitItemType<TAction>>) => React.ReactNode;
}>, ref: React.ForwardedRef<TDataKitRef<unknown, TExtractDataKitItemType<TAction>>>) => {
     // ** Deconstruct Props
     const {
          action,
          query,
          filters = [],
          limit: limitConfig,
          defaultSort = [],
          className,
          autoFetch = true,
          debounce = 300,
          refetchInterval,
          memory: memoryMode = 'memory',
          manual = false,
          pagination: paginationType = 'NUMBER',
          children,
     } = props;

     // ** Type
     type TItem = TExtractDataKitItemType<TAction>;

     // ** Ref
     const containerRef = useRef<HTMLDivElement>(null);
     const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

     // ** State
     const [isVisible, setIsVisible] = useState(false);
     const [isFilterOpen, setIsFilterOpen] = useState(false);

     // ** Variable
     const overlayContainer = containerRef.current;

     // ** Hooks
     const dataKit = useDataKit<unknown, TItem>({
          action: action as unknown as (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TItem>>,
          filters,
          autoFetch,
          debounce,
          memory: memoryMode,
          initial: {
               limit: limitConfig?.default ?? 10,
               query: query ?? {},
               sorts: defaultSort,
               filter: filters.reduce<Record<string, unknown>>((acc, f) => {
                    if (f.defaultValue !== undefined) acc[f.id] = f.defaultValue;
                    return acc;
               }, {}),
          },
     });
     const pagination = usePagination({ page: dataKit.page, limit: dataKit.limit, total: dataKit.total, siblingCount: 1 });
     const limitOptions = React.useMemo(() => {
          const standardOptions = [10, 25, 50, 100];
          const currentLimit = dataKit.limit;
          if (!standardOptions.includes(currentLimit)) {
               return [...standardOptions, currentLimit].sort((a, b) => a - b);
          }
          return standardOptions;
     }, [dataKit.limit]);

     // ** Imperative Handle
     React.useImperativeHandle(ref, () => dataKit as unknown as TDataKitRef<unknown, TItem>, [dataKit]);

     // ** Handlers
     const handleResetFilters = useCallback(() => {
          filters.forEach((f) => {
               dataKit.actions.setFilter(f.id, f.defaultValue ?? (f.type === 'BOOLEAN' ? false : ''));
          });
     }, [filters, dataKit.actions]);

     // ** Effects
     useEffect(() => {
          if (!containerRef.current || !refetchInterval) return;
          const observer = new IntersectionObserver(
               (entries) => entries[0] && setIsVisible(entries[0].isIntersecting),
               { threshold: 0.1 }
          );
          const currentRef = containerRef.current;
          observer.observe(currentRef);
          return () => { if (currentRef) observer.unobserve(currentRef); };
     }, [refetchInterval]);

     useEffect(() => {
          if (intervalRef.current) {
               clearInterval(intervalRef.current);
               intervalRef.current = null;
          }
          if (refetchInterval && isVisible) {
               intervalRef.current = setInterval(dataKit.actions.refresh, refetchInterval);
          }
          return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
     }, [refetchInterval, isVisible, dataKit.actions]);

     // ** Render
     return (
          <div ref={containerRef} className={`space-y-3 ${className ?? ''}`}>
               {/* Toolbar */}
               <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                         {filters.length > 0 && (
                              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                   <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm">
                                             <Filter className="mr-1.5 size-4" />
                                             Filters
                                        </Button>
                                   </PopoverTrigger>
                                   <PopoverContent align="start" className="w-80" container={overlayContainer}>
                                        <div className="grid gap-3">
                                             {filters.map((f) => (
                                                  <div key={f.id} className="grid gap-1.5">
                                                       <label className="text-sm font-medium">{f.label}</label>
                                                       {f.type === 'TEXT' && (
                                                            <input
                                                                 type="text"
                                                                 className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                                                 placeholder={f.placeholder}
                                                                 value={(dataKit.filter[f.id] as string) ?? ''}
                                                                 onChange={(e) => dataKit.actions.setFilter(f.id, e.target.value)}
                                                            />
                                                       )}
                                                       {f.type === 'SELECT' && (
                                                            <Select
                                                                 value={String(dataKit.filter[f.id] || '__all__')}
                                                                 onValueChange={(v) => dataKit.actions.setFilter(f.id, v === '__all__' ? '' : v)}
                                                            >
                                                                 <SelectTrigger><SelectValue /></SelectTrigger>
                                                                 <SelectContent container={overlayContainer}>
                                                                      <SelectItem value="__all__">All</SelectItem>
                                                                      {f.dataset?.map((d) => (
                                                                           <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                                                                      ))}
                                                                 </SelectContent>
                                                            </Select>
                                                       )}
                                                       {f.type === 'BOOLEAN' && (
                                                            <div className="flex items-center justify-between">
                                                                 <span className="text-sm text-muted-foreground">{f.placeholder ?? 'Enable'}</span>
                                                                 <Switch
                                                                      checked={Boolean(dataKit.filter[f.id])}
                                                                      onCheckedChange={(c) => dataKit.actions.setFilter(f.id, c)}
                                                                 />
                                                            </div>
                                                       )}
                                                  </div>
                                             ))}
                                        </div>
                                        <div className="mt-4 flex justify-between border-t pt-3">
                                             <Button variant="outline" size="sm" onClick={handleResetFilters}>Reset</Button>
                                             <Button size="sm" onClick={() => setIsFilterOpen(false)}>Done</Button>
                                        </div>
                                   </PopoverContent>
                              </Popover>
                         )}
                    </div>

                    <div className="flex items-center gap-1">
                         <span className="mr-2 text-sm text-muted-foreground">
                              {dataKit.items.length} of {dataKit.total}
                         </span>
                         <Select value={String(dataKit.limit)} onValueChange={(v) => dataKit.actions.setLimit(Number(v))} disabled={dataKit.state.isLoading}>
                              <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                              <SelectContent container={overlayContainer}>
                                   {limitOptions.map((v) => (
                                        <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                    </div>
               </div>

               {/* Content (user-provided) */}
               {manual ? (
                    children(dataKit)
               ) : (
                    <div className="min-h-[200px]">
                         {dataKit.state.isLoading ? (
                              <div className="flex h-48 items-center justify-center">
                                   <Loader2 className="size-6 animate-spin text-muted-foreground" />
                              </div>
                         ) : dataKit.items.length === 0 ? (
                              <div className="flex h-48 items-center justify-center text-muted-foreground">
                                   No results found.
                              </div>
                         ) : (
                              children(dataKit)
                         )}
                    </div>
               )}

               {/* Footer */}
               <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                         Page {dataKit.page} of {pagination.totalPages}
                    </p>
                    {paginationType === 'SIMPLE' ? (
                         <div className="flex items-center gap-1">
                              <Button
                                   variant="outline"
                                   size="icon"
                                   disabled={!pagination.hasPrevPage || dataKit.state.isLoading}
                                   onClick={() => dataKit.actions.setPage(dataKit.page - 1)}
                              >
                                   <ChevronLeft className="size-4" />
                              </Button>
                              <Button
                                   variant="outline"
                                   size="icon"
                                   disabled={!pagination.hasNextPage || dataKit.state.isLoading}
                                   onClick={() => dataKit.actions.setPage(dataKit.page + 1)}
                              >
                                   <ChevronRight className="size-4" />
                              </Button>
                         </div>
                    ) : (
                         <Pagination className="mx-0 w-auto">
                              <PaginationContent>
                                   <PaginationItem className="hidden sm:block">
                                        <PaginationPrevious
                                             disabled={!pagination.hasPrevPage || dataKit.state.isLoading}
                                             onClick={() => dataKit.actions.setPage(dataKit.page - 1)}
                                        />
                                   </PaginationItem>
                                   <PaginationItem className="sm:hidden">
                                        <PaginationLink
                                             disabled={!pagination.hasPrevPage || dataKit.state.isLoading}
                                             onClick={() => dataKit.actions.setPage(dataKit.page - 1)}
                                        >
                                             <ChevronLeft className="size-4" />
                                        </PaginationLink>
                                   </PaginationItem>
                                   {pagination.pages.map((pageNum, idx) => (
                                        <PaginationItem key={idx} className="hidden sm:block">
                                             {pageNum === 'ellipsis' ? (
                                                  <PaginationEllipsis />
                                             ) : (
                                                  <PaginationLink
                                                       isActive={pageNum === dataKit.page}
                                                       disabled={dataKit.state.isLoading}
                                                       onClick={() => dataKit.actions.setPage(pageNum)}
                                                  >
                                                       {pageNum}
                                                  </PaginationLink>
                                             )}
                                        </PaginationItem>
                                   ))}
                                   <PaginationItem className="sm:hidden">
                                        <span className="flex size-9 items-center justify-center text-sm">
                                             {dataKit.page}
                                        </span>
                                   </PaginationItem>
                                   <PaginationItem className="hidden sm:block">
                                        <PaginationNext
                                             disabled={!pagination.hasNextPage || dataKit.state.isLoading}
                                             onClick={() => dataKit.actions.setPage(dataKit.page + 1)}
                                        />
                                   </PaginationItem>
                                   <PaginationItem className="sm:hidden">
                                        <PaginationLink
                                             disabled={!pagination.hasNextPage || dataKit.state.isLoading}
                                             onClick={() => dataKit.actions.setPage(dataKit.page + 1)}
                                        >
                                             <ChevronRight className="size-4" />
                                        </PaginationLink>
                                   </PaginationItem>
                              </PaginationContent>
                         </Pagination>
                    )}
               </div>
          </div>
     );
};

export const DataKit = React.forwardRef(DataKitInner) as unknown as <
     TAction extends (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TDataKitSelectableItem>>
>(
     props: Readonly<{
          action: TAction;
          query?: Record<string, unknown>;
          filters?: TDataKitFilterItem[];
          limit?: { default: number };
          defaultSort?: { path: string; value: 1 | -1 }[];
          className?: string;
          autoFetch?: boolean;
          debounce?: number;
          refetchInterval?: number;
          memory?: TDataKitMemoryMode;
          manual?: boolean;
          pagination?: 'SIMPLE' | 'NUMBER';
          children: (dataKit: TUseDataKitReturn<unknown, TExtractDataKitItemType<TAction>>) => React.ReactNode;
          ref?: React.Ref<TDataKitRef<unknown, TExtractDataKitItemType<TAction>>>;
     }>
) => React.ReactElement;
