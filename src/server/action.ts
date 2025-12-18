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
};

// ** ============================================================================
// ** Server Action
// ** ============================================================================

export const dataKitServerAction = async <T, R>(
     props: Readonly<TDataKitServerActionOptions<T, R>>
): Promise<TDataKitResult<R>> => {
     // ** Deconstruct Props
     const { input, adapter, item, filter, filterCustom, defaultSort } = props;

     // ** Determine adapter
     const finalAdapter: TDataKitAdapter<T> = typeof adapter === 'function'
          ? adapter
          : mongooseAdapter(adapter as TMongoModel<T>, {
               filter: filter as ((filterInput?: Record<string, unknown>) => TMongoFilterQuery<T>) | undefined,
               filterCustom: filterCustom as TFilterCustomConfigWithFilter<T, TMongoFilterQuery<T>> | undefined,
               defaultSort: defaultSort as TSortOptions<T> | undefined,
          });

     // ** Handle action
     switch (input.action ?? 'FETCH') {
          case 'FETCH': {
               if (!input.limit || !input.page) {
                    throw new Error('Invalid input: missing limit or page');
               }

               const limit = input.limit;
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
