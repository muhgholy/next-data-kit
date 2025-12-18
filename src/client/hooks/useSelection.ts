/**
 * next-data-kit - useSelection Hook
 *
 * React hook for managing table row selection.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import type { TUseSelectionReturn } from '../../types';

// ** ============================================================================
// ** Hook
// ** ============================================================================

export const useSelection = <T = string>(initialSelected: T[] = []): TUseSelectionReturn<T> => {
     // ** State
     const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set(initialSelected));

     // ** Select a single item
     const select = useCallback((id: T) => {
          setSelectedIds((prev) => new Set(prev).add(id));
     }, []);

     // ** Deselect a single item
     const deselect = useCallback((id: T) => {
          setSelectedIds((prev) => {
               const next = new Set(prev);
               next.delete(id);
               return next;
          });
     }, []);

     // ** Toggle selection of a single item
     const toggle = useCallback((id: T) => {
          setSelectedIds((prev) => {
               const next = new Set(prev);
               if (next.has(id)) next.delete(id);
               else next.add(id);
               return next;
          });
     }, []);

     // ** Select all items
     const selectAll = useCallback((ids: T[]) => {
          setSelectedIds(new Set(ids));
     }, []);

     // ** Deselect all items
     const deselectAll = useCallback(() => {
          setSelectedIds(new Set());
     }, []);

     // ** Toggle all items selection
     const toggleAll = useCallback((ids: T[]) => {
          setSelectedIds((prev) => {
               // ** If all are selected, deselect all
               if (ids.every((id) => prev.has(id))) return new Set();
               // ** Otherwise, select all
               return new Set(ids);
          });
     }, []);

     // ** Check if an item is selected
     const isSelected = useCallback((id: T) => selectedIds.has(id), [selectedIds]);

     // ** Get array of selected IDs
     const getSelectedArray = useCallback(() => Array.from(selectedIds), [selectedIds]);

     // ** Calculate derived state
     const isAllSelected = useMemo(() => selectedIds.size > 0, [selectedIds.size]);
     const isIndeterminate = useMemo(() => false, []);

     return {
          selectedIds,
          isAllSelected,
          isIndeterminate,
          select,
          deselect,
          toggle,
          selectAll,
          deselectAll,
          toggleAll,
          isSelected,
          getSelectedArray,
     };
};

// ** ============================================================================
// ** Hook with Total
// ** ============================================================================

export const useSelectionWithTotal = <T = string>(
     totalItems: T[],
     initialSelected: T[] = []
): Omit<TUseSelectionReturn<T>, 'toggleAll'> & {
     isAllSelected: boolean;
     isIndeterminate: boolean;
     toggleAll: () => void;
} => {
     // ** Base selection hook
     const selection = useSelection<T>(initialSelected);

     // ** Calculate derived state
     const isAllSelected = useMemo(
          () => totalItems.length > 0 && totalItems.every((id) => selection.selectedIds.has(id)),
          [totalItems, selection.selectedIds]
     );

     const isIndeterminate = useMemo(
          () => selection.selectedIds.size > 0 && selection.selectedIds.size < totalItems.length,
          [totalItems.length, selection.selectedIds.size]
     );

     // ** Override toggleAll to use totalItems
     const toggleAll = useCallback(() => {
          if (isAllSelected) selection.deselectAll();
          else selection.selectAll(totalItems);
     }, [isAllSelected, selection, totalItems]);

     return {
          ...selection,
          isAllSelected,
          isIndeterminate,
          toggleAll,
     };
};
