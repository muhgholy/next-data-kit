/**
 * next-data-kit - Server Exports
 *
 * Server-side utilities for next-data-kit.
 */

// Server action
export { dataKitServerAction, type TExtractDocType } from './action';

// Adapters
export { mongooseAdapter } from './adapters/mongoose';
export { adapterMemory } from './adapters/memory';

// Utils
export { escapeRegex, createSearchFilter, isProvided, isSafeKey } from './utils';
export { dataKitSchemaZod, type TDataKitSchemaZod } from './schema';

// Re-export types commonly used on server
export type { TSortOrder, TSortOptions, TDataKitInput, TDataKitResult, TFilterCustomConfig, TFilterCustomConfigWithFilter, TFilterConfig, TDataKitAdapter, TMongoFilterQuery, TMongoModel } from '../types';
