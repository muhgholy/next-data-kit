/**
 * next-data-kit - Component Types
 *
 * Types for the React Data Kit component and related UI elements.
 */

import type { TDataKitInput, TDataKitResult } from '../next-data-kit';
import type { TUseDataKitReturn } from './hook';

/**
 * Extract the item type from a TDataKitResult
 */
type TExtractDataKitItemFromResult<R> = R extends TDataKitResult<infer I> ? I : R extends { items: (infer I)[] } ? I : R extends [true, infer Ok] ? (Ok extends { items: (infer I)[] } ? I : never) : never;

/**
 * Extract the item type from an action function's return type
 */
export type TExtractDataKitItemType<T> = T extends (input: TDataKitInput<unknown>) => infer R ? TExtractDataKitItemFromResult<Awaited<R>> : never;

/**
 * Column definition for React Data Kit component
 */
export type TDataKitComponentColumn<TItem, TRowState = unknown> = {
	// ** Column header content
	head: React.ReactNode;
	// ** Column body renderer
	body: (
		props: Readonly<{
			item: TItem;
			index: number;
			state: TRowState;
			setState: React.Dispatch<React.SetStateAction<TRowState>>;
			setItem: (item: TItem) => void;
			deleteItem: () => void;
		}>,
	) => React.ReactNode;
	// ** Sortable configuration
	sortable?: { path: string; default: 1 | -1 | 0 };
};

/**
 * Base filter item properties
 */
type TDataKitFilterItemBase = {
	id: string;
	label: string;
	placeholder?: string;
};

/**
 * Text filter item
 */
export type TDataKitFilterItemText = TDataKitFilterItemBase & {
	type: 'TEXT';
	defaultValue?: string;
};

/**
 * Select filter item - dataset is required
 */
export type TDataKitFilterItemSelect = TDataKitFilterItemBase & {
	type: 'SELECT';
	dataset: { id: string; name: string; label: string }[];
	defaultValue?: string;
};

/**
 * Boolean filter item
 */
export type TDataKitFilterItemBoolean = TDataKitFilterItemBase & {
	type: 'BOOLEAN';
	defaultValue?: boolean;
};

/**
 * Filter item configuration - discriminated union for type safety
 */
export type TDataKitFilterItem = TDataKitFilterItemText | TDataKitFilterItemSelect | TDataKitFilterItemBoolean;

/**
 * Bulk action definition for selectable tables
 */
export type TDataKitBulkAction<TItem> = {
	name: string;
	function: (selectedItems: TItem[]) => Promise<[boolean, { deselectAll?: boolean; updatedItems?: TItem[] } | string]>;
};

/**
 * Controller ref for external DataKitTable manipulation
 */
export type TDataKitController<TItem> = {
	// ** Add a new item to the table
	itemPush: (item: TItem, position?: 0 | 1) => void;
	// ** Refetch data from the server
	refetchData: () => void;
	// ** Delete multiple items
	deleteBulk: (items: TItem[]) => void;
	// ** Get selected items
	getSelectedItems: () => TItem[];
	// ** Clear all selections
	clearSelection: () => void;
};

/**
 * Item with ID for selection purposes
 */
export type TDataKitSelectableItem = {
	id: string | number;
};

/**
 * State persistence mode
 */
export type TDataKitStateMode = 'memory' | 'search-params';

/**
 * DataKit Component Ref Type
 * Exposes the internal state and actions of the DataKit component.
 */
export type TDataKitRef<T = unknown, R = unknown> = TUseDataKitReturn<T, R>;
