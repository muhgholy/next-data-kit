/**
 * next-data-kit - Client Exports
 *
 * Client-side utilities, hooks, and components for next-data-kit.
 */

'use client';

// ** Hooks
export { useDataKit, useSelection, useSelectionWithTotal, usePagination, type TUseDataKitOptions, type TUsePaginationReturn } from './hooks';

// ** Context
export { createDataKitContext, DataKitProvider, useDataKitContext, DataKitContext, type TDataKitContextValue } from './context';

// ** Components
export { DataKitTable, DataKit, DataKitInfinity } from './components';

// ** Utilities
export { getColumnValue, getSortValue, getNextSortValue, formatNumber, debounce, throttle, sortEntriesToKey, keyToSortEntries } from './utils';

// ** Re-export types commonly used on client
export type {
	TDataKitState,
	TDataKitActions,
	TUseDataKitReturn,
	TDataKitColumn,
	TSortEntry,
	TFilterConfig,
	TPaginationInfo,
	TSelectionState,
	TSelectionActions,
	TUseSelectionReturn,
	TSelectionMode,
	TSelectable,
	// ** Component types
	TExtractDataKitItemType,
	TDataKitComponentColumn,
	TDataKitFilterItem,
	TDataKitBulkAction,
	TDataKitController,
	TDataKitSelectableItem,
	TDataKitStateMode,
} from '../types';
