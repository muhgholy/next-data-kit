/**
 * next-data-kit - Server Utilities
 */

import type { TMongoFilterQuery } from '../types';

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
export const createSearchFilter = <T>(
     fields: (keyof T | string)[]
): (value: unknown) => TMongoFilterQuery<T> => {
     return (value: unknown): TMongoFilterQuery<T> => {
          if (!value || typeof value !== 'string') {
               return {} as TMongoFilterQuery<T>;
          }

          const escapedValue = escapeRegex(value);
          return {
               $or: fields.map((field) => ({
                    [field]: { $regex: escapedValue, $options: 'i' },
               })),
          } as TMongoFilterQuery<T>;
     };
};
