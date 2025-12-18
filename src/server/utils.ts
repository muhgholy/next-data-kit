/**
 * next-data-kit - Server Utilities
 */

import type { TMongoFilterQuery } from '../types';

/**
 * Check if a value is provided (not undefined, null, or empty string)
 */
export const isProvided = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

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
