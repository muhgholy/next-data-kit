import { useRef, useState } from 'react';
import { DataKitTable } from '../../src/client/components/data-kit-table';
import { DataKit } from '../../src/client/components/data-kit';
import { dataKitServerAction, adapterMemory } from '../../src/server';
import type { TDataKitInput, TDataKitResult, TDataKitComponentController } from '../../src/types';

type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'editor';
    age: number;
    active: boolean;
};

const createUsers = (count: number): User[] =>
    Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: (['admin', 'user', 'editor'] as const)[i % 3],
        age: 20 + (i % 40),
        active: i % 3 !== 0,
    }));

export const App = () => {
    const [users, setUsers] = useState(() => createUsers(150));
    const [dark, setDark] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const controller = useRef<TDataKitComponentController<User> | null>(null);

    const fetchUsers = async (input: TDataKitInput<User>): Promise<TDataKitResult<User>> => {
        return dataKitServerAction({
            input: {
                ...input,
                filterConfig: {
                    name: { type: 'regex' },
                    role: { type: 'exact' },
                    active: { type: 'exact' },
                },
                filter: {
                    ...input.filter,
                    active: input.filter?.active ? true : undefined,
                },
            },
            adapter: adapterMemory(users, { defaultFilterType: 'exact' }),
            item: (user) => user,
        });
    };

    return (
        <div className={dark ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                <div className="mx-auto max-w-5xl space-y-6 p-6">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">React Data Kit</h1>
                            <p className="text-sm text-gray-500">Playground Demo</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                onClick={() => setDark(!dark)}
                            >
                                {dark ? '☀️' : '🌙'}
                            </button>
                            <button
                                className={`rounded border px-3 py-1.5 text-sm ${viewMode === 'table' ? 'bg-gray-200 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800`}
                                onClick={() => setViewMode('table')}
                            >
                                📋 Table
                            </button>
                            <button
                                className={`rounded border px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800`}
                                onClick={() => setViewMode('grid')}
                            >
                                🔲 Grid
                            </button>
                            <button
                                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                onClick={() => controller.current?.refetchData()}
                            >
                                Refresh
                            </button>
                            <button
                                className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black"
                                onClick={() => {
                                    const id = users.length + 1;
                                    const newUser: User = {
                                        id,
                                        name: `User ${id}`,
                                        email: `user${id}@example.com`,
                                        role: 'user',
                                        age: 25,
                                        active: true,
                                    };
                                    setUsers((prev) => [newUser, ...prev]);
                                    controller.current?.itemPush(newUser);
                                }}
                            >
                                + Add User
                            </button>
                        </div>
                    </header>

                    {viewMode === 'table' ? (
                        <DataKitTable
                            action={fetchUsers}
                            controller={controller}
                            limit={{ default: 10 }}
                            filters={[
                                { id: 'name', label: 'Name', type: 'TEXT', placeholder: 'Search...' },
                                {
                                    id: 'role',
                                    label: 'Role',
                                    type: 'SELECT',
                                    dataset: [
                                        { id: 'admin', name: 'admin', label: 'Admin' },
                                        { id: 'user', name: 'user', label: 'User' },
                                        { id: 'editor', name: 'editor', label: 'Editor' },
                                    ],
                                },
                                { id: 'active', label: 'Active only', type: 'BOOLEAN' },
                            ]}
                            selectable={{
                                enabled: true,
                                actions: {
                                    delete: {
                                        name: 'Delete',
                                        function: async (items) => {
                                            setUsers((prev) => prev.filter((u) => !items.some((i) => i.id === u.id)));
                                            controller.current?.deleteBulk(items);
                                            return [true, { deselectAll: true }];
                                        },
                                    },
                                },
                            }}
                            table={[
                                {
                                    head: <DataKitTable.Head className="w-16">ID</DataKitTable.Head>,
                                    body: ({ item }) => <DataKitTable.Cell className="font-mono text-xs">{item.id}</DataKitTable.Cell>,
                                    sortable: { path: 'id', default: 0 },
                                },
                                {
                                    head: <DataKitTable.Head>Name</DataKitTable.Head>,
                                    body: ({ item }) => <DataKitTable.Cell className="font-medium">{item.name}</DataKitTable.Cell>,
                                    sortable: { path: 'name', default: 0 },
                                },
                                {
                                    head: <DataKitTable.Head>Email</DataKitTable.Head>,
                                    body: ({ item }) => <DataKitTable.Cell className="text-gray-500">{item.email}</DataKitTable.Cell>,
                                    sortable: { path: 'email', default: 0 },
                                },
                                {
                                    head: <DataKitTable.Head>Role</DataKitTable.Head>,
                                    body: ({ item }) => (
                                        <DataKitTable.Cell>
                                            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                                                {item.role}
                                            </span>
                                        </DataKitTable.Cell>
                                    ),
                                    sortable: { path: 'role', default: 0 },
                                },
                                {
                                    head: <DataKitTable.Head>Age</DataKitTable.Head>,
                                    body: ({ item }) => <DataKitTable.Cell>{item.age}</DataKitTable.Cell>,
                                    sortable: { path: 'age', default: -1 },
                                },
                                {
                                    head: <DataKitTable.Head>Active</DataKitTable.Head>,
                                    body: ({ item }) => (
                                        <DataKitTable.Cell>
                                            <span className={item.active ? 'text-green-600' : 'text-gray-400'}>
                                                {item.active ? '✓' : '✗'}
                                            </span>
                                        </DataKitTable.Cell>
                                    ),
                                },
                            ]}
                        />
                    ) : (
                        <DataKit
                            action={fetchUsers}
                            limit={{ default: 12 }}
                            filters={[
                                { id: 'name', label: 'Name', type: 'TEXT', placeholder: 'Search...' },
                                {
                                    id: 'role',
                                    label: 'Role',
                                    type: 'SELECT',
                                    dataset: [
                                        { id: 'admin', name: 'admin', label: 'Admin' },
                                        { id: 'user', name: 'user', label: 'User' },
                                        { id: 'editor', name: 'editor', label: 'Editor' },
                                    ],
                                },
                                { id: 'active', label: 'Active only', type: 'BOOLEAN' },
                            ]}
                        >
                            {(dataKit) => (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {dataKit.items.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex flex-col items-center rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                        >
                                            {/* Avatar */}
                                            <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                                                {user.name.charAt(0)}
                                            </div>
                                            {/* Name */}
                                            <h3 className="text-sm font-semibold">{user.name}</h3>
                                            {/* Email */}
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            {/* Role Badge */}
                                            <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                                                {user.role}
                                            </span>
                                            {/* Age & Status */}
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                <span>Age: {user.age}</span>
                                                <span className={user.active ? 'text-green-600' : 'text-gray-400'}>
                                                    {user.active ? '● Active' : '○ Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DataKit>
                    )}
                </div>
            </div>
        </div>
    );
};
