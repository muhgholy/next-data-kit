/**
 * next-data-kit - Server Exports
 *
 * Server-side utilities for next-data-kit.
 */

// Server action
export { dataKitServerAction, type TDataKitServerActionOptions } from './action';

// Adapters
export { mongooseAdapter } from './adapters/mongoose';
export { adapterMemory } from './adapters/memory';

// Utils
export { escapeRegex, createSearchFilter } from './utils';

// Re-export types commonly used on server
export type { TModel, TExtractDocType, THydratedDocument, TSortOrder, TSortOptions, TDataKitInput, TDataKitResult, TFilterCustomConfig, TFilterCustomConfigWithFilter, TFilterConfig, TDataKitAdapter } from '../types';

export type { TMongoFilterQuery, TMongoFilterOperators, TMongoRootFilterOperators, TObjectId, TMongoDocument, TMongoHydratedDocument, TMongoModel } from '../types';
