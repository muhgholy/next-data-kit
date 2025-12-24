/**
 * next-data-kit - React Data Kit Types
 *
 * Core types for the next-data-kit server action and components.
 */

import type { TMongoFilterQuery, TSortOrder } from './server/database/mongo';

/**
 * Sort options type that references keys from the item type
 */
export type TSortOptions<T> = {
    [K in keyof T]?: TSortOrder;
};

/**
 * Sort entry for array-based sorting
 */
export type TSortEntry = {
    path: string;
    value: 1 | -1;
};

/**
 * Filter configuration item
 */
export type TFilterConfiguration = {
    // ** Type of filter matching
    type: 'REGEX' | 'EXACT';
    // ** Optional: different database field name
    field?: string;
};

/**
 * Filter configuration for automatic filtering
 */
export type TFilterConfig = {
    [key: string]: TFilterConfiguration;
};

/**
 * Custom filter configuration
 * Allows defining custom filter functions for specific filter keys
 */
export type TFilterCustomConfig<T = unknown> = {
    [id: string]: (data: unknown) => TMongoFilterQuery<T>;
};

/**
 * Variant of TFilterCustomConfig that allows customizing the returned filter shape.
 * Useful for Mongo (operator-based) vs. other ORMs (where clauses) in the future.
 */
export type TFilterCustomConfigWithFilter<TDoc = unknown, TFilter = TMongoFilterQuery<TDoc>> = {
    [id: string]: (data: unknown) => TFilter;
};

/**
 * React Data Kit server action input
 */
export type TDataKitInput<T = unknown> = {
    // ** Action type - currently only FETCH is supported
    action?: 'FETCH';
    // ** Current page number (1-indexed)
    page?: number;
    // ** Number of items per page
    limit?: number;
    // ** Legacy sort option
    sort?: TSortOptions<T>;
    // ** Multi-sort as an array
    sorts?: TSortEntry[];
    // ** Query parameters for exact match filtering
    query?: Record<string, string | number | boolean>;
    // ** Filter parameters (primitives only for security)
    filter?: Record<string, string | number | boolean | null>;
    // ** Filter configuration for automatic filtering
    filterConfig?: TFilterConfig;
    // ** Custom filter configuration
    filterCustom?: TFilterCustomConfig<T>;
};

/**
 * React Data Kit server action result
 */
export type TDataKitResult<R> = {
    type: 'ITEMS';
    items: R[];
    documentTotal: number;
};

/**
 * Pagination info for client-side use
 */
export type TPaginationInfo = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

/**
 * React Data Kit Adapter Interface
 * Defines the contract for a database adapter.
 */
export type TDataKitAdapter<T> = (
    params: Readonly<{
        filter: Record<string, unknown>;
        sorts: TSortEntry[];
        limit: number;
        page: number;
        skip: number;
        input: TDataKitInput<T>;
    }>,
) => Promise<{ items: T[]; total: number }>;
