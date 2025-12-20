'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Filter, Loader2, RefreshCw } from 'lucide-react';
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
     TDataKitRef,
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
     inverse?: boolean;
     manual?: boolean;
     pullDownToRefresh?: {
          isActive: boolean;
          threshold?: number;
     };
     children: (dataKit: TUseDataKitReturn<unknown, TExtractDataKitItemType<TAction>>) => React.ReactNode;
}>, ref: React.ForwardedRef<TDataKitRef<unknown, TExtractDataKitItemType<TAction>>>) => {
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
          inverse = false,
          manual = false,
          pullDownToRefresh,
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
     const [isPullRefreshing, setIsPullRefreshing] = useState(false);
     const [pullStartY, setPullStartY] = useState(0);
     const [pullDistance, setPullDistance] = useState(0);

     // ** Variable
     const overlayContainer = containerRef.current;
     const pullThreshold = pullDownToRefresh?.threshold ?? 50;

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

     const { ref: loadMoreTopRef, inView: inViewTop } = useInView({
          threshold: 0,
          rootMargin: '100px',
     });

     // ** Imperative Handle
     React.useImperativeHandle(ref, () => dataKit as unknown as TDataKitRef<unknown, TItem>, [dataKit]);

     // ** Handlers
     const handleResetFilters = useCallback(() => {
          filters.forEach((f) => {
               dataKit.actions.setFilter(f.id, f.defaultValue ?? (f.type === 'BOOLEAN' ? false : ''));
          });
     }, [filters, dataKit.actions]);

     const loadMore = useCallback(async () => {
          if (dataKit.state.isLoading || !dataKit.state.hasNextPage) return;

          dataKit.actions.setPage(dataKit.page + 1);
     }, [dataKit]);

     const resetAndFetch = useCallback(async () => {
          setAllItems([]);
          dataKit.actions.setPage(1);
          await dataKit.actions.refresh();
     }, [dataKit.actions]);

     // ** Pull to refresh handlers
     const handleTouchStart = useCallback((e: TouchEvent) => {
          if (!pullDownToRefresh?.isActive) return;
          const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
          if (scrollTop === 0 && e.touches && e.touches[0]) {
               setPullStartY(e.touches[0].clientY);
          }
     }, [pullDownToRefresh?.isActive]);

     const handleTouchMove = useCallback((e: TouchEvent) => {
          if (!pullDownToRefresh?.isActive || pullStartY === 0) return;
          if (!e.touches || !e.touches[0]) return;
          const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
          if (scrollTop === 0) {
               const distance = e.touches[0].clientY - pullStartY;
               if (distance > 0) {
                    setPullDistance(Math.min(distance, pullThreshold * 2));
                    if (distance > pullThreshold * 2) {
                         e.preventDefault();
                    }
               }
          }
     }, [pullDownToRefresh?.isActive, pullStartY, pullThreshold]);

     const handleTouchEnd = useCallback(async () => {
          if (!pullDownToRefresh?.isActive) return;
          if (pullDistance > pullThreshold) {
               setIsPullRefreshing(true);
               await resetAndFetch();
               setIsPullRefreshing(false);
          }
          setPullStartY(0);
          setPullDistance(0);
     }, [pullDownToRefresh?.isActive, pullDistance, pullThreshold, resetAndFetch]);

     // ** Effects
     useEffect(() => {
          if (!pullDownToRefresh?.isActive) return;

          const container = scrollContainerRef.current;
          if (!container) return;

          container.addEventListener('touchstart', handleTouchStart);
          container.addEventListener('touchmove', handleTouchMove, { passive: false });
          container.addEventListener('touchend', handleTouchEnd);

          return () => {
               container.removeEventListener('touchstart', handleTouchStart);
               container.removeEventListener('touchmove', handleTouchMove);
               container.removeEventListener('touchend', handleTouchEnd);
          };
     }, [pullDownToRefresh?.isActive, handleTouchStart, handleTouchMove, handleTouchEnd]);

     // ** Initial fetch
     useEffect(() => {
          if (autoFetch && dataKit.page === 1 && allItems.length === 0) {
               dataKit.actions.refresh();
          }
     }, [autoFetch]);

     // ** Append new items when dataKit items change
     useEffect(() => {
          if (dataKit.items.length > 0) {
               setAllItems((prev) => {
                    if (dataKit.page === 1) {
                         return dataKit.items;
                    }
                    // Check if items are already in the list to avoid duplicates
                    const newItems = dataKit.items.filter(
                         (newItem) => !prev.some((existingItem) => (existingItem as any).id === (newItem as any).id)
                    );
                    return inverse ? [...newItems, ...prev] : [...prev, ...newItems];
               });
          }
     }, [dataKit.items, dataKit.page, inverse]);

     // ** Load more when in view
     useEffect(() => {
          if (inViewBottom && !inverse) {
               loadMore();
          }
     }, [inViewBottom, inverse, loadMore]);

     // ** Load more for inverse mode when top trigger is in view
     useEffect(() => {
          if (inViewTop && inverse) {
               loadMore();
          }
     }, [inViewTop, inverse, loadMore]);

     // ** Create enhanced dataKit with all accumulated items
     const enhancedDataKit = {
          ...dataKit,
          items: allItems,
     };

     // ** Render
     return (
          <div ref={containerRef} className={`flex flex-col ${className ?? ''}`}>
               {/* Toolbar */}
               {filters.length > 0 && (
                    <div className="mb-3">
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
               

               {/* Scrollable Content */ }
     <div ref={scrollContainerRef} className="relative flex-1 overflow-auto">
          {/* Pull to refresh indicator */}
          {pullDownToRefresh?.isActive && pullDistance > 0 && (
               <div
                    className="absolute left-0 right-0 top-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all"
                    style={{ height: `${pullDistance}px` }}
               >
                    {pullDistance > pullThreshold ? (
                         <RefreshCw className="size-5 text-primary" />
                    ) : (
                         <span className="text-sm text-muted-foreground">Pull to refresh</span>
                    )}
               </div>
          )}

          {!manual && isPullRefreshing && (
               <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
               </div>
          )}

          {/* Load more trigger at top for inverse mode */}
          {inverse && <div ref={loadMoreTopRef} className={manual ? '' : 'flex items-center justify-center py-4'}>
               {!manual && dataKit.state.hasNextPage && dataKit.state.isLoading && (
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
               )}
          </div>}

          {/* User content */}
          {manual ? (
               children(enhancedDataKit)
          ) : (
               <>
                    {children(enhancedDataKit)}

                    {/* Empty state */}
                    {!dataKit.state.isLoading && allItems.length === 0 && (
                         <div className="flex h-48 items-center justify-center text-muted-foreground">
                              No results found.
                         </div>
                    )}
               </>
          )}

          {/* Load more trigger at bottom for normal mode */}
          {!inverse && (
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
          )}
     </div>
          </div >
     );
};

export const DataKitInfinity = React.forwardRef(DataKitInfinityInner) as unknown as <
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
          inverse?: boolean;
          manual?: boolean;
          pullDownToRefresh?: {
               isActive: boolean;
               threshold?: number;
          };
          children: (dataKit: TUseDataKitReturn<unknown, TExtractDataKitItemType<TAction>>) => React.ReactNode;
          ref?: React.Ref<TDataKitRef<unknown, TExtractDataKitItemType<TAction>>>;
     }>
) => React.ReactElement;
