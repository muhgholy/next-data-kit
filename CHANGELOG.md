# [7.0.0](https://github.com/muhgholy/next-data-kit/compare/v6.0.0...v7.0.0) (2025-12-18)


* feat!: restrict filter values to primitives for improved type safety ([5ef12b7](https://github.com/muhgholy/next-data-kit/commit/5ef12b7f352e7c1ddbf759ba85b33270f35aea9e))


### BREAKING CHANGES

* Filter type in TDataKitInput is now strictly typed to primitives:
- Changed from: filter?: Record<string, unknown>
- Changed to: filter?: Record<string, string | number | boolean | null>
- This prevents objects/arrays in filter values at the type level
- Matches runtime Zod validation for consistency

Migration guide:
- Ensure all filter values are primitives (string, number, boolean, or null)
- Remove any object or array values from filter parameters
- Type errors will now appear at compile-time instead of runtime

Additional changes:
- Added strict type-level tests to prevent type mismatches
- Updated server action validation to skip undefined values
- Improved test coverage for filter type compatibility

# [6.0.0](https://github.com/muhgholy/next-data-kit/compare/v5.0.0...v6.0.0) (2025-12-18)


* feat!: rename controller types and improve type safety ([71119d6](https://github.com/muhgholy/next-data-kit/commit/71119d6cce51cb69c107ae272ddad778c6a42db0))


### BREAKING CHANGES

* Controller and options types have been renamed for clarity:
- TDataKitControllerOptions renamed to TUseDataKitOptions
- TDataKitComponentController renamed to TDataKitController
- DataKitTable generic constraint relaxed to accept any item type
- Zod schema updated to include action field validation

Migration guide:
- Replace TDataKitControllerOptions with TUseDataKitOptions
- Replace TDataKitComponentController with TDataKitController
- Controller refs now properly infer item types from action functions

Additional changes:
- Added comprehensive schema validation tests
- Fixed type inference for DataKitTable controller prop
- Updated README documentation with new type names

# [5.0.0](https://github.com/muhgholy/next-data-kit/compare/v4.0.0...v5.0.0) (2025-12-18)


* feat!: restructure types folder and move helper functions to utils ([fd7bc1e](https://github.com/muhgholy/next-data-kit/commit/fd7bc1ec25b3361289913bf803f1f2d0258f7d7d))


### BREAKING CHANGES

* Types folder has been reorganized into client and server subdirectories. Import paths have changed:
- Types are now organized as types/client/ and types/server/
- Database types moved from types/database/ to types/server/database/
- Client types (hook, component, selectable) moved to types/client/
- Server action types extracted to types/server/action.ts
- Helper functions (calculatePagination) moved from types to server/utils.ts
- All imports updated to reflect new structure

Migration guide:
- Update direct imports from types subfolders to use main types export
- Helper functions like calculatePagination now exported from server utils

# [4.0.0](https://github.com/muhgholy/next-data-kit/compare/v3.0.1...v4.0.0) (2025-12-18)


* feat!: refactor server action API ([ccd143b](https://github.com/muhgholy/next-data-kit/commit/ccd143b274f11c0a8917f91383a7d04a16a916f0))


### Bug Fixes

* properly type dataKitServerAction generics in playground ([7f7aa78](https://github.com/muhgholy/next-data-kit/commit/7f7aa78e16bfe6fb87b807aea487a48cdeebdb01))


### Features

* create Next.js + MongoDB playground ([f6af4f3](https://github.com/muhgholy/next-data-kit/commit/f6af4f37e0acb037ee4ed32c30002eb09a22a775))


### BREAKING CHANGES

* dataKitServerAction now uses overloads for model vs adapter

## [3.0.1](https://github.com/muhgholy/next-data-kit/compare/v3.0.0...v3.0.1) (2025-12-18)


### Bug Fixes

* correct markdown syntax errors in README ([d745a06](https://github.com/muhgholy/next-data-kit/commit/d745a06406e8dfe8c2638565a6f6258a4ada9f13))

# [3.0.0](https://github.com/muhgholy/next-data-kit/compare/v2.0.0...v3.0.0) (2025-12-18)


### Features

* simplify security model - filterCustom keys define allowed filters ([2f3f5bc](https://github.com/muhgholy/next-data-kit/commit/2f3f5bcca80d6e4137c4135582bdf0003bae8ab4))


### BREAKING CHANGES

* Removed filterAllowed parameter. Filter security is now automatically enforced by filterCustom keys. When you define filterCustom, only those keys are allowed as filters from the client.

- Remove filterAllowed parameter (redundant with filterCustom keys)
- Auto-extract allowed filter keys from filterCustom
- Clarify filter vs query architecture in documentation
- Clean up README with better examples and explanations

Migration: Remove any explicit filterAllowed parameters - they are no longer needed and will be ignored. The filterCustom keys automatically define what filters are allowed.

# [2.0.0](https://github.com/muhgholy/next-data-kit/compare/v1.0.1...v2.0.0) (2025-12-18)


* feat!: add security features with breaking changes ([4a338f4](https://github.com/muhgholy/next-data-kit/commit/4a338f4fe9558a16bee3b3b02dbbc313ac581ab9))


### Bug Fixes

* typescript build errors in security validation ([8d56fee](https://github.com/muhgholy/next-data-kit/commit/8d56fee20ae0c35589d4c86f4d7f2ecddebc33f8))


### BREAKING CHANGES

* Filter configuration type values changed from lowercase to uppercase (regex -> REGEX, exact -> EXACT). This affects all filterConfig definitions and requires client code updates.
* Added strict security validation that throws errors when disallowed fields are used in filter or query parameters when filterAllowed/queryAllowed whitelists are provided.

- Add filterAllowed and queryAllowed whitelists for strict field validation
- Add maxLimit parameter with default of 100 to prevent excessive data fetching
- Enforce primitive-only values in query and filter to prevent NoSQL injection
- Add isSafeKey check to prevent __proto__ and constructor pollution
- Add escapeRegex utility usage in REGEX filters
- Add error state display in DataKitTable component
- Update Zod schema to enforce primitive values
- Add comprehensive security and limits test suites
- Update README with security documentation and error handling examples

## [1.0.1](https://github.com/muhgholy/next-data-kit/compare/v1.0.0...v1.0.1) (2025-12-18)


### Bug Fixes

* preserve props on DataKitTable.Head for sortable columns ([e77ea6d](https://github.com/muhgholy/next-data-kit/commit/e77ea6d2b756fd0f705a12505e92d4bb5723e874))

# 1.0.0 (2025-12-18)


### Features

* add Zod schema for input validation and implement DataKit controller ([fbda5d7](https://github.com/muhgholy/next-data-kit/commit/fbda5d7b83e0cc4069f164d12cd808d9b2a01543))
* initial commit ([965b2a5](https://github.com/muhgholy/next-data-kit/commit/965b2a5bc9ad721752cae1fda3f240b19d51af8c))
