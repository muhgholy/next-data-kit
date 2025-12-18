/**
 * next-data-kit - Database Types (Mongo)
 *
 * MongoDB-specific types.
 * Consolidated into a single file for simplicity.
 */

// ** ============================================================================
// ** Basic Types
// ** ============================================================================

/**
 * Sort order for database queries
 */
export type TSortOrder = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';

/**
 * ObjectId placeholder type - compatible with MongoDB ObjectId.
 */
export type TObjectId = {
     toString(): string;
     toHexString(): string;
     equals(otherId: TObjectId | string): boolean;
};

// ** ============================================================================
// ** Document Types
// ** ============================================================================

/**
 * Generic document type that represents a database document with an ID.
 */
export type TDocument<TId = unknown> = {
     _id: TId;
     createdAt?: Date;
     updatedAt?: Date;
};

/**
 * Mongo document base (includes common Mongo-only fields).
 */
export type TMongoDocument = TDocument<string | TObjectId> & {
     __v?: number;
};

/**
 * Hydrated document type - represents a document with methods.
 */
export type THydratedDocument<T, TId = unknown> = T & TDocument<TId>;

/**
 * Hydrated Mongo document.
 */
export type TMongoHydratedDocument<T> = T & TMongoDocument & {
     toObject(): T;
     toJSON(): T;
};

// ** ============================================================================
// ** Filter Operator Types
// ** ============================================================================

/**
 * Filter operators for individual fields (Mongo subset)
 */
export type TMongoFilterOperators<T> = {
     $eq?: T;
     $ne?: T;
     $gt?: T;
     $gte?: T;
     $lt?: T;
     $lte?: T;
     $in?: T[];
     $nin?: T[];
     $exists?: boolean;
     $all?: T extends Array<infer U> ? U[] : never;
     $elemMatch?: T extends Array<infer U> ? TMongoFilterQuery<U> : never;
     $size?: number;
     $regex?: string | RegExp;
     $options?: string;
     $type?: string | number;
};

/**
 * Mongo root operators.
 */
export type TMongoRootFilterOperators<T> = {
     $and?: TMongoFilterQuery<T>[];
     $or?: TMongoFilterQuery<T>[];
     $nor?: TMongoFilterQuery<T>[];
     $not?: TMongoFilterQuery<T>;
     $text?: {
          $search: string;
          $language?: string;
          $caseSensitive?: boolean;
          $diacriticSensitive?: boolean;
     };
     $where?: string | ((this: T) => boolean);
};

/**
 * Mongo filter query type.
 */
export type TMongoFilterQuery<T> = {
     [P in keyof T]?: T[P] | TMongoFilterOperators<T[P]>;
} & TMongoRootFilterOperators<T>;

// ** ============================================================================
// ** Query Builder Types
// ** ============================================================================

/**
 * Populate options for query builder.
 */
export type TPopulateOptions = {
     path: string;
     select?: string | Record<string, 0 | 1>;
     model?: string;
     match?: Record<string, unknown>;
     populate?: TPopulateOptions | TPopulateOptions[];
};

/**
 * Query builder for chaining query operations.
 */
export type TQueryBuilder<TResult, TQueryHelpers = object> = Promise<TResult> & {
     sort(options: Record<string, TSortOrder>): TQueryBuilder<TResult, TQueryHelpers>;
     limit(count: number): TQueryBuilder<TResult, TQueryHelpers>;
     skip(count: number): TQueryBuilder<TResult, TQueryHelpers>;
     select(fields: string | Record<string, 0 | 1>): TQueryBuilder<TResult, TQueryHelpers>;
     populate(path: string | TPopulateOptions): TQueryBuilder<TResult, TQueryHelpers>;
     lean(): TQueryBuilder<TResult, TQueryHelpers>;
     exec(): Promise<TResult>;
};

// ** ============================================================================
// ** Model Types
// ** ============================================================================

/**
 * Generic Model type.
 */
export type TModel<TRawDocType = unknown, TQueryHelpers = object, TId = unknown, TFilter = unknown> = {
     // ** Count documents matching the filter
     countDocuments(filter?: TFilter): Promise<number>;
     // ** Find documents matching the filter
     find(filter?: TFilter): TQueryBuilder<TRawDocType[], TQueryHelpers>;
     // ** Find a single document matching the filter
     findOne(filter?: TFilter): TQueryBuilder<TRawDocType | null, TQueryHelpers>;
     // ** Find a document by ID
     findById(id: TId): TQueryBuilder<TRawDocType | null, TQueryHelpers>;
};

/**
 * Convenience alias for a Mongo-backed model.
 */
export type TMongoModel<TRawDocType = unknown, TQueryHelpers = object> = TModel<
     TRawDocType,
     TQueryHelpers,
     string | TObjectId,
     TMongoFilterQuery<TRawDocType>
>;

// ** ============================================================================
// ** Utility Types
// ** ============================================================================

/**
 * Extract raw document type from a Model
 */
export type TExtractDocType<M> = M extends TModel<infer TRawDocType, unknown, unknown, unknown>
     ? TRawDocType
     : never;

/**
 * Extract hydrated document type from a Model
 */
export type TExtractHydratedDoc<M> = M extends TModel<infer TRawDocType, unknown, infer TId, unknown>
     ? THydratedDocument<TRawDocType, TId>
     : never;


