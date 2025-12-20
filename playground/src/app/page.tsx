'use client';

import Link from 'next/link';
import { DataKitTable } from '../../../src/client';
import { fetchUsers, deleteUsers } from '@/actions/users';

export default function TableDemo() {
     return (
          <div className="container mx-auto py-10">
               <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">DataKitTable Demo</h1>
                    <div className="flex gap-2">
                         <Link
                              href="/infinity"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                         >
                              <span>View Infinity Demo</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                         </Link>
                    </div>
               </div>

               <DataKitTable
                    action={fetchUsers}
                    limit={{ default: 10 }}
                    query={{ active: true }}
                    filters={[
                         {
                              id: 'search',
                              label: 'Search',
                              type: 'TEXT',
                              placeholder: 'Search by name or email...',
                         },
                         {
                              id: 'role',
                              label: 'Role',
                              type: 'SELECT',
                              dataset: [
                                   { id: 'admin', name: 'admin', label: 'Admin' },
                                   { id: 'user', name: 'user', label: 'User' },
                                   { id: 'guest', name: 'guest', label: 'Guest' },
                              ],
                         },
                         {
                              id: 'age',
                              label: 'Min Age',
                              type: 'TEXT',
                              placeholder: '18',
                         },
                    ]}
                    selectable={{
                         enabled: true,
                         actions: {
                              delete: {
                                   name: 'Delete Selected',
                                   function: async items => {
                                        await deleteUsers(items.map(i => String(i.id)));
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
                              sortable: { path: 'email', default: 0 },
                         },
                         {
                              head: <DataKitTable.Head>Role</DataKitTable.Head>,
                              body: ({ item }) => (
                                   <DataKitTable.Cell>
                                        <span className={`px-2 py-1 rounded text-xs ${item.role === 'admin' ? 'bg-red-100 text-red-800' :
                                             item.role === 'user' ? 'bg-blue-100 text-blue-800' :
                                                  'bg-gray-100 text-gray-800'
                                             }`}>
                                             {item.role}
                                        </span>
                                   </DataKitTable.Cell>
                              ),
                              sortable: { path: 'role', default: 0 },
                         },
                         {
                              head: <DataKitTable.Head>Age</DataKitTable.Head>,
                              body: ({ item }) => <DataKitTable.Cell>{item.age}</DataKitTable.Cell>,
                              sortable: { path: 'age', default: 0 },
                         },
                         {
                              head: <DataKitTable.Head>Status</DataKitTable.Head>,
                              body: ({ item }) => (
                                   <DataKitTable.Cell>
                                        <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                             }`}>
                                             {item.active ? 'Active' : 'Inactive'}
                                        </span>
                                   </DataKitTable.Cell>
                              ),
                         },
                    ]}
                    bordered="rounded"
                    className="mb-8"
               />
          </div>
     );
}
