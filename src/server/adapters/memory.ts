/**
 * next-data-kit - Memory Adapter
 *
 * In-memory adapter for demos, tests, and local playgrounds.
 * Implements the React Data Kit adapter contract over an array dataset.
 */

import type { TFilterConfig, TSortEntry, TDataKitAdapter } from '../../types';

const isProvided = (value: unknown): boolean =>
     value !== undefined && value !== null && value !== '';

const getValueByPath = (obj: unknown, path: string): unknown => {
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

const matchesExact = (rowValue: unknown, needle: unknown): boolean => {
     if (Array.isArray(needle)) return needle.includes(rowValue as never);
     return rowValue === needle;
};

const matchesRegexLike = (rowValue: unknown, needle: unknown): boolean => {
     if (!isProvided(needle)) return true;
     if (rowValue === undefined || rowValue === null) return false;
     const hay = String(rowValue);

     if (needle instanceof RegExp) return needle.test(hay);
     const n = String(needle);
     return hay.toLowerCase().includes(n.toLowerCase());
};

const compareValues = (a: unknown, b: unknown): number => {
     if (a === b) return 0;
     if (a === undefined || a === null) return -1;
     if (b === undefined || b === null) return 1;

     if (typeof a === 'number' && typeof b === 'number') return a - b;
     if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : 1;

     const as = String(a);
     const bs = String(b);
     return as.localeCompare(bs);
};

const normalizeSorts = (sorts: TSortEntry[] | undefined): TSortEntry[] =>
     Array.isArray(sorts) ? sorts.filter((s) => !!s?.path && (s.value === 1 || s.value === -1)) : [];

/**
 * Creates an adapter that pages/filters/sorts an in-memory dataset.
 */
export const adapterMemory = <T extends Record<string, unknown>>(
     dataset: ReadonlyArray<T>,
     options: Readonly<{
          /** default behavior for filter keys not present in filterConfig */
          defaultFilterType?: 'regex' | 'exact';
     }> = {}
): TDataKitAdapter<T> => {
     const { defaultFilterType = 'exact' } = options;

     return async ({ filter, sorts, limit, skip, input }) => {
          const filterConfig: TFilterConfig | undefined = input.filterConfig;
          const query = input.query ?? {};

          // 1) Apply query (exact match)
          let rows = dataset.filter((row) => {
               for (const [key, value] of Object.entries(query)) {
                    if (!isProvided(value)) continue;
                    const rowValue = getValueByPath(row, key);
                    if (!matchesExact(rowValue, value)) return false;
               }
               return true;
          });

          // 2) Apply filter (via filterConfig when present)
          const effectiveFilter = filter ?? {};
          rows = rows.filter((row) => {
               for (const [key, value] of Object.entries(effectiveFilter)) {
                    if (!isProvided(value)) continue;

                    const config = filterConfig?.[key];
                    const field = config?.field ?? key;
                    const rowValue = getValueByPath(row, field);

                    const type = config?.type ?? defaultFilterType;
                    if (type === 'regex') {
                         if (!matchesRegexLike(rowValue, value)) return false;
                    } else {
                         if (!matchesExact(rowValue, value)) return false;
                    }
               }
               return true;
          });

          // 3) Sort
          const normalizedSorts = normalizeSorts(sorts);
          if (normalizedSorts.length > 0) {
               rows = [...rows].sort((ra, rb) => {
                    for (const s of normalizedSorts) {
                         const av = getValueByPath(ra, s.path);
                         const bv = getValueByPath(rb, s.path);
                         const cmp = compareValues(av, bv);
                         if (cmp !== 0) return s.value === 1 ? cmp : -cmp;
                    }
                    return 0;
               });
          }

          const total = rows.length;
          const items = rows.slice(skip, skip + limit);
          return { items, total };
     };
};
