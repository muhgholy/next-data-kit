/**
 * next-data-kit - useDataKit Hook
 *
 * React hook for managing next-data-kit state and actions.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TDataKitInput, TDataKitResult, TUseDataKitOptions, TSortEntry, TUseDataKitReturn, TFilterConfig } from '../../types';
import { parseUrlParams, stateToUrlParams } from '../utils';

export const useDataKit = <T = unknown, R = unknown>(props: Readonly<TUseDataKitOptions<T, R>>): TUseDataKitReturn<T, R> => {
	// ** Deconstruct Props
	const { initial = {}, memory: memoryMode = 'memory', filters, action, onSuccess, onError, autoFetch = true, debounce: debounceDelay = 300 } = props;

	const { page: initialPage = 1, limit: initialLimit = 10, sorts: initialSorts = [], filter: initialFilter = {}, query: initialQuery = {} } = initial;

	// ** State
	const [page, setPageState] = useState(initialPage);
	const [limit, setLimitState] = useState(initialLimit);
	const [sorts, setSortsState] = useState<TSortEntry[]>(initialSorts);
	const [filter, setFilterState] = useState<Record<string, unknown>>(initialFilter);
	const [debouncedFilter, setDebouncedFilter] = useState<Record<string, unknown>>(initialFilter);
	const [query, setQueryState] = useState<Record<string, unknown>>(initialQuery);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [items, setItems] = useState<R[]>([]);
	const [total, setTotal] = useState(0);

	// ** Refs
	const mounted = useRef(true);
	const fetchIdRef = useRef(0);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasInitializedFromUrl = useRef(false);
	const isInitialMount = useRef(true);

	// ** Refs for initial values to prevent object reference changes from triggering effects
	const initialPageRef = useRef(initialPage);
	const initialLimitRef = useRef(initialLimit);
	const initialSortsRef = useRef(initialSorts);
	const initialFilterRef = useRef(initialFilter);
	const initialQueryRef = useRef(initialQuery);

	// ** Refs for props to prevent infinite loops and stale closures
	const actionRef = useRef(action);
	const onSuccessRef = useRef(onSuccess);
	const onErrorRef = useRef(onError);
	const filtersRef = useRef(filters);

	// ** Update refs on every render
	actionRef.current = action;
	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;
	filtersRef.current = filters;

	// ** Get current input
	const getInput = useCallback((): TDataKitInput<T> => {
		const input: TDataKitInput<T> = {
			action: 'FETCH',
			page,
			limit,
			sorts,
			filter: debouncedFilter as Record<string, string | number | boolean | null>,
			query: query as Record<string, string | number | boolean>,
		};

		if (filtersRef.current) {
			input.filterConfig = filtersRef.current.reduce<TFilterConfig>((acc, f) => {
				if (f.configuration) acc[f.id] = f.configuration;
				return acc;
			}, {});
		}

		return input;
	}, [page, limit, sorts, debouncedFilter, query]);

	// ** Fetch data
	const fetchData = useCallback(async () => {
		const fetchId = ++fetchIdRef.current;
		setIsLoading(true);
		setError(null);

		try {
			const input = getInput();
			const result = (await actionRef.current(input)) as TDataKitResult<R>;

			// ** Check if this is still the latest fetch
			if (fetchId !== fetchIdRef.current || !mounted.current) return;

			setItems(result.items);
			setTotal(result.documentTotal);
			onSuccessRef.current?.(result);
		} catch (err) {
			if (fetchId !== fetchIdRef.current || !mounted.current) return;

			const fetchError = err instanceof Error ? err : new Error(String(err));
			setError(fetchError);
			onErrorRef.current?.(fetchError);
		} finally {
			if (fetchId === fetchIdRef.current && mounted.current) {
				setIsLoading(false);
			}
		}
	}, [getInput]);

	// ** Debounce filter changes
	useEffect(() => {
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

		debounceTimerRef.current = setTimeout(() => {
			setDebouncedFilter(filter);
		}, debounceDelay);

		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		};
	}, [filter, debounceDelay]);

	// ** Actions
	const setPage = useCallback((newPage: number) => setPageState(newPage), []);

	const setLimit = useCallback((newLimit: number) => {
		setLimitState(newLimit);
		setPageState(1);
	}, []);

	const setSort = useCallback((path: string, value: 1 | -1 | null, append = false) => {
		setSortsState(prev => {
			if (value === null) return prev.filter(s => s.path !== path);
			if (!append) return [{ path, value }];

			const existing = prev.find(s => s.path === path);
			if (existing) return prev.map(s => (s.path === path ? { ...s, value } : s));
			return [...prev, { path, value }];
		});
	}, []);

	const setSorts = useCallback((newSorts: TSortEntry[]) => setSortsState(newSorts), []);

	const setFilter = useCallback((key: string, value: unknown) => {
		setFilterState(prev => ({ ...prev, [key]: value }));
		setPageState(1);
	}, []);

	const setFilters = useCallback((filters: Record<string, unknown>) => {
		setFilterState(prev => ({ ...prev, ...filters }));
		setPageState(1);
	}, []);

	const clearFilters = useCallback(() => {
		setFilterState({});
		setPageState(1);
	}, []);

	const setQuery = useCallback((key: string, value: unknown) => {
		setQueryState(prev => ({ ...prev, [key]: value }));
		setPageState(1);
	}, []);

	const refresh = useCallback(async () => {
		await fetchData();
	}, [fetchData]);

	// ** Item mutations (optional helpers)
	const setItemsAction = useCallback((nextItems: R[]) => {
		setItems(nextItems);
	}, []);

	const setItemAt = useCallback((index: number, item: R) => {
		setItems(prev => {
			if (index < 0 || index >= prev.length) return prev;
			const next = [...prev];
			next[index] = item;
			return next;
		});
	}, []);

	const itemUpdate = useCallback((props: { index: number; data: Partial<R> } | { id: string | number; data: Partial<R> }) => {
		setItems(prev => {
			if ('index' in props) {
				// Update by index
				const { index, data } = props;
				if (index < 0 || index >= prev.length) return prev;
				const next = [...prev];
				next[index] = { ...next[index], ...data } as R;
				return next;
			} else {
				// Update by id
				const { id, data } = props;
				const index = prev.findIndex((item) => {
					const itemWithId = item as R & { id?: string | number };
					return itemWithId.id === id;
				});
				if (index === -1) return prev;
				const next = [...prev];
				next[index] = { ...next[index], ...data } as R;
				return next;
			}
		});
	}, []);

	const deleteItemAt = useCallback((index: number) => {
		setItems(prev => prev.filter((_, i) => i !== index));
	}, []);

	const itemDelete = useCallback((props: { index: number } | { id: string | number }) => {
		setItems(prev => {
			if ('index' in props) {
				// Delete by index
				const { index } = props;
				if (index < 0 || index >= prev.length) return prev;
				return prev.filter((_, i) => i !== index);
			} else {
				// Delete by id
				const { id } = props;
				return prev.filter((item) => {
					const itemWithId = item as R & { id?: string | number };
					return itemWithId.id !== id;
				});
			}
		});
	}, []);

	const itemPush = useCallback((item: R, position: 0 | 1 = 1) => {
		setItems(prev => (position === 0 ? [item, ...prev] : [...prev, item]));
	}, []);

	const deleteBulk = useCallback((itemsToDelete: R[]) => {
		if (itemsToDelete.length === 0) return;
		const toDelete = new Set(itemsToDelete);
		setItems(prev => prev.filter(it => !toDelete.has(it)));
	}, []);

	const reset = useCallback(() => {
		setPageState(initialPage);
		setLimitState(initialLimit);
		setSortsState(initialSorts);
		setFilterState(initialFilter);
		setDebouncedFilter(initialFilter);
		setQueryState(initialQuery);
	}, [initialPage, initialLimit, initialSorts, initialFilter, initialQuery]);

	// ** Sync with URL if memoryMode is 'search-params'
	useEffect(() => {
		if (memoryMode !== 'search-params' || typeof window === 'undefined') return;

		// ** Initial load from URL - only run once
		if (!hasInitializedFromUrl.current) {
			hasInitializedFromUrl.current = true;
			const urlState = parseUrlParams(window.location.search);

			if (Object.keys(urlState).length > 0) {
				if (urlState.page) setPageState(urlState.page);
				if (urlState.limit) setLimitState(urlState.limit);
				if (urlState.sorts) setSortsState(urlState.sorts);
				if (urlState.filter) {
					setFilterState(prev => ({ ...prev, ...urlState.filter }));
					setDebouncedFilter(prev => ({ ...prev, ...urlState.filter }));
				}
				if (urlState.query) setQueryState(prev => ({ ...prev, ...urlState.query }));
			}
		}

		// ** Listen for popstate (back/forward)
		const handlePopState = () => {
			const newUrlState = parseUrlParams(window.location.search);

			setPageState(newUrlState.page ?? initialPageRef.current);
			setLimitState(newUrlState.limit ?? initialLimitRef.current);
			setSortsState(newUrlState.sorts ?? initialSortsRef.current);
			setFilterState({ ...initialFilterRef.current, ...newUrlState.filter });
			setDebouncedFilter({ ...initialFilterRef.current, ...newUrlState.filter });
			setQueryState({ ...initialQueryRef.current, ...newUrlState.query });
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, [memoryMode]);

	// ** Update URL when state changes
	useEffect(() => {
		if (memoryMode !== 'search-params' || typeof window === 'undefined') return;

		// ** Skip URL update on initial mount to prevent loop with initial URL read
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		const params = stateToUrlParams({ page, limit, sorts, filter, query });
		const newSearch = params.toString();
		const currentSearch = window.location.search.slice(1);

		if (newSearch !== currentSearch) {
			const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
			window.history.pushState(null, '', newUrl);
		}
	}, [page, limit, sorts, filter, query, memoryMode]);

	// ** Auto-fetch on mount and when dependencies change
	useEffect(() => {
		if (autoFetch) fetchData();
	}, [page, limit, sorts, debouncedFilter, query, autoFetch, fetchData]);

	// ** Cleanup
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	// ** Calculate hasNextPage
	const hasNextPage = page * limit < total;

	return {
		page,
		limit,
		sorts,
		filter,
		filterConfig: filters?.reduce<TFilterConfig>((acc, f) => {
			if (f.configuration) acc[f.id] = f.configuration;
			return acc;
		}, {}),
		query,
		items,
		total,
		state: { isLoading, error, hasNextPage },
		actions: {
			setPage,
			setLimit,
			setSort,
			setSorts,
			setFilter,
			setFilters,
			clearFilters,
			setQuery,
			refresh,
			reset,
			getInput,
			setItems: setItemsAction,
			setItemAt,
			itemUpdate,
			deleteItemAt,
			itemDelete,
			itemPush,
			deleteBulk,
		},
	};
};

export type { TUseDataKitOptions };
