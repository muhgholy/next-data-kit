'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Filter, Loader2 } from 'lucide-react';
import { useDataKit } from '../hooks/useDataKit';
import {
     Button,
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
     TDataKitStateMode,
     TExtractDataKitItemType,
     TFilterConfig,
     TUseDataKitReturn,
} from '../../types';


const DataKitInfinityInner = <
     TAction extends (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TDataKitSelectableItem>>
>(props: Readonly<{
     action: TAction;
     query?: Record<string, unknown>;
     filterConfig?: TFilterConfig;
     filters?: TDataKitFilterItem[];
     limit?: { default: number };
     defaultSort?: { path: string; value: 1 | -1 }[];
     className?: string;
     autoFetch?: boolean;
     debounce?: number;
     state?: TDataKitStateMode;
     manual?: boolean;
     fullHeight?: boolean;
     children: (dataKit: TUseDataKitReturn<unknown, TExtractDataKitItemType<TAction>>) => React.ReactNode;
}>) => {
     // ** Deconstruct Props
     const {
          action,
          query,
          filterConfig,
          filters = [],
          limit: limitConfig,
          defaultSort = [],
          className,
          autoFetch = true,
          debounce = 300,
          state: stateMode = 'memory',
          manual = false,
          fullHeight = true,
          children,
     } = props;

     // ** Type
     type TItem = TExtractDataKitItemType<TAction>;

     // ** Ref
     const containerRef = useRef<HTMLDivElement>(null);
     const scrollContainerRef = useRef<HTMLDivElement>(null);
     const [allItems, setAllItems] = useState<TItem[]>([]);

     // ** State
     const [isFilterOpen, setIsFilterOpen] = useState(false);

     // ** Variable
     const overlayContainer = containerRef.current;

     // ** Hooks
     const dataKit = useDataKit<unknown, TItem>({
          action: action as unknown as (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TItem>>,
          filterConfig,
          autoFetch: false, // We'll control fetching manually
          debounce,
          state: stateMode,
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

     // ** Intersection Observer for infinite scroll
     const { ref: loadMoreBottomRef, inView: inViewBottom } = useInView({
          threshold: 0,
          rootMargin: '100px',
     });

     // ** Handlers
     const handleResetFilters = useCallback(() => {
          filters.forEach((f) => {
               dataKit.actions.setFilter(f.id, f.defaultValue ?? (f.type === 'BOOLEAN' ? false : ''));
          });
     }, [filters, dataKit.actions]);

     const loadMore = useCallback(() => {
          if (dataKit.state.isLoading || !dataKit.state.hasNextPage) return;
          dataKit.actions.setPage(dataKit.page + 1);
     }, [dataKit.state.isLoading, dataKit.state.hasNextPage, dataKit.page, dataKit.actions]);

     // ** Initial fetch
     useEffect(() => {
          if (autoFetch) dataKit.actions.refresh();

     }, [autoFetch]);

     // ** Append new items when dataKit items change
     useEffect(() => {
          if (dataKit.items.length > 0) {
               setAllItems((prev) => {
                    if (dataKit.page === 1) return dataKit.items;
                    return [...prev, ...dataKit.items];
               });
          } else if (dataKit.page === 1) {
               setAllItems([]);
          }
     }, [dataKit.items, dataKit.page]);

     // ** Infinite scroll trigger
     useEffect(() => {
          if (inViewBottom && !dataKit.state.isLoading && dataKit.state.hasNextPage) {
               loadMore();
          }
     }, [inViewBottom, dataKit.state.isLoading, dataKit.state.hasNextPage]);

     // ** Create enhanced dataKit with all accumulated items
     const enhancedDataKit = {
          ...dataKit,
          items: allItems,
     };

     // ** Render
     return (
          <div
               ref={containerRef}
               className={`flex flex-col ${fullHeight ? 'h-full' : ''}`}
          >
               {/* Toolbar */}
               {filters.length > 0 && (
                    <div className="shrink-0 px-4 pt-4 pb-3">
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
                    </div>
               )}


               {/* Scrollable Content */}
               <div
                    ref={scrollContainerRef}
                    className={`relative flex-1 ${fullHeight ? 'min-h-0' : ''} overflow-y-auto overflow-x-hidden ${className ?? ''}`}
               >
                    {/* User content */}
                    {children(enhancedDataKit)}

                    {/* Load more trigger at bottom */}
                    <div ref={loadMoreBottomRef} className={manual ? '' : 'flex items-center justify-center py-4'}>
                         {!manual && (
                              <>
                                   {dataKit.state.isLoading && <Loader2 className="size-6 animate-spin text-muted-foreground" />}
                                   {!dataKit.state.isLoading && !dataKit.state.hasNextPage && allItems.length > 0 && (
                                        <p className="text-sm text-muted-foreground">You're all set</p>
                                   )}
                              </>
                         )}
                    </div>
               </div>
          </div >
     );
};

export const DataKitInfinity = DataKitInfinityInner as unknown as <
     TAction extends (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TDataKitSelectableItem>>
>(
     props: Readonly<{
          action: TAction;
          query?: Record<string, unknown>;
          filterConfig?: TFilterConfig;
          filters?: TDataKitFilterItem[];
          limit?: { default: number };
          defaultSort?: { path: string; value: 1 | -1 }[];
          className?: string;
          autoFetch?: boolean;
          debounce?: number;
          state?: TDataKitStateMode;
          manual?: boolean;
          fullHeight?: boolean;
          children: (dataKit: TUseDataKitReturn<unknown, TExtractDataKitItemType<TAction>>) => React.ReactNode;
     }>
) => React.ReactElement;
