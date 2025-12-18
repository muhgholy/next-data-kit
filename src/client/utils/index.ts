/**
 * next-data-kit - Utility Functions
 *
 * Helper utilities for client-side operations.
 */

import type { TDataKitColumn, TSortEntry } from '../../types';

export { cn, type ClassValue } from './cn';


/**
 * Get the value from an item using a column accessor
 */
export const getColumnValue = <T>(item: T, column: TDataKitColumn<T>): unknown => {
     const { accessor } = column;
     return typeof accessor === 'function' ? accessor(item) : item[accessor as keyof T];
};

/**
 * Get the sort value for a column
 */
export const getSortValue = (sorts: TSortEntry[], path: string): 1 | -1 | null => {
     const sort = sorts.find((s) => s.path === path);
     return sort?.value ?? null;
};

/**
 * Get the next sort value in the cycle: null -> 1 -> -1 -> null
 */
export const getNextSortValue = (current: 1 | -1 | null): 1 | -1 | null => {
     if (current === null) return 1;
     if (current === 1) return -1;
     return null;
};


/**
 * Format a number with commas
 */
export const formatNumber = (num: number): string => num.toLocaleString();


/**
 * Debounce a function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
     fn: T,
     delay: number
): ((...args: Parameters<T>) => void) => {
     let timeoutId: ReturnType<typeof setTimeout>;
     return (...args: Parameters<T>) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
     };
};

/**
 * Throttle a function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
     fn: T,
     limit: number
): ((...args: Parameters<T>) => void) => {
     let inThrottle = false;
     return (...args: Parameters<T>) => {
          if (!inThrottle) {
               fn(...args);
               inThrottle = true;
               setTimeout(() => { inThrottle = false; }, limit);
          }
     };
};


/**
 * Create a stable object key from sort entries
 */
export const sortEntriesToKey = (sorts: TSortEntry[]): string =>
     sorts.map((s) => `${s.path}:${s.value}`).join(',');

/**
 * Parse a sort key back to sort entries
 */
export const keyToSortEntries = (key: string): TSortEntry[] => {
     if (!key) return [];
     return key.split(',').map((part) => {
          const [path, value] = part.split(':');
          return { path: path ?? '', value: parseInt(value ?? '1', 10) as 1 | -1 };
     });
};


/**
 * Parse URL search params into tabler state
 */
export const parseUrlParams = (search: string): {
     page?: number;
     limit?: number;
     sorts?: TSortEntry[];
     filter?: Record<string, unknown>;
     query?: Record<string, unknown>;
} => {
     const params = new URLSearchParams(search);
     const state: ReturnType<typeof parseUrlParams> = {};

     // ** Page
     const page = params.get('page');
     if (page) state.page = parseInt(page, 10);

     // ** Limit
     const limit = params.get('limit');
     if (limit) state.limit = parseInt(limit, 10);

     // ** Sorts
     const sort = params.get('sort');
     if (sort) state.sorts = keyToSortEntries(sort);

     // ** Filter (f_key) and Query (q_key)
     const filter: Record<string, unknown> = {};
     const query: Record<string, unknown> = {};

     params.forEach((value, key) => {
          if (key.startsWith('f_')) filter[key.slice(2)] = value;
          else if (key.startsWith('q_')) query[key.slice(2)] = value;
     });

     if (Object.keys(filter).length > 0) state.filter = filter;
     if (Object.keys(query).length > 0) state.query = query;

     return state;
};

/**
 * Convert tabler state to URL search params
 */
export const stateToUrlParams = (state: {
     page?: number;
     limit?: number;
     sorts?: TSortEntry[];
     filter?: Record<string, unknown>;
     query?: Record<string, unknown>;
}): URLSearchParams => {
     const params = new URLSearchParams();

     if (state.page && state.page > 1) params.set('page', state.page.toString());
     if (state.limit) params.set('limit', state.limit.toString());
     if (state.sorts && state.sorts.length > 0) params.set('sort', sortEntriesToKey(state.sorts));

     if (state.filter) {
          Object.entries(state.filter).forEach(([key, value]) => {
               if (value !== undefined && value !== null && value !== '') {
                    params.set(`f_${key}`, String(value));
               }
          });
     }

     if (state.query) {
          Object.entries(state.query).forEach(([key, value]) => {
               if (value !== undefined && value !== null && value !== '') {
                    params.set(`q_${key}`, String(value));
               }
          });
     }

     return params;
};
