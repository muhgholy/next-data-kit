/**
 * next-data-kit - Server Action Types
 *
 * Types for the server action and data kit operations.
 */

import type { Model } from 'mongoose';
import type { TDataKitInput, TDataKitAdapter, TFilterCustomConfigWithFilter, TSortOptions } from '../next-data-kit';
import type { TMongoFilterQuery } from './database/mongo';

/**
 * Extract document type from a Mongoose Model.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TExtractDocType<M> = M extends Model<infer TRawDocType, any, any, any, any, any> ? TRawDocType : never;

/**
 * Base options shared by both mongoose and adapter versions
 */
export type TBaseOptions<TDoc, R> = {
    input: TDataKitInput<TDoc>;
    item: (item: TDoc) => Promise<R> | R;
    filterAllowed?: string[];
    maxLimit?: number;
    queryAllowed?: (keyof TDoc | string)[];
    sortAllowed?: (keyof TDoc | string)[];
};

/**
 * Options when using a Mongoose model
 */
export type TMongooseOptions<M, TDoc, R> = TBaseOptions<TDoc, R> & {
    model: M;
    adapter?: never;
    filter?: ((filterInput?: Record<string, unknown>) => TMongoFilterQuery<TDoc>) | TMongoFilterQuery<TDoc>;
    filterCustom?: TFilterCustomConfigWithFilter<TDoc, TMongoFilterQuery<TDoc>>;
    defaultSort?: TSortOptions<TDoc>;
};

/**
 * Options when using a custom adapter
 */
export type TAdapterOptions<TDoc, R> = TBaseOptions<TDoc, R> & {
    adapter: TDataKitAdapter<TDoc>;
    model?: never;
    filter?: never;
    filterCustom?: TFilterCustomConfigWithFilter<TDoc, unknown>;
    defaultSort?: never;
};
