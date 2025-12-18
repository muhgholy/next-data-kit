/**
 * next-data-kit
 *
 * A powerful table utility for server-side pagination, filtering, and sorting
 * with React hooks and components.
 *
 * @packageDocumentation
 */

// Re-export everything from types
export * from './types';

// Re-export server utilities
export { dataKitServerAction, mongooseAdapter, adapterMemory, escapeRegex, createSearchFilter, type TDataKitServerActionOptions } from './server/index';

// Re-export client utilities
export { useDataKit, useSelection, useSelectionWithTotal, usePagination, createDataKitContext, DataKitProvider, useDataKitContext, DataKitContext, DataKit, getColumnValue, getSortValue, getNextSortValue, formatNumber, debounce, throttle, sortEntriesToKey, keyToSortEntries, type TDataKitControllerOptions, type TUsePaginationReturn, type TDataKitContextValue } from './client/index';
