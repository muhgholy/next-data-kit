'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Filter, Loader2, MoreHorizontal } from 'lucide-react';
import { useDataKit } from '../hooks/useDataKit';
import { useSelectionWithTotal } from '../hooks/useSelection';
import { usePagination } from '../hooks/usePagination';
import {
     Button,
     Checkbox,
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
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
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from './ui';
import type {
     TDataKitInput,
     TDataKitResult,
     TDataKitComponentColumn,
     TDataKitFilterItem,
     TDataKitBulkAction,
     TDataKitController,
     TDataKitMemoryMode,
     TExtractDataKitItemType,

     TDataKitSelectableItem,
} from '../../types';


const DataKitRoot = <
     TAction extends (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TDataKitSelectableItem>>,
     TRowState = unknown
>(props: Readonly<{
     action: TAction;
     query?: Record<string, unknown>;

     table: TDataKitComponentColumn<TExtractDataKitItemType<TAction>, TRowState>[];
     filters?: TDataKitFilterItem[];
     selectable?: {
          enabled: boolean;
          actions?: Record<string, TDataKitBulkAction<TExtractDataKitItemType<TAction>>>;
     };
     state?: TRowState;
     limit?: { default: number };
     className?: string;
     autoFetch?: boolean;
     debounce?: number;
     bordered?: boolean | 'rounded';
     refetchInterval?: number;
     memory?: TDataKitMemoryMode;
     pagination?: 'SIMPLE' | 'NUMBER';
     controller?: React.MutableRefObject<TDataKitController<TExtractDataKitItemType<TAction>> | null>;
}>) => {
     // ** Deconstruct Props
     const {
          action,
          query,
          table: columns,
          filters = [],
          selectable,
          state: initialState,
          limit: limitConfig,
          className,
          autoFetch = true,
          debounce = 300,
          bordered,
          refetchInterval,
          memory: memoryMode = 'memory',
          pagination: paginationType = 'NUMBER',
          controller,
     } = props;

     // ** Type
     type TItem = TExtractDataKitItemType<TAction>;

     // ** Ref
     const tableRef = useRef<HTMLDivElement>(null);
     const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

     // ** State
     const [isVisible, setIsVisible] = useState(false);
     const [isFilterOpen, setIsFilterOpen] = useState(false);
     const [actionLoading, setActionLoading] = useState<string | null>(null);
     const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
     const [rowStates, setRowStates] = useState<Map<string | number, TRowState>>(new Map());
     const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

     // ** Variable
     const overlayContainer = tableRef.current;

     // ** Helper functions for row state management
     const getRowState = useCallback((rowId: string | number): TRowState => {
          return rowStates.get(rowId) ?? (initialState as TRowState);
     }, [rowStates, initialState]);

     const setRowState = useCallback((rowId: string | number, updater: React.SetStateAction<TRowState>) => {
          setRowStates(prev => {
               const current = prev.get(rowId) ?? (initialState as TRowState);
               const newState = typeof updater === 'function'
                    ? (updater as (prevState: TRowState) => TRowState)(current)
                    : updater;
               const newMap = new Map(prev);
               newMap.set(rowId, newState);
               return newMap;
          });
     }, [initialState]);

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
               sorts: columns.reduce<{ path: string; value: 1 | -1 }[]>((acc, col) => {
                    if (col.sortable && col.sortable.default !== 0) {
                         acc.push({ path: col.sortable.path, value: col.sortable.default as 1 | -1 });
                    }
                    return acc;
               }, []),
               filter: filters.reduce<Record<string, unknown>>((acc, f) => {
                    if (f.defaultValue !== undefined) acc[f.id] = f.defaultValue;
                    return acc;
               }, {}),
          },
     });
     const pagination = usePagination({ page: dataKit.page, limit: dataKit.limit, total: dataKit.total, siblingCount: 1 });
     const selection = useSelectionWithTotal<string | number>(dataKit.items.map((item) => item.id));

     // ** Variable
     const selectedCount = selection.selectedIds.size;
     const colSpan = columns.length + (selectable?.enabled ? 1 : 0);
     const limitOptions = React.useMemo(() => {
          const standardOptions = [10, 25, 50, 100];
          const currentLimit = dataKit.limit;
          if (!standardOptions.includes(currentLimit)) {
               return [...standardOptions, currentLimit].sort((a, b) => a - b);
          }
          return standardOptions;
     }, [dataKit.limit]);

     // ** Handlers
     const handleSort = useCallback((path: string) => {
          const currentSort = dataKit.sorts.find((s) => s.path === path);
          const nextValue = currentSort?.value === 1 ? -1 : currentSort?.value === -1 ? null : 1;
          dataKit.actions.setSort(path, nextValue);
     }, [dataKit.sorts, dataKit.actions]);

     const handleSelectionAction = useCallback(async (actionKey: string) => {
          const action = selectable?.actions?.[actionKey];
          if (!action || action.type === 'SEPARATOR' || actionLoading) return;
          setActionLoading(actionKey);
          setActionsMenuOpen(false);
          try {
               const selectedItems = dataKit.items.filter((item) => selection.isSelected(item.id));
               const result = await action.function(selectedItems);
               if (result[0]) {
                    const data = result[1] as { deselectAll?: boolean };
                    if (data.deselectAll) selection.deselectAll();
                    await dataKit.actions.refresh();
               }
          } catch (error) {
               console.error('Selection action failed:', error);
          } finally {
               setActionLoading(null);
          }
     }, [selectable?.actions, actionLoading, dataKit.items, selection, dataKit.actions]);

     const handleResetFilters = useCallback(() => {
          filters.forEach((f) => {
               dataKit.actions.setFilter(f.id, f.defaultValue ?? (f.type === 'BOOLEAN' ? false : ''));
          });
     }, [filters, dataKit.actions]);

     const getSortFor = useCallback((path: string) => dataKit.sorts.find((s) => s.path === path)?.value ?? null, [dataKit.sorts]);

     const handleRowSelection = useCallback((rowIndex: number, event: React.MouseEvent) => {
          if (event.shiftKey && lastSelectedIndex !== null) {
               // Range selection
               const start = Math.min(lastSelectedIndex, rowIndex);
               const end = Math.max(lastSelectedIndex, rowIndex);
               for (let i = start; i <= end; i++) {
                    const item = dataKit.items[i];
                    if (item && item.id !== undefined && !selection.isSelected(item.id)) {
                         selection.select(item.id);
                    }
               }
          } else {
               // Single selection with toggle
               const item = dataKit.items[rowIndex];
               if (item && item.id !== undefined) {
                    selection.toggle(item.id);
               }
          }
          setLastSelectedIndex(rowIndex);
     }, [lastSelectedIndex, dataKit.items, selection]);

     // ** Effects
     useEffect(() => {
          if (controller) {
               controller.current = {
                    itemPush: dataKit.actions.itemPush,
                    refetchData: dataKit.actions.refresh,
                    deleteBulk: dataKit.actions.deleteBulk,
                    getSelectedItems: () => dataKit.items.filter((item) => selection.isSelected(item.id)),
                    clearSelection: () => selection.deselectAll(),
               };
          }
     }, [controller, dataKit.actions, dataKit.items, selection]);

     useEffect(() => {
          if (!tableRef.current || !refetchInterval) return;
          const observer = new IntersectionObserver(
               (entries) => entries[0] && setIsVisible(entries[0].isIntersecting),
               { threshold: 0.1 }
          );
          const currentRef = tableRef.current;
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

     useEffect(() => { selection.deselectAll(); }, [dataKit.items.length]);

     // ** Render
     return (
          <div ref={tableRef} className={`space-y-3 ${className ?? ''}`}>
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
                                                                 <Checkbox
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

               </div>

               {/* Table */}
               <div className={`overflow-hidden border border-gray-200 dark:border-gray-800 ${bordered === 'rounded' ? 'rounded-lg' : bordered ? '' : 'rounded-lg'}`}>
                    <Table>
                         <TableHeader>
                              <TableRow>
                                   {selectable?.enabled && (
                                        <TableHead className="w-12">
                                             <div className="flex items-center gap-2">
                                                  <Checkbox
                                                       checked={selection.isIndeterminate ? 'indeterminate' : selection.isAllSelected}
                                                       onCheckedChange={() => selection.toggleAll()}
                                                  />
                                                  {selectable.actions && Object.keys(selectable.actions).length > 0 && (
                                                       <DropdownMenu open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
                                                            <DropdownMenuTrigger asChild>
                                                                 <Button
                                                                      variant="ghost"
                                                                      size="icon"
                                                                      className="size-6"
                                                                      disabled={selectedCount === 0 || !!actionLoading}
                                                                 >
                                                                      {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                                                                 </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" container={overlayContainer}>
                                                                 {Object.entries(selectable.actions).map(([key, action]) =>
                                                                      action.type === 'SEPARATOR' ? (
                                                                           <DropdownMenuSeparator key={key} />
                                                                      ) : (
                                                                           <DropdownMenuItem key={key} disabled={!!actionLoading} onSelect={() => handleSelectionAction(key)}>
                                                                                {actionLoading === key ? 'Working…' : <>{action.icon}{action.name}</>}
                                                                           </DropdownMenuItem>
                                                                      )
                                                                 )}
                                                            </DropdownMenuContent>
                                                       </DropdownMenu>
                                                  )}
                                             </div>
                                        </TableHead>
                                   )}
                                   {columns.map((col, idx) => (
                                        <React.Fragment key={idx}>
                                             {col.sortable ? (
                                                  <TableHead {...(React.isValidElement(col.head) ? (col.head.props as object) : {})}>
                                                       <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="-ml-4 h-auto py-0"
                                                            onClick={() => handleSort(col.sortable!.path)}
                                                       >
                                                            {React.isValidElement(col.head) ? (col.head as React.ReactElement<{ children?: React.ReactNode }>).props.children : col.head}
                                                            {getSortFor(col.sortable!.path) === 1 && <ArrowUp className="ml-1 size-4" />}
                                                            {getSortFor(col.sortable!.path) === -1 && <ArrowDown className="ml-1 size-4" />}
                                                       </Button>
                                                  </TableHead>
                                             ) : (
                                                  col.head
                                             )}
                                        </React.Fragment>
                                   ))}
                              </TableRow>
                         </TableHeader>
                         <TableBody>
                              {dataKit.state.isLoading ? (
                                   <TableRow>
                                        <TableCell colSpan={colSpan} className="h-24 text-center">
                                             <Loader2 className="mx-auto size-5 animate-spin" />
                                        </TableCell>
                                   </TableRow>
                              ) : dataKit.state.error ? (
                                   <TableRow>
                                        <TableCell colSpan={colSpan} className="h-24 text-center text-red-500">
                                             Error: {dataKit.state.error.message}
                                        </TableCell>
                                   </TableRow>
                              ) : dataKit.items.length === 0 ? (
                                   <TableRow>
                                        <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                                             No results found.
                                        </TableCell>
                                   </TableRow>
                              ) : (
                                   dataKit.items.map((item, idx) => {
                                        const rowId = item.id ?? idx;
                                        return (
                                             <TableRow key={rowId}>
                                                  {selectable?.enabled && (
                                                       <TableCell onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                 checked={selection.isSelected(item.id)}
                                                                 onCheckedChange={() => { }}
                                                                 onClick={(e) => handleRowSelection(idx, e as any)}
                                                            />
                                                       </TableCell>
                                                  )}
                                                  {columns.map((col, colIdx) => (
                                                       <React.Fragment key={colIdx}>
                                                            {col.body({
                                                                 item,
                                                                 index: idx,
                                                                 state: getRowState(rowId),
                                                                 setState: (updater) => setRowState(rowId, updater),
                                                                 setItem: (updatedItem) => dataKit.actions.setItemAt(idx, updatedItem),
                                                                 deleteItem: () => dataKit.actions.deleteItemAt(idx),
                                                            })}
                                                       </React.Fragment>
                                                  ))}
                                             </TableRow>
                                        );
                                   })
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* Footer */}
               <div className="flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                         <Select value={String(dataKit.limit)} onValueChange={(v) => dataKit.actions.setLimit(Number(v))} disabled={dataKit.state.isLoading}>
                              <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                              <SelectContent container={overlayContainer}>
                                   {limitOptions.map((v) => (
                                        <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                         <p className="text-sm text-muted-foreground whitespace-nowrap">
                              Page {dataKit.page} of {pagination.totalPages}
                         </p>
                         {selectable?.enabled && selectedCount > 0 && (
                              <p className="text-sm text-foreground">
                                   {selectedCount} selected
                              </p>
                         )}
                    </div>
                    <div className="flex justify-end">
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
                              <Pagination className="w-auto">
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
                                                            onClick={() => dataKit.actions.setPage(pageNum as number)}
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
          </div>
     );
};

export const DataKitTable = Object.assign(DataKitRoot, {
     Cell: TableCell,
     Head: TableHead,
});
