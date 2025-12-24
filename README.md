# next-data-kit

A powerful table utility for server-side pagination, filtering, and sorting with React hooks and components.

## Features

- 🚀 **Server-side pagination** - Efficient data fetching with page-based navigation
- 🔍 **Flexible filtering** - Support for regex, exact match, and custom filters
- 📊 **Multi-column sorting** - Sort by multiple columns with customizable order
- ♾️ **Infinite scroll** - DataKitInfinity component with pull-to-refresh support
- ⚛️ **React hooks** - `useDataKit`, `useSelection`, `usePagination` for state management
- 🎨 **Components** - `DataKitTable` for tables, `DataKit` for custom layouts, `DataKitInfinity` for feeds
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

#### Row State Management

Use `state` and `setState` for per-row state (e.g., expanded rows, inline editing, loading states):

```tsx
'use client';

import { DataKitTable } from 'next-data-kit/client';
import { fetchUsers } from '@/actions/users';

export function UsersTable() {
	return (
		<DataKitTable
			action={fetchUsers}
			state={{ isExpanded: false, isEditing: false }}
			table={[
				{
					head: <DataKitTable.Head>Name</DataKitTable.Head>,
					body: ({ item, state, setState }) => (
						<DataKitTable.Cell>
							<div>{state.isEditing ? <input defaultValue={item.name} onBlur={() => setState(s => ({ ...s, isEditing: false }))} /> : <span onClick={() => setState(s => ({ ...s, isEditing: true }))}>{item.name}</span>}</div>
						</DataKitTable.Cell>
					),
				},
				{
					head: <DataKitTable.Head>Actions</DataKitTable.Head>,
					body: ({ item, state, setState }) => (
						<DataKitTable.Cell>
							<button onClick={() => setState(s => ({ ...s, isExpanded: !s.isExpanded }))}>{state.isExpanded ? 'Collapse' : 'Expand'}</button>
							{state.isExpanded && <div className='mt-2 text-sm'>Details: {item.email}</div>}
						</DataKitTable.Cell>
					),
				},
			]}
		/>
	);
}
```

#### Pagination Modes

Both `DataKit` and `DataKitTable` support two pagination modes:

```tsx
// NUMBER (default) - Full numbered pagination with mobile responsiveness
<DataKitTable
	action={fetchUsers}
	pagination="NUMBER"  // Default - shows page numbers
	table={columns}
/>

// SIMPLE - Basic prev/next buttons only
<DataKitTable
	action={fetchUsers}
	pagination="SIMPLE"
	table={columns}
/>
```

**NUMBER mode features:**

- Desktop: Shows Previous, page numbers (1, 2, ... 10), Next
- Mobile: Shows prev icon, current page number, next icon
- Automatically adds ellipsis for skipped pages
- Fully responsive with Tailwind CSS

**Dynamic Limit Options:**

When you set a custom limit, it's automatically added to the dropdown:

```tsx
<DataKitTable
	action={fetchUsers}
	limit={{ default: 15 }}  // 15 will appear in dropdown alongside 10, 25, 50, 100
	table={columns}
/>

// Works with any custom value
<DataKit
	action={fetchUsers}
	limit={{ default: 30 }}  // Dropdown will show: 10, 25, 30, 50, 100
>
	{dataKit => /* ... */}
</DataKit>
```

### Client-side (DataKitInfinity Component - Infinite Scroll)

Use `DataKitInfinity` for infinite scrolling feeds, chat interfaces, or any content that loads more as you scroll. No pagination controls - content loads automatically.

```tsx
'use client';

import { DataKitInfinity } from 'next-data-kit/client';
import { fetchMessages } from '@/actions/messages';

export function MessagesFeed() {
	return (
		<DataKitInfinity action={fetchMessages} limit={{ default: 20 }} filters={[{ id: 'search', label: 'Search', type: 'TEXT' }]}>
			{dataKit => (
				<div className='space-y-4'>
					{dataKit.items.map(message => (
						<div key={message.id} className='rounded-lg border p-4'>
							<p className='font-medium'>{message.author}</p>
							<p>{message.content}</p>
						</div>
					))}
					{!dataKit.state.hasNextPage && dataKit.items.length > 0 && <p className='text-center text-muted-foreground'>You're all set</p>}
					{dataKit.state.isLoading && <p className='text-center text-muted-foreground'>Loading...</p>}
				</div>
			)}
		</DataKitInfinity>
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

**With Mongoose Model** (auto-infers document type):

```typescript
dataKitServerAction({
  model: UserModel,           // Mongoose model
  input: TDataKitInput,
  item: user => ({ ... }),    // user is typed from model
  filterCustom?: { ... },     // Custom filter handlers
  filter?: { ... } | (input) => query,  // Base filter (object or function)
  defaultSort?: { ... },
  maxLimit?: number,          // Default: 100
  queryAllowed?: string[],    // Whitelist for query fields
  filterAllowed?: string[],   // Auto-derived from filterCustom
  sortAllowed?: string[],     // Whitelist for sortable fields
});
```

**Filter Options:**

```typescript
// As a plain object (static base filter)
filter: { isActive: true, deletedAt: null }

// As a function (dynamic filter based on input)
filter: (filterInput) => ({
  organizationId: filterInput?.orgId,
  isActive: true
})
```

**With Custom Adapter** (for testing or non-mongoose):

```typescript
import { adapterMemory } from 'next-data-kit/server';

dataKitServerAction({
  adapter: adapterMemory(items), // or custom adapter
  input: TDataKitInput,
  item: item => ({ ... }),
  maxLimit?: number,
  queryAllowed?: string[],
  filterAllowed?: string[],
  sortAllowed?: string[],
});
```

### Security & Filtering

**Three security whitelists:**

1. **`filterCustom`** - User-facing filters (search, dropdowns, etc.)
     - Client `filters` prop → validated against `filterCustom` keys
     - Only defined keys are allowed (throws error otherwise)

2. **`queryAllowed`** - Direct field matching (fixed filters)
     - Explicit whitelist required
     - Use for: `{ active: true }`, user-specific queries

3. **`sortAllowed`** - Sortable fields whitelist
     - Prevents sorting on arbitrary/sensitive fields
     - Recommended for production security

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
	sortAllowed: ['name', 'email', 'createdAt'], // Only allow sorting these fields
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
import { createSearchFilter, escapeRegex } from 'next-data-kit/server';

filterCustom: {
  // Use built-in helper
  search: createSearchFilter(['name', 'email', 'phone']),

  // Or implement custom logic
  priceRange: (value: { min: number; max: number }) => ({
    price: { $gte: value.min, $lte: value.max },
  }),
}
```

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

| Prop              | Type                         | Description                             |
| ----------------- | ---------------------------- | --------------------------------------- |
| `action`          | `(input) => Promise<Result>` | Server action function                  |
| `table`           | `Column[]`                   | Column definitions                      |
| `filters`         | `FilterItem[]`               | Filter configurations                   |
| `selectable`      | `{ enabled, actions? }`      | Selection & bulk actions                |
| `limit`           | `{ default: number }`        | Items per page (auto-added to dropdown) |
| `defaultSort`     | `TSortEntry[]`               | Initial sort configuration              |
| `pagination`      | `'SIMPLE' \| 'NUMBER'`       | Pagination mode (default: `'NUMBER'`)   |
| `controller`      | `Ref<Controller>`            | External control ref                    |
| `className`       | `string`                     | Container class                         |
| `bordered`        | `boolean \| 'rounded'`       | Border style                            |
| `refetchInterval` | `number`                     | Auto-refresh interval (ms)              |

#### `<DataKit>` Component

Headless component for custom layouts (grids, cards, etc).

| Prop          | Type                         | Description                             |
| ------------- | ---------------------------- | --------------------------------------- |
| `action`      | `(input) => Promise<Result>` | Server action function                  |
| `filters`     | `FilterItem[]`               | Filter configurations                   |
| `limit`       | `{ default: number }`        | Items per page (auto-added to dropdown) |
| `defaultSort` | `TSortEntry[]`               | Initial sort configuration              |
| `pagination`  | `'SIMPLE' \| 'NUMBER'`       | Pagination mode (default: `'NUMBER'`)   |
| `manual`      | `boolean`                    | Skip loading/empty state handling       |
| `children`    | `(dataKit) => ReactNode`     | Render function                         |

#### `<DataKitInfinity>` Component

Infinite scroll component for feeds, chat interfaces, and dynamic content loading.

| Prop          | Type                          | Description                                |
| ------------- | ----------------------------- | ------------------------------------------ |
| `action`      | `(input) => Promise<Result>`  | Server action function                     |
| `filters`     | `FilterItem[]`                | Filter configurations                      |
| `limit`       | `{ default: number }`         | Items per page (default: 10)               |
| `defaultSort` | `TSortEntry[]`                | Initial sort configuration                 |
| `manual`      | `boolean`                     | Skip loading/empty state handling          |
| `autoFetch`   | `boolean`                     | Auto-fetch on mount (default: true)        |
| `debounce`    | `number`                      | Filter debounce in ms (default: 300)       |
| `memory`      | `'memory' \| 'search-params'` | Memory management mode (default: 'memory') |
| `className`   | `string`                      | Container class                            |
| `children`    | `(dataKit) => ReactNode`      | Render function with accumulated items     |

**Features:**

- Automatically accumulates items across pages as user scrolls
- Uses `react-intersection-observer` for efficient scroll detection
- Built-in toolbar with filters and manual refresh
- Access to `state.hasNextPage` for end-of-list detection

#### `useDataKit(options)`

React hook for managing next-data-kit state.

```typescript
interface TUseDataKitOptions<T, R> {
	action: (input: TDataKitInput<T>) => Promise<TDataKitResult<R>>;
	initial?: {
		page?: number;
		limit?: number;
		sorts?: TSortEntry[];
		filter?: Record<string, unknown>;
		query?: Record<string, unknown>;
	};
	// ** Filter items with configuration
	filters?: {
		id: string;
		configuration?: {
			type: 'REGEX' | 'EXACT';
			field?: string;
		};
	}[];
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
     - `hasNextPage` - Whether more pages exist (page \* limit < total)
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
	// ** Filter items with configuration
	filters?: {
		id: string;
		configuration?: {
			type: 'REGEX' | 'EXACT';
			field?: string;
		};
	}[];
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

## Custom Adapters

Use custom adapters for non-mongoose databases or testing:

```typescript
import { adapterMemory } from 'next-data-kit/server';
import type { TDataKitAdapter } from 'next-data-kit/types';

// Built-in memory adapter (great for testing)
const adapter = adapterMemory(items);

// Or create a custom adapter
const myAdapter: TDataKitAdapter<MyDocument> = async ({ filter, sorts, limit, skip }) => {
  const items = await myDb.query({ filter, limit, skip });
  const total = await myDb.count(filter);
  return { items, total };
};

dataKitServerAction({
  adapter: myAdapter,
  input,
  item: doc => ({ ... }),
});
```

## License

MIT © muhgholy

## Dev Playground (Next.js + MongoDB)

This repo includes a real Next.js playground demonstrating all features with MongoDB.

### Run Playground

```bash
cd playground
npm install
npm run seed   # Seed MongoDB with sample data
npm run dev    # Start Next.js dev server
```

Then open: http://localhost:3000

**Prerequisites**: MongoDB running on `mongodb://localhost:27017`

See [playground/README.md](playground/README.md) for details.
