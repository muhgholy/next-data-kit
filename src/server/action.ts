/**
 * next-data-kit - Server Action
 *
 * The main server-side function for handling table data fetching
 * with pagination, filtering, and sorting.
 */

import { mongooseAdapter } from './adapters/mongoose';
import type { Model } from 'mongoose';
import type { TDataKitInput, TDataKitResult, TDataKitAdapter, TMongoModel, TExtractDocType, TMongooseOptions, TAdapterOptions } from '../types';

/**
 * Core execution logic shared by both overloads
 */
async function executeDataKit<TDoc, R>(input: TDataKitInput<TDoc>, adapter: TDataKitAdapter<TDoc>, item: (item: TDoc) => Promise<R> | R, maxLimit: number, filterAllowed?: string[], queryAllowed?: (keyof TDoc | string)[]): Promise<TDataKitResult<R>> {
	// Check Query
	if (input.query) {
		const safeQuery: Record<string, string | number | boolean> = {};
		Object.keys(input.query).forEach(key => {
			if (queryAllowed && !queryAllowed.includes(key)) {
				throw new Error(`[Security] Query field '${key}' is not allowed.`);
			}
			const val = input.query![key];
			if (val !== null && typeof val === 'object') {
				throw new Error(`[Security] Query value for '${key}' must be a primitive.`);
			}
			if (val !== undefined) {
				safeQuery[key] = val;
			}
		});
		input.query = safeQuery;
	}

	// Check Filter
	if (input.filter) {
		const safeFilter: Record<string, unknown> = {};
		Object.keys(input.filter).forEach(key => {
			if (filterAllowed && !filterAllowed.includes(key)) {
				throw new Error(`[Security] Filter field '${key}' is not allowed.`);
			}
			const val = input.filter![key];
			if (val !== null && typeof val === 'object') {
				throw new Error(`[Security] Filter value for '${key}' must be a primitive.`);
			}
			safeFilter[key] = val;
		});
		input.filter = safeFilter;
	}

	// Handle action
	switch (input.action ?? 'FETCH') {
		case 'FETCH': {
			if (!input.limit || !input.page) {
				throw new Error('Invalid input: missing limit or page');
			}

			const limit = Math.min(input.limit, maxLimit);
			const skip = limit * (input.page - 1);

			const { items, total } = await adapter({
				filter: input.filter ?? {},
				sorts: input.sorts ?? [],
				limit,
				page: input.page,
				skip,
				input,
			});

			const processedItems = await Promise.all(items.map(dataItem => item(dataItem)));

			return {
				type: 'ITEMS',
				items: processedItems,
				documentTotal: total,
			};
		}

		default:
			throw new Error(`Unsupported action: ${(input as { action?: string }).action}`);
	}
}

/**
 * Server action with Mongoose model (auto-infers document type)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dataKitServerAction<M extends Model<any>, R = unknown>(props: Readonly<TMongooseOptions<M, TExtractDocType<M>, R>>): Promise<TDataKitResult<R>>;

/**
 * Server action with custom adapter
 */
export async function dataKitServerAction<TDoc, R = unknown>(props: Readonly<TAdapterOptions<TDoc, R>>): Promise<TDataKitResult<R>>;

/**
 * Implementation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dataKitServerAction<M extends Model<any>, TDoc = any, R = unknown>(props: Readonly<TMongooseOptions<M, TDoc, R> | TAdapterOptions<TDoc, R>>): Promise<TDataKitResult<R>> {
	const { input, item, maxLimit = 100, queryAllowed, filterAllowed: explicitFilterAllowed } = props;

	// Determine filterAllowed
	const filterCustom = 'filterCustom' in props ? props.filterCustom : undefined;
	const filterAllowed = explicitFilterAllowed ?? (filterCustom ? Object.keys(filterCustom) : undefined);

	// Determine adapter
	let finalAdapter: TDataKitAdapter<TDoc>;

	if ('adapter' in props && props.adapter) {
		finalAdapter = props.adapter;
	} else if ('model' in props && props.model) {
		const model = props.model as unknown as TMongoModel<TDoc>;
		finalAdapter = mongooseAdapter(model, {
			filter: props.filter,
			filterCustom: props.filterCustom,
			defaultSort: props.defaultSort,
		}) as TDataKitAdapter<TDoc>;
	} else {
		throw new Error('Either model or adapter must be provided');
	}

	return executeDataKit(input, finalAdapter, item, maxLimit, filterAllowed, queryAllowed);
}
