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
