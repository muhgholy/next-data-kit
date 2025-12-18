# next-data-kit

A powerful table utility for server-side pagination, filtering, and sorting with React hooks and components.

## Features

- 🚀 **Server-side pagination** - Efficient data fetching with page-based navigation
- 🔍 **Flexible filtering** - Support for regex, exact match, and custom filters
- 📊 **Multi-column sorting** - Sort by multiple columns with customizable order
- ⚛️ **React hooks** - `useDataKit`, `useSelection`, `usePagination` for state management
- 🎨 **Components** - `DataKitTable` for tables, `DataKit` for custom layouts
- 📝 **TypeScript** - Fully typed with generics support
- 🔌 **Framework agnostic** - Works with any database ORM/ODM (Mongoose, Prisma, etc.)
- 📦 **Tree-shakeable** - Import only what you need

## Installation

```bash
npm install next-data-kit
# or
yarn add next-data-kit
# or
pnpm add next-data-kit
```

## Quick Start

### Server-side (Next.js Server Action)

```typescript
'use server';

import { dataKitServerAction, createSearchFilter } from 'next-data-kit/server';
import type { TDataKitInput } from 'next-data-kit/types';
import UserModel from '@/models/User';

export async function fetchUsers(input: TDataKitInput) {
	return dataKitServerAction({
		model: UserModel,
		input,
		item: async user => ({
			id: user._id.toString(),
			name: user.name,
			email: user.email,
		}),
		filterCustom: {
			search: createSearchFilter(['name', 'email']),
			age: value => ({ age: { $gte: value } }),
		},
	});
}
```

### Input Validation (Optional)

You can use the built-in Zod schema to validate inputs before processing:

```typescript
'use server';

import { dataKitServerAction, dataKitSchemaZod } from 'next-data-kit/server';

export async function fetchUsers(input: unknown) {
	const parsedInput = dataKitSchemaZod.parse(input);

	return dataKitServerAction({
		model: UserModel,
		input: parsedInput,
		item: user => ({ id: user._id.toString(), name: user.name }),
		filterCustom: {
			search: value => ({ name: { $regex: value, $options: 'i' } }),
			role: value => ({ role: value }),
		},
	});
}
```

### Client-side (DataKitTable Component)

Ready-to-use table with built-in filtering, sorting, and selection:

```tsx
'use client';

import { DataKitTable } from 'next-data-kit/client';
import { fetchUsers } from '@/actions/users';

export function UsersTable() {
	return (
		<DataKitTable
			action={fetchUsers}
			limit={{ default: 10 }}
			filters={[
				{ id: 'search', label: 'Search', type: 'TEXT', placeholder: 'Search...' },
				{
					id: 'role',
					label: 'Role',
					type: 'SELECT',
					dataset: [
						{ id: 'admin', name: 'admin', label: 'Admin' },
						{ id: 'user', name: 'user', label: 'User' },
					],
				},
			]}
			selectable={{
				enabled: true,
				actions: {
					delete: {
						name: 'Delete Selected',
						function: async items => {
							await deleteUsers(items.map(i => i.id));
							return [true, { deselectAll: true }];
						},
					},
				},
			}}
			table={[
				{
					head: <DataKitTable.Head>Name</DataKitTable.Head>,
					body: ({ item }) => <DataKitTable.Cell>{item.name}</DataKitTable.Cell>,
					sortable: { path: 'name', default: 0 },
				},
				{
					head: <DataKitTable.Head>Email</DataKitTable.Head>,
					body: ({ item }) => <DataKitTable.Cell>{item.email}</DataKitTable.Cell>,
				},
			]}
		/>
	);
}
```

### Client-side (DataKit Component - Custom Layout)

Use `DataKit` for grids, cards, or any custom layout. It provides toolbar/pagination but lets you render content:

```tsx
'use client';

import { DataKit } from 'next-data-kit/client';
import { fetchUsers } from '@/actions/users';

export function UsersGrid() {
	return (
		<DataKit action={fetchUsers} limit={{ default: 12 }} filters={[{ id: 'search', label: 'Search', type: 'TEXT' }]}>
			{dataKit => (
				<div className='grid grid-cols-4 gap-4'>
					{dataKit.items.map(user => (
						<div key={user.id} className='rounded-lg border p-4'>
							<h3>{user.name}</h3>
							<p>{user.email}</p>
						</div>
					))}
				</div>
			)}
		</DataKit>
	);
}
```

**Manual mode** - handle loading/empty states yourself:

```tsx
<DataKit action={fetchUsers} manual>
	{dataKit => (
		<>
			{dataKit.state.isLoading && <Spinner />}
			{dataKit.items.map(user => (
				<Card key={user.id} user={user} />
			))}
		</>
	)}
</DataKit>
```

### Client-side (useDataKit Hook)

For fully custom implementations:

```tsx
'use client';

import { useDataKit } from 'next-data-kit/client';
import { fetchUsers } from '@/actions/users';

export function UsersTable() {
	const {
		items,
		page,
		total,
		state: { isLoading },
		actions: { setPage, setFilter, setSort, refresh },
	} = useDataKit({
		action: fetchUsers,
		initial: {
			limit: 10,
		},
	});

	return (
		<div>
			<input placeholder='Search...' onChange={e => setFilter('search', e.target.value)} />

			{isLoading ? (
				<p>Loading...</p>
			) : (
				<table>
					<thead>
						<tr>
							<th onClick={() => setSort('name', 1)}>Name</th>
							<th onClick={() => setSort('email', 1)}>Email</th>
						</tr>
					</thead>
					<tbody>
						{items.map(user => (
							<tr key={user.id}>
								<td>{user.name}</td>
								<td>{user.email}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<button disabled={page === 1} onClick={() => setPage(page - 1)}>
				Previous
			</button>
			<span>Page {page}</span>
			<button onClick={() => setPage(page + 1)}>Next</button>
		</div>
	);
}
```

## API Reference

### Server

#### `dataKitServerAction(options)`

Main server function for handling table data fetching.

```typescript
type TDataKitServerActionOptions<T, R> = {
	input: TDataKitInput<T>;
	model: TMongoModel<T>;
	item: (item: T) => Promise<R> | R;
	filter?: (filterInput?: Record<string, unknown>) => TMongoFilterQuery<T>;
	// ** Custom filter configuration (defines allowed filter keys)
	filterCustom?: TFilterCustomConfigWithFilter<T, TMongoFilterQuery<T>>;
	defaultSort?: TSortOptions<T>;
	// ** Maximum limit per page (default: 100)
	maxLimit?: number;
	// ** Whitelist of allowed query fields
	queryAllowed?: string[];
};
```

```

// ... inside dataKitServerAction options
	});
}
```

### Security & Filtering

**Two ways to query data:**

1. **`filterCustom`** - User-facing filters (search, dropdowns, etc.)
     - Client `filters` prop → validated against `filterCustom` keys
     - Only defined keys are allowed (throws error otherwise)

2. **`queryAllowed`** - Direct field matching (fixed filters)
     - Explicit whitelist required
     - Use for: `{ active: true }`, user-specific queries

```typescript
dataKitServerAction({
	model: UserModel,
	input,
	item: u => u,
	filterCustom: {
		search: createSearchFilter(['name', 'email']),
		role: value => ({ role: value }),
	},
	queryAllowed: ['organizationId', 'active'],
});
```

### Error Handling

Errors are automatically displayed in `DataKitTable` or available via `state.error` in `useDataKit`.

```tsx
const {
	state: { error },
} = useDataKit({ action: fetchUsers });
if (error) return <div>Error: {error.message}</div>;
```

#### Custom Filters

```typescript
import { createSearchFilter, escapeRegex } from 'next-data-kit/server';\n\nfilterCustom: {\n  // Use built-in helper\n  search: createSearchFilter(['name', 'email', 'phone']),\n  \n  // Or implement custom logic\n  priceRange: (value: { min: number; max: number }) => ({\n    price: { $gte: value.min, $lte: value.max },\n  }),\n}\n```

#### Filter Flow

Match client filter `id` with server `filterCustom` key:

```tsx
// Client
<DataKitTable filters={[{ id: 'priceRange', label: 'Price', type: 'TEXT' }]} />

// Server
filterCustom: {
  priceRange: value => ({ price: { $lte: Number(value) } }),
}

// Or use programmatically
const { actions: { setFilter } } = useDataKit({ ... });
setFilter('priceRange', 100);
```

### Client

#### `<DataKitTable>` Component

Full-featured table component with built-in UI.

| Prop              | Type                         | Description                |
| ----------------- | ---------------------------- | -------------------------- |
| `action`          | `(input) => Promise<Result>` | Server action function     |
| `table`           | `Column[]`                   | Column definitions         |
| `filters`         | `FilterItem[]`               | Filter configurations      |
| `selectable`      | `{ enabled, actions? }`      | Selection & bulk actions   |
| `limit`           | `{ default: number }`        | Items per page             |
| `controller`      | `Ref<Controller>`            | External control ref       |
| `className`       | `string`                     | Container class            |
| `bordered`        | `boolean \| 'rounded'`       | Border style               |
| `refetchInterval` | `number`                     | Auto-refresh interval (ms) |

#### `<DataKit>` Component

Headless component for custom layouts (grids, cards, etc).

| Prop       | Type                         | Description                       |
| ---------- | ---------------------------- | --------------------------------- |
| `action`   | `(input) => Promise<Result>` | Server action function            |
| `filters`  | `FilterItem[]`               | Filter configurations             |
| `limit`    | `{ default: number }`        | Items per page                    |
| `manual`   | `boolean`                    | Skip loading/empty state handling |
| `children` | `(dataKit) => ReactNode`     | Render function                   |

#### `useDataKit(options)`

React hook for managing next-data-kit state.

```typescript
interface TDataKitControllerOptions<T, R> {
	action: (input: TDataKitInput<T>) => Promise<TDataKitResult<R>>;
	initial?: {
		page?: number;
		limit?: number;
		sorts?: TSortEntry[];
		filter?: Record<string, unknown>;
		query?: Record<string, unknown>;
	};
	filterConfig?: TFilterConfig;
	onSuccess?: (result: TDataKitResult<R>) => void;
	onError?: (error: Error) => void;
	autoFetch?: boolean;
}
```

Returns:

- `items` - Current page items
- `page` - Current page number
- `limit` - Items per page
- `total` - Total document count
- `sorts` - Current sort configuration
- `filter` - Current filter values
- `state`
     - `isLoading` - Loading state
     - `error` - Error state
- `actions`
     - `setPage(page)` - Go to a specific page
     - `setLimit(limit)` - Set items per page
     - `setSort(path, value)` - Set sort for a column
     - `setFilter(key, value)` - Set a filter value
     - `clearFilters()` - Clear all filters
     - `refresh()` - Refresh the table data
     - `reset()` - Reset to initial state

#### `useSelection<T>()`

React hook for managing table row selection.

```typescript
const { selectedIds, toggle, selectAll, deselectAll, isSelected, getSelectedArray } = useSelection<string>();
```

#### `usePagination(options)`

React hook for calculating pagination state.

```typescript
const { pages, hasNextPage, hasPrevPage, totalPages } = usePagination({
	page: 1,
	limit: 10,
	total: 100,
});
```

## Types

### Filter Types (Discriminated Union)

```typescript
// TEXT - text input
{ id: "name", label: "Name", type: "TEXT", placeholder?: "..." }

// SELECT - dropdown (dataset required!)
{ id: "role", label: "Role", type: "SELECT", dataset: [{ id, name, label }] }

// BOOLEAN - toggle switch
{ id: "active", label: "Active", type: "BOOLEAN" }
```

### `TDataKitInput<T>`

```typescript
interface TDataKitInput<T = unknown> {
	action?: 'FETCH';
	page?: number;
	limit?: number;
	sort?: TSortOptions<T>;
	sorts?: TSortEntry[];
	query?: Record<string, unknown>;
	filter?: Record<string, unknown>;
	filterConfig?: TFilterConfig;
}
```

### `TDataKitResult<R>`

```typescript
interface TDataKitResult<R> {
	type: 'ITEMS';
	items: R[];
	documentTotal: number;
}
```

### `TFilterConfig`

```typescript
interface TFilterConfig {
	[key: string]: {
		type: 'REGEX' | 'EXACT';
		field?: string;
	};
}
```

## Working with Custom Models

The package provides generic database types that work with any ORM/ODM:

```typescript
import type { TModel, TMongoFilterQuery, TQueryBuilder } from 'next-data-kit/types';

// Your model just needs to implement the Model interface
interface MyModel extends TModel<MyDocument> {
	countDocuments(filter?: TMongoFilterQuery<MyDocument>): Promise<number>;
	find(filter?: TMongoFilterQuery<MyDocument>): TQueryBuilder<MyDocument[]>;
}
```

## License

MIT © muhgholy

## Dev Playground (Live Server + Temp MongoDB)

This repo includes a **dev-only** playground you can open in the browser to preview components and validate end-to-end behavior against a **temporary in-memory MongoDB**.

- It is **not exported** in `package.json#exports`.
- It is **not published** to npm because `package.json#files` only includes `dist`.

### Run

```bash
npm run playground:dev
```

Then open:

- Web UI: http://localhost:5173
- API health: http://127.0.0.1:8787/api/health

### Reset seed data

```bash
curl -X POST http://127.0.0.1:8787/api/seed/reset
```

```

```
