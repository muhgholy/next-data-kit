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
    DropdownMenuTrigger,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
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
    TDataKitComponentController,
    TDataKitSelectableItem,
    TDataKitStateMode,
    TExtractDataKitItemType,
    TFilterConfig,
} from '../../types';

// ** ============================================================================
// ** Component
// ** ============================================================================

const DataKitRoot = <
    TAction extends (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TDataKitSelectableItem>>,
    TRowState = unknown
>(props: Readonly<{
    action: TAction;
    query?: Record<string, unknown>;
    filterConfig?: TFilterConfig;
    table: TDataKitComponentColumn<TExtractDataKitItemType<TAction>, TRowState>[];
    filters?: TDataKitFilterItem[];
    selectable?: {
        enabled: boolean;
        actions?: Record<string, TDataKitBulkAction<TExtractDataKitItemType<TAction>>>;
    };
    initialState?: TRowState;
    limit?: { default: number };
    className?: string;
    autoFetch?: boolean;
    debounce?: number;
    bordered?: boolean | 'rounded';
    refetchInterval?: number;
    state?: TDataKitStateMode;
    controller?: React.MutableRefObject<TDataKitComponentController<TExtractDataKitItemType<TAction>> | null>;
}>) => {
    // ** Deconstruct Props
    const {
        action,
        query,
        filterConfig,
        table: columns,
        filters = [],
        selectable,
        initialState,
        limit: limitConfig,
        className,
        autoFetch = true,
        debounce = 300,
        bordered,
        refetchInterval,
        state: stateMode = 'memory',
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

    // ** Variable
    const overlayContainer = tableRef.current;

    // ** Hooks
    const dataKit = useDataKit<unknown, TItem>({
        action: action as unknown as (input: TDataKitInput<unknown>) => Promise<TDataKitResult<TItem>>,
        filterConfig,
        autoFetch,
        debounce,
        state: stateMode,
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

    // ** Handlers
    const handleSort = useCallback((path: string) => {
        const currentSort = dataKit.sorts.find((s) => s.path === path);
        const nextValue = currentSort?.value === 1 ? -1 : currentSort?.value === -1 ? null : 1;
        dataKit.actions.setSort(path, nextValue);
    }, [dataKit.sorts, dataKit.actions]);

    const handleSelectionAction = useCallback(async (actionKey: string) => {
        if (!selectable?.actions?.[actionKey] || actionLoading) return;
        setActionLoading(actionKey);
        setActionsMenuOpen(false);
        try {
            const selectedItems = dataKit.items.filter((item) => selection.isSelected(item.id));
            const result = await selectable.actions[actionKey].function(selectedItems);
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
                            {[10, 25, 50, 100].map((v) => (
                                <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                                                    {Object.entries(selectable.actions).map(([key, action]) => (
                                                        <DropdownMenuItem key={key} disabled={!!actionLoading} onSelect={() => handleSelectionAction(key)}>
                                                            {actionLoading === key ? 'Working…' : action.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </TableHead>
                            )}
                            {columns.map((col, idx) => (
                                <React.Fragment key={idx}>
                                    {col.sortable ? (
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3"
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
                        ) : dataKit.items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            dataKit.items.map((item, idx) => (
                                <TableRow key={item.id ?? idx}>
                                    {selectable?.enabled && (
                                        <TableCell>
                                            <Checkbox
                                                checked={selection.isSelected(item.id)}
                                                onCheckedChange={() => selection.toggle(item.id)}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((col, colIdx) => (
                                        <React.Fragment key={colIdx}>
                                            {col.body({
                                                item,
                                                index: idx,
                                                state: initialState as TRowState,
                                                setState: () => { },
                                                setItem: (updatedItem) => dataKit.actions.setItemAt(idx, updatedItem),
                                                deleteItem: () => dataKit.actions.deleteItemAt(idx),
                                            })}
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Page {dataKit.page} of {pagination.totalPages}
                    {selectable?.enabled && selectedCount > 0 && (
                        <span className="ml-2 text-foreground">({selectedCount} selected)</span>
                    )}
                </p>
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
            </div>
        </div>
    );
};

export const DataKitTable = Object.assign(DataKitRoot, {
    Cell: TableCell,
    Head: TableHead,
});
