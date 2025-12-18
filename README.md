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
		filter: () => ({
			active: true,
		}),
		filterCustom: {
			search: createSearchFilter(['name', 'email']),
			age: value => ({
				age: {
					$gte: value,
				},
			}),
		},
		filterAllowed: ['search', 'age'],
	});
}
```

### Input Validation (Optional)

You can use the built-in Zod schema to validate inputs before processing:

```typescript
'use server';

import { dataKitServerAction, dataKitSchemaZod } from 'next-data-kit/server';

export async function fetchUsers(input: unknown) {
	// Validate input
	const parsedInput = dataKitSchemaZod.parse(input);

	return dataKitServerAction({
		model: UserModel,
		input: parsedInput,
		item: user => ({ id: user._id.toString(), name: user.name }),
		filterAllowed: ['search', 'role'],
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
	filterCustom?: TFilterCustomConfigWithFilter<T, TMongoFilterQuery<T>>;
	defaultSort?: TSortOptions<T>;
	// ** Whitelist of allowed filter fields (crucial for security when using query prop)
	filterAllowed?: string[];
};
```

```

// ... inside dataKitServerAction options
	});
}
```

### Security Note: `queryAllowed` & `filterAllowed` (Strict Mode)

Security is strict by default when whitelists are provided. If you provide `filterAllowed` or `queryAllowed`, any input field **NOT** in the whitelist will cause the server action to **THROW AN ERROR**. This ensures that no hidden or unauthorized fields can be filtered or queried.

```typescript
// Strict Security Example
dataKitServerAction({
	model: UserModel,
	input,
	item: u => ({ id: u._id.toString(), name: u.name }),
	// If client sends { filter: { secret: "true" } }, this WILL THROW an Error!
	filterAllowed: ['name', 'email', 'role'],
	// Same for query params
	queryAllowed: ['status'],
});
```

### Error Handling on Client

When the server action throws an Error (e.g., due to a security violation), `next-data-kit` catches it on the client side.

- **`DataKitTable`**: Automatically displays the error message in Red within the table body.
- **`useDataKit`**: The error is available in `state.error` for custom handling.

```tsx
// Custom UI with useDataKit
const { state: { error } } = useDataKit({ ... });

if (error) {
  return <div className="text-red-500">Error: {error.message}</div>;
}
```

### Input Validation (Optional)

type TDataKitServerActionOptions<T, R> = {
input: TDataKitInput<T>;
model: TMongoModel<T>;
item: (item: T) => Promise<R> | R;
filter?: (filterInput?: Record<string, unknown>) => TMongoFilterQuery<T>;
filterCustom?: TFilterCustomConfigWithFilter<T, TMongoFilterQuery<T>>;
defaultSort?: TSortOptions<T>;
// \*\* Whitelist of allowed filter fields (crucial for security when using query prop)
filterAllowed?: string[];
};

````

#### `createSearchFilter(fields)`

Create a search filter for multiple fields.

```typescript
filterCustom: {
	search: createSearchFilter(["name", "email", "phone"]);
}
````

#### `escapeRegex(str)`

Escape regex special characters in a string.

#### Custom Filter Implementation

You can implement custom filters manually without using `createSearchFilter`. This gives you full control over the database query.

```typescript
import { escapeRegex } from "next-data-kit/server";

// ... inside dataKitServerAction options
filterCustom: {
  // Manual search implementation
  search: (value) => {
    if (typeof value !== 'string') return {};
    const term = escapeRegex(value);
    return {
      $or: [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ],
    };
  },
  // Filter by range
  priceRange: (value: { min: number; max: number }) => ({
    price: { $gte: value.min, $lte: value.max },
  }),
},
filterAllowed: ["search", "priceRange"]
```

#### Understanding `filterCustom` Flow

To use custom filters effectively, you must match the **Key** on the client with the **Key** on the server.

1.   **Client-side**: Define a filter with a specific `id` (e.g., `'priceRange'`).

     ```tsx
     // Client Component
     <DataKitTable
     	filters={[{ id: 'priceRange', label: 'Price Range', type: 'TEXT' }]}
     	// ...
     />
     ```

     _Note: When use interact with this filter, `DataKit` sends `{ filter: { priceRange: "value" } }` to the server._

2.   **Server-side**: Handle that key in `filterCustom`.

     ```typescript
     // Server Action
     filterCustom: {
     	// MATCHES 'priceRange' FROM CLIENT
     	priceRange: value => ({
     		price: { $lte: Number(value) },
     	});
     }
     ```

     The `filterCustom` function intercepts the value sent from the client before it hits the database query builder, allowing you to transform simple values into complex queries.

**Client Usage:**

```tsx
const {
	actions: { setFilter },
} = useDataKit({
	/* ... */
});

// Trigger the manual search
setFilter('search', 'query string');

// Trigger the range filter
setFilter('priceRange', { min: 10, max: 100 });
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
