/**
 * next-data-kit - Server Action
 *
 * The main server-side function for handling table data fetching
 * with pagination, filtering, and sorting.
 */

import { mongooseAdapter } from './adapters/mongoose';
import type {
     TDataKitInput,
     TDataKitResult,
     TDataKitAdapter,
     TMongoModel,
     TMongoFilterQuery,
     TFilterCustomConfigWithFilter,
     TSortOptions,
} from '../types';

// ** ============================================================================
// ** Types
// ** ============================================================================

export type TDataKitServerActionOptions<T, R> = {
     // ** The input from the client
     input: TDataKitInput<T>;
     // ** The database adapter or Mongoose model
     adapter: TDataKitAdapter<T> | TMongoModel<T>;
     // ** Function to transform each item before returning
     item: (item: T) => Promise<R> | R;
     // ** Custom filter function
     filter?: (filterInput?: Record<string, unknown>) => TMongoFilterQuery<T>;
     // ** Custom filter configuration
     filterCustom?: TFilterCustomConfigWithFilter<T, TMongoFilterQuery<T>>;
     // ** Default sort options
     defaultSort?: TSortOptions<T>;
     // ** Maximum limit per page (default: 100)
     maxLimit?: number;
     // ** Whitelist of allowed filter fields
     filterAllowed?: string[];
     // ** Whitelist of allowed query fields
     queryAllowed?: string[];
};

// ** ============================================================================
// ** Server Action
// ** ============================================================================

export const dataKitServerAction = async <T, R>(
     props: Readonly<TDataKitServerActionOptions<T, R>>
): Promise<TDataKitResult<R>> => {
     // ** Deconstruct Props
     const { input, adapter, item, maxLimit = 100, filterAllowed, queryAllowed } = props;

     // ** Whitelist filtering for security (if configured)
     // ** We do this here instead of in the adapter to keep the adapter simple and "dumb"

     // ** Check Query
     if (input.query) {
          const safeQuery: Record<string, unknown> = {};
          Object.keys(input.query).forEach((key) => {
               if (queryAllowed && !queryAllowed.includes(key)) {
                    throw new Error(`[Security] Query field '${key}' is not allowed.`);
               }
               // ** Enforce primitive values only (Anti-NoSQL Injection)
               const val = input.query![key];
               if (val !== null && typeof val === 'object') {
                    throw new Error(`[Security] Query value for '${key}' must be a primitive.`);
               }
               safeQuery[key] = val;
          });
          input.query = safeQuery;
     }

     // ** Check Filter
     if (input.filter) {
          const safeFilter: Record<string, unknown> = {};
          Object.keys(input.filter).forEach((key) => {
               if (filterAllowed && !filterAllowed.includes(key)) {
                    throw new Error(`[Security] Filter field '${key}' is not allowed.`);
               }
               // ** Enforce primitive values only (Anti-NoSQL Injection)
               const val = input.filter![key];
               if (val !== null && typeof val === 'object') {
                    throw new Error(`[Security] Filter value for '${key}' must be a primitive.`);
               }
               safeFilter[key] = val;
          });
          input.filter = safeFilter;
     }

     // ** Determine adapter
     const finalAdapter: TDataKitAdapter<T> = typeof adapter === 'function'
          ? adapter
          : mongooseAdapter(adapter as TMongoModel<T>, props);

     // ** Handle action
     switch (input.action ?? 'FETCH') {
          case 'FETCH': {
               if (!input.limit || !input.page) {
                    throw new Error('Invalid input: missing limit or page');
               }

               const limit = Math.min(input.limit, maxLimit);
               const skip = limit * (input.page - 1);

               // ** Fetch data using adapter
               const { items, total } = await finalAdapter({
                    filter: input.filter ?? {},
                    sorts: input.sorts ?? [],
                    limit,
                    page: input.page,
                    skip,
                    input,
               });

               // ** Process each item through the item mapper function
               const processedItems = await Promise.all(items.map((dataItem) => item(dataItem)));

               return {
                    type: 'ITEMS',
                    items: processedItems,
                    documentTotal: total,
               };
          }

          default:
               throw new Error(`Unsupported action: ${(input as { action?: string }).action}`);
     }
};
