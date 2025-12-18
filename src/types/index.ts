/**
 * @muhgholy/tabler - Types
 *
 * Re-export all types for easy importing.
 */

// ** Database types (mongoose-like without mongoose)
export type {
     TSortOrder,
     TObjectId,
     TDocument,
     TMongoDocument,
     THydratedDocument,
     TMongoHydratedDocument,
     TMongoFilterOperators,
     TMongoRootFilterOperators,
     TMongoFilterQuery,
     TQueryBuilder,
     TPopulateOptions,
     TModel,
     TMongoModel,
     TExtractDocType,
     TExtractHydratedDoc,
} from './database/mongo';

// ** React Data Kit core types
export type {
     TSortOptions,
     TSortEntry,
     TFilterConfig,
     TFilterCustomConfig,
     TFilterCustomConfigWithFilter,
     TDataKitInput,
     TDataKitResult,
     TPaginationInfo,
     TDataKitAdapter,
} from './next-data-kit';
export { calculatePagination } from './next-data-kit';

// ** Controller types
export type {
     TDataKitState,
     TDataKitActions,
     TUseDataKitReturn,
     TDataKitControllerOptions,
     TDataKitColumn,
} from './hook';

// ** Selectable types
export type {
     TSelectionState,
     TSelectionActions,
     TUseSelectionReturn,
     TSelectionMode,
     TSelectable,
} from './selectable';

// ** Component types
export type {
     TExtractDataKitItemType,
     TDataKitComponentColumn,
     TDataKitFilterItem,
     TDataKitBulkAction,
     TDataKitComponentController,
     TDataKitSelectableItem,
     TDataKitStateMode,
} from './component';
