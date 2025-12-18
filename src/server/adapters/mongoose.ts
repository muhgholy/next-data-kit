/**
 * next-data-kit - Mongoose Adapter
 *
 * Database adapter for Mongoose/MongoDB.
 */

import type {
     TMongoModel,
     TMongoFilterQuery,
     TSortOrder,
     TSortOptions,
     TFilterCustomConfigWithFilter,
     TDataKitAdapter,
     TExtractDocType,
} from '../../types';

// ** ============================================================================
// ** Helpers
// ** ============================================================================

const isProvided = (value: unknown): boolean =>
     value !== undefined && value !== null && value !== '';

// ** ============================================================================
// ** Adapter
// ** ============================================================================

export const mongooseAdapter = <
     M extends TMongoModel<unknown, object>,
     DocType = TExtractDocType<M>
>(
     model: M,
     options: Readonly<{
          filter?: (filterInput?: Record<string, unknown>) => TMongoFilterQuery<DocType>;
          filterCustom?: TFilterCustomConfigWithFilter<DocType, TMongoFilterQuery<DocType>>;
          defaultSort?: TSortOptions<DocType>;
     }> = {}
): TDataKitAdapter<DocType> => {
     // ** Deconstruct options
     const { filter: customFilterFn, filterCustom, defaultSort = { _id: -1 } as TSortOptions<DocType> } = options;

     return async ({ filter, sorts, limit, skip, input }) => {
          // ** Normalize sort
          let sortOption: Record<string, TSortOrder>;

          if (input.sort && Object.keys(input.sort).length > 0) {
               sortOption = input.sort as Record<string, TSortOrder>;
          } else if (sorts && sorts.length > 0) {
               sortOption = sorts.reduce<Record<string, TSortOrder>>((acc, s) => {
                    if (s?.path && (s.value === 1 || s.value === -1)) {
                         acc[s.path] = s.value;
                    }
                    return acc;
               }, {});
          } else {
               sortOption = defaultSort as Record<string, TSortOrder>;
          }

          // ** Construct filter query
          let filterQuery: TMongoFilterQuery<DocType> = {};

          // ** Query params (exact match)
          if (input.query) {
               Object.entries(input.query).forEach(([key, value]) => {
                    if (isProvided(value)) {
                         (filterQuery as Record<string, unknown>)[key] = value;
                    }
               });
          }

          // ** Custom filter function
          if (customFilterFn) {
               const customQuery = customFilterFn(filter);
               filterQuery = { ...filterQuery, ...customQuery };
          }

          // ** User defined filters
          if (filter && !customFilterFn) {
               if (input.filterConfig) {
                    Object.entries(filter).forEach(([key, value]) => {
                         if (isProvided(value) && input.filterConfig?.[key]) {
                              const config = input.filterConfig[key];
                              const fieldName = config?.field ?? key;

                              if (config?.type === 'regex') {
                                   (filterQuery as Record<string, unknown>)[fieldName] = {
                                        $regex: value,
                                        $options: 'i',
                                   };
                              } else if (config?.type === 'exact') {
                                   (filterQuery as Record<string, unknown>)[fieldName] = value;
                              }
                         }
                    });
               } else {
                    // ** Default automatic filtering
                    Object.entries(filter).forEach(([key, value]) => {
                         if (isProvided(value)) {
                              if (typeof value === 'string') {
                                   (filterQuery as Record<string, unknown>)[key] = {
                                        $regex: value,
                                        $options: 'i',
                                   };
                              } else {
                                   (filterQuery as Record<string, unknown>)[key] = value;
                              }
                         }
                    });
               }
          }

          // ** Custom filter logic (filterCustom)
          if (filterCustom && filter) {
               Object.entries(filter).forEach(([key, value]) => {
                    if (isProvided(value) && filterCustom[key]) {
                         const customFilter = filterCustom[key]!(value);
                         filterQuery = { ...filterQuery, ...customFilter };
                    }
               });
          }

          // ** Execute queries
          const total = await model.countDocuments(filterQuery as TMongoFilterQuery<unknown>);
          const items = await model
               .find(filterQuery as TMongoFilterQuery<unknown>)
               .sort(sortOption)
               .limit(limit)
               .skip(skip) as unknown as DocType[];

          return { items, total };
     };
};
