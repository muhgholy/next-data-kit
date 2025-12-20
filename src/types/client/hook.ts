/**
 * next-data-kit - Hook Types
 *
 * Types for the next-data-kit hooks and state management.
 */

import type { TSortEntry, TFilterConfig, TDataKitInput, TDataKitResult } from '../next-data-kit';

/**
 * React Data Kit controller state
 */
export type TDataKitState<T = unknown> = {
	// ** Current page number
	page: number;
	// ** Items per page
	limit: number;
	// ** Current sort configuration
	sorts: TSortEntry[];
	// ** Current filter values
	filter: Record<string, unknown>;
	// ** Filter configuration
	filterConfig?: TFilterConfig;
	// ** Query parameters (exact match)
	query?: Record<string, unknown>;
	// ** Loading state
	isLoading: boolean;
	// ** Error state
	error: Error | null;
	// ** Current items
	items: T[];
	// ** Total document count
	total: number;
};

/**
 * React Data Kit controller actions
 */
export type TDataKitActions<T = unknown, R = unknown> = {
	// ** Go to a specific page
	setPage: (page: number) => void;
	// ** Set items per page
	setLimit: (limit: number) => void;
	// ** Set sort configuration
	setSort: (path: string, value: 1 | -1 | null, append?: boolean) => void;
	// ** Set multiple sorts
	setSorts: (sorts: TSortEntry[]) => void;
	// ** Set a filter value
	setFilter: (key: string, value: unknown) => void;
	// ** Set multiple filter values
	setFilters: (filters: Record<string, unknown>) => void;
	// ** Clear all filters
	clearFilters: () => void;
	// ** Set a query value
	setQuery: (key: string, value: unknown) => void;
	// ** Refresh the table data
	refresh: () => Promise<void>;
	// ** Reset to initial state
	reset: () => void;
	// ** Get current input for server action
	getInput: () => TDataKitInput<T>;

	// ** Replace current items
	setItems: (items: R[]) => void;
	// ** Update item at index
	setItemAt: (index: number, item: R) => void;
	// ** Delete item at index
	deleteItemAt: (index: number) => void;
	// ** Push item (0 = start, 1 = end)
	itemPush: (item: R, position?: 0 | 1) => void;
	// ** Delete multiple items (reference equality)
	deleteBulk: (items: R[]) => void;
};

/**
 * Combined next-data-kit controller return type
 */
export type TUseDataKitReturn<T = unknown, R = unknown> = {
	// ** Current page number
	page: number;
	// ** Items per page
	limit: number;
	// ** Current sort configuration
	sorts: TSortEntry[];
	// ** Current filter values
	filter: Record<string, unknown>;
	// ** Filter configuration
	filterConfig?: TFilterConfig;
	// ** Query parameters (exact match)
	query?: Record<string, unknown>;
	// ** Current items
	items: R[];
	// ** Total document count
	total: number;
	// ** Controller state
	state: {
		isLoading: boolean;
		error: Error | null;
		hasNextPage: boolean;
	};
	// ** Controller actions
	actions: TDataKitActions<T, R>;
};

/**
 * Options for the useDataKit hook
 */
export type TUseDataKitOptions<T = unknown, R = unknown> = {
	// ** Initial state configuration
	initial?: {
		page?: number;
		limit?: number;
		sorts?: TSortEntry[];
		filter?: Record<string, unknown>;
		query?: Record<string, unknown>;
	};
	// ** State management mode
	state?: 'memory' | 'search-params';
	// ** Filter configuration
	filterConfig?: TFilterConfig;
	// ** Server action to fetch data
	action: (input: TDataKitInput<T>) => Promise<TDataKitResult<R>>;
	// ** Called when data is fetched successfully
	onSuccess?: (result: TDataKitResult<R>) => void;
	// ** Called when an error occurs
	onError?: (error: Error) => void;
	// ** Auto-fetch on mount
	autoFetch?: boolean;
	// ** Debounce delay in milliseconds for filter changes
	debounce?: number;
};

/**
 * Column definition for next-data-kit (headless)
 */
export type TDataKitColumn<T = unknown> = {
	// ** Unique identifier for the column
	id: string;
	// ** Display header text
	header: string;
	// ** Accessor key or function
	accessor: keyof T | ((item: T) => unknown);
	// ** Whether the column is sortable
	sortable?: boolean;
	// ** Sort path (if different from accessor)
	sortPath?: string;
	// ** Whether the column is filterable
	filterable?: boolean;
	// ** Filter key (if different from accessor)
	filterKey?: string;
	// ** Column width
	width?: string | number;
	// ** Minimum width
	minWidth?: string | number;
	// ** Maximum width
	maxWidth?: string | number;
	// ** Text alignment
	align?: 'left' | 'center' | 'right';
	// ** Custom cell renderer
	cell?: (value: unknown, item: T, index: number) => React.ReactNode;
	// ** Custom header renderer
	headerCell?: (column: TDataKitColumn<T>) => React.ReactNode;
	// ** Whether the column is hidden
	hidden?: boolean;
	// ** Whether the column is sticky
	sticky?: 'left' | 'right';
};
