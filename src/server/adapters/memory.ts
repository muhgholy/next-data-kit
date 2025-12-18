/**
 * next-data-kit - Memory Adapter
 *
 * In-memory adapter for demos, tests, and local playgrounds.
 * Implements the React Data Kit adapter contract over an array dataset.
 */

import type { TFilterConfig, TDataKitAdapter } from '../../types';
import { isProvided, getValueByPath, matchesExact, matchesRegexLike, compareValues, normalizeSorts } from '../utils';

/**
 * Creates an adapter that pages/filters/sorts an in-memory dataset.
 */
export const adapterMemory = <T extends Record<string, unknown>>(
	dataset: ReadonlyArray<T>,
	options: Readonly<{
		/** default behavior for filter keys not present in filterConfig */
		defaultFilterType?: 'regex' | 'exact';
	}> = {},
): TDataKitAdapter<T> => {
	const { defaultFilterType = 'exact' } = options;

	return async ({ filter, sorts, limit, skip, input }) => {
		const filterConfig: TFilterConfig | undefined = input.filterConfig;
		const query = input.query ?? {};

		// 1) Apply query (exact match)
		let rows = dataset.filter(row => {
			for (const [key, value] of Object.entries(query)) {
				if (!isProvided(value)) continue;
				const rowValue = getValueByPath(row, key);
				if (!matchesExact(rowValue, value)) return false;
			}
			return true;
		});

		// 2) Apply filter (via filterConfig when present)
		const effectiveFilter = filter ?? {};
		rows = rows.filter(row => {
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
