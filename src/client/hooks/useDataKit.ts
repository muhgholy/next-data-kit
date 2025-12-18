/**
 * next-data-kit - useDataKit Hook
 *
 * React hook for managing next-data-kit state and actions.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TDataKitInput, TDataKitResult, TDataKitControllerOptions, TSortEntry, TUseDataKitReturn } from '../../types';
import { parseUrlParams, stateToUrlParams } from '../utils';

// ** ============================================================================
// ** Hook
// ** ============================================================================

export const useDataKit = <T = unknown, R = unknown>(props: Readonly<TDataKitControllerOptions<T, R>>): TUseDataKitReturn<T, R> => {
	// ** Deconstruct Props
	const { initial = {}, state: stateMode = 'memory', filterConfig, action, onSuccess, onError, autoFetch = true, debounce: debounceDelay = 300 } = props;

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

	// ** Refs for props to prevent infinite loops and stale closures
	const actionRef = useRef(action);
	const onSuccessRef = useRef(onSuccess);
	const onErrorRef = useRef(onError);
	const filterConfigRef = useRef(filterConfig);

	// ** Update refs on every render
	actionRef.current = action;
	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;
	filterConfigRef.current = filterConfig;

	// ** Get current input
	const getInput = useCallback((): TDataKitInput<T> => {
		const input: TDataKitInput<T> = {
			action: 'FETCH',
			page,
			limit,
			sorts,
			filter: debouncedFilter,
			query: query as Record<string, string | number | boolean>,
		};

		if (filterConfigRef.current) {
			input.filterConfig = filterConfigRef.current;
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

	const deleteItemAt = useCallback((index: number) => {
		setItems(prev => prev.filter((_, i) => i !== index));
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

	// ** Sync with URL if stateMode is 'search-params'
	useEffect(() => {
		if (stateMode !== 'search-params' || typeof window === 'undefined') return;

		// ** Initial load from URL
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

		// ** Listen for popstate (back/forward)
		const handlePopState = () => {
			const newUrlState = parseUrlParams(window.location.search);

			setPageState(newUrlState.page ?? initialPage);
			setLimitState(newUrlState.limit ?? initialLimit);
			setSortsState(newUrlState.sorts ?? initialSorts);
			setFilterState({ ...initialFilter, ...newUrlState.filter });
			setDebouncedFilter({ ...initialFilter, ...newUrlState.filter });
			setQueryState({ ...initialQuery, ...newUrlState.query });
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, [stateMode, initialPage, initialLimit, initialSorts, initialFilter, initialQuery]);

	// ** Update URL when state changes
	useEffect(() => {
		if (stateMode !== 'search-params' || typeof window === 'undefined') return;

		const params = stateToUrlParams({ page, limit, sorts, filter, query });
		const newSearch = params.toString();
		const currentSearch = window.location.search.slice(1);

		if (newSearch !== currentSearch) {
			const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
			window.history.pushState(null, '', newUrl);
		}
	}, [page, limit, sorts, filter, query, stateMode]);

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

	return {
		page,
		limit,
		sorts,
		filter,
		filterConfig,
		query,
		items,
		total,
		state: { isLoading, error },
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
			deleteItemAt,
			itemPush,
			deleteBulk,
		},
	};
};

export type { TDataKitControllerOptions };
