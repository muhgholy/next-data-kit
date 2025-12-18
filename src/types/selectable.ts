/**
 * next-data-kit - Selectable Types
 *
 * Types for selectable/multi-select functionality in tables.
 */

// ** ============================================================================
// ** State Types
// ** ============================================================================

/**
 * Selection state for a table
 */
export type TSelectionState<T = string> = {
     // ** Set of selected item IDs
     selectedIds: Set<T>;
     // ** Whether all items are selected
     isAllSelected: boolean;
     // ** Whether some (but not all) items are selected
     isIndeterminate: boolean;
};

// ** ============================================================================
// ** Action Types
// ** ============================================================================

/**
 * Selection actions for a table
 */
export type TSelectionActions<T = string> = {
     // ** Select a single item
     select: (id: T) => void;
     // ** Deselect a single item
     deselect: (id: T) => void;
     // ** Toggle selection of a single item
     toggle: (id: T) => void;
     // ** Select all items
     selectAll: (ids: T[]) => void;
     // ** Deselect all items
     deselectAll: () => void;
     // ** Toggle all items selection
     toggleAll: (ids: T[]) => void;
     // ** Check if an item is selected
     isSelected: (id: T) => boolean;
     // ** Get array of selected IDs
     getSelectedArray: () => T[];
};

// ** ============================================================================
// ** Combined Types
// ** ============================================================================

/**
 * Combined selection hook return type
 */
export type TUseSelectionReturn<T = string> = TSelectionState<T> & TSelectionActions<T>;

/**
 * Selection mode for tables
 */
export type TSelectionMode = 'single' | 'multiple' | 'none';

/**
 * Selectable item type
 */
export type TSelectable = {
     id: string;
     selected?: boolean;
     disabled?: boolean;
};
