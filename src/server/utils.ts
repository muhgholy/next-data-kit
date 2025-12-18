/**
 * next-data-kit - Server Utilities
 */

import type { TMongoFilterQuery, TSortEntry, TPaginationInfo } from '../types';

/**
 * Check if a value is provided (not undefined, null, or empty string)
 */
export const isProvided = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

/**
 * Get a nested value from an object by path (e.g., 'user.name')
 */
export const getValueByPath = (obj: unknown, path: string): unknown => {
	if (!path) return undefined;
	const parts = path.split('.');
	let current: unknown = obj;
	for (const part of parts) {
		if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
			current = (current as Record<string, unknown>)[part];
		} else {
			return undefined;
		}
	}
	return current;
};

/**
 * Check if a value matches exactly (supports array inclusion)
 */
export const matchesExact = (rowValue: unknown, needle: unknown): boolean => {
	if (Array.isArray(needle)) return needle.includes(rowValue as never);
	return rowValue === needle;
};

/**
 * Check if a value matches a regex-like pattern (case-insensitive)
 */
export const matchesRegexLike = (rowValue: unknown, needle: unknown): boolean => {
	if (!isProvided(needle)) return true;
	if (rowValue === undefined || rowValue === null) return false;
	const hay = String(rowValue);

	if (needle instanceof RegExp) return needle.test(hay);
	const n = String(needle);
	return hay.toLowerCase().includes(n.toLowerCase());
};

/**
 * Compare two values for sorting
 */
export const compareValues = (a: unknown, b: unknown): number => {
	if (a === b) return 0;
	if (a === undefined || a === null) return -1;
	if (b === undefined || b === null) return 1;

	if (typeof a === 'number' && typeof b === 'number') return a - b;
	if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : 1;

	const as = String(a);
	const bs = String(b);
	return as.localeCompare(bs);
};

/**
 * Normalize and validate sort entries
 */
export const normalizeSorts = (sorts: TSortEntry[] | undefined): TSortEntry[] => (Array.isArray(sorts) ? sorts.filter(s => !!s?.path && (s.value === 1 || s.value === -1)) : []);

/**
 * Check if a key is safe (not a prototype pollution key)
 */
export const isSafeKey = (key: string): boolean => {
	const unsafeKeys = ['__proto__', 'constructor', 'prototype'];
	return !unsafeKeys.includes(key);
};

/**
 * Helper to escape regex special characters in a string
 */
export const escapeRegex = (str: string): string => {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Create a search filter for multiple fields
 *
 * @example
 * ```typescript
 * filterCustom: {
 *   search: createSearchFilter(['name', 'email', 'phone'])
 * }
 * ```
 */
export const createSearchFilter = <T>(fields: (keyof T | string)[]): ((value: unknown) => TMongoFilterQuery<T>) => {
	return (value: unknown): TMongoFilterQuery<T> => {
		if (!value || typeof value !== 'string') {
			return {} as TMongoFilterQuery<T>;
		}

		const escapedValue = escapeRegex(value);
		return {
			$or: fields.map(field => ({
				[field]: { $regex: escapedValue, $options: 'i' },
			})),
		} as TMongoFilterQuery<T>;
	};
};
/**
 * Calculate pagination info from page, limit, and total
 */
export const calculatePagination = (page: number, limit: number, total: number): TPaginationInfo => ({
	currentPage: page,
	totalPages: Math.ceil(total / limit),
	totalItems: total,
	itemsPerPage: limit,
	hasNextPage: page * limit < total,
	hasPrevPage: page > 1,
});
