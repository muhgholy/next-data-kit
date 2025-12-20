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
export type TMongoModel<T = unknown> = {
	countDocuments(filter?: TMongoFilterQuery<T>): Promise<number>;
	find(filter?: TMongoFilterQuery<T>, projection?: unknown, options?: unknown): TMongoQuery<T>;
};

/**
 * Mongoose Query interface.
 */
export type TMongoQuery<T> = {
	sort(sort: Record<string, TSortOrder>): TMongoQuery<T>;
	limit(limit: number): TMongoQuery<T>;
	skip(skip: number): TMongoQuery<T>;
	then<TResult1 = T[], TResult2 = never>(onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
};
