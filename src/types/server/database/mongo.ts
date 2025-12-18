/**
 * next-data-kit - Database Types (Mongo)
 *
 * MongoDB-specific types for filters and queries.
 */

/**
 * Sort order for database queries
 */
export type TSortOrder = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';

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
	$regex?: string | RegExp;
	$options?: string;
};

/**
 * Mongo root operators.
 */
export type TMongoRootFilterOperators<T> = {
	$and?: TMongoFilterQuery<T>[];
	$or?: TMongoFilterQuery<T>[];
	$nor?: TMongoFilterQuery<T>[];
};

/**
 * Mongo filter query type.
 */
export type TMongoFilterQuery<T> = {
	[P in keyof T]?: T[P] | TMongoFilterOperators<T[P]>;
} & TMongoRootFilterOperators<T>;

/**
 * Minimal Mongoose Model interface for the adapter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TMongoModel<_TRawDocType = unknown, _TQueryHelpers = object> = {
	countDocuments(filter?: any): Promise<number>;
	find(filter?: any, projection?: any, options?: any): any;
};
