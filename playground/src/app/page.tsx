'use client';

import { DataKitTable } from 'next-data-kit/client';
import { fetchUsers, deleteUsers } from '@/actions/users';

export default function TableDemo() {
     return (
          <div className="container mx-auto px-4 md:px-8 py-12">
               {/* Hero Section */}
               <div className="mb-12 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 border border-primary/20 text-primary text-sm font-semibold shadow-lg shadow-primary/10">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                         </svg>
                         DataKitTable Component
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                         Table Demo
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                         Experience a fully-featured data table with sorting, filtering, pagination, and row selection.
                         Built with Next Data Kit for seamless server-side data management.
                    </p>
               </div>

               {/* Features Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="group p-6 rounded-xl border bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                         <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                              </svg>
                         </div>
                         <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Sorting</h3>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                              Multi-column sorting with ascending and descending order
                         </p>
                    </div>
                    <div className="group p-6 rounded-xl border bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                         <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                              </svg>
                         </div>
                         <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Filtering</h3>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                              Advanced filters with text search and select dropdowns
                         </p>
                    </div>
                    <div className="group p-6 rounded-xl border bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                         <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-600 to-primary flex items-center justify-center mb-4 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                         </div>
                         <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Selection</h3>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                              Row selection with bulk actions and delete functionality
                         </p>
                    </div>
               </div>

               {/* Data Table */}
               <div className="rounded-xl border bg-card overflow-hidden shadow-lg">
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
                                   body: ({ item }) => (
                                        <DataKitTable.Cell>
                                             <div className="flex items-center gap-2">
                                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center text-primary font-semibold text-sm">
                                                       {item.name.charAt(0).toUpperCase()}
                                                  </div>
                                                  <span className="font-medium text-foreground">{item.name}</span>
                                             </div>
                                        </DataKitTable.Cell>
                                   ),
                                   sortable: { path: 'name', default: 0 },
                              },
                              {
                                   head: <DataKitTable.Head>Email</DataKitTable.Head>,
                                   body: ({ item }) => (
                                        <DataKitTable.Cell>
                                             <span className="text-sm text-muted-foreground">{item.email}</span>
                                        </DataKitTable.Cell>
                                   ),
                                   sortable: { path: 'email', default: 0 },
                              },
                              {
                                   head: <DataKitTable.Head>Role</DataKitTable.Head>,
                                   body: ({ item }) => (
                                        <DataKitTable.Cell>
                                             <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${item.role === 'admin'
                                                       ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                                       : item.role === 'user'
                                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                                            : 'bg-muted text-muted-foreground border border-border'
                                                  }`}>
                                                  {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                                             </span>
                                        </DataKitTable.Cell>
                                   ),
                                   sortable: { path: 'role', default: 0 },
                              },
                              {
                                   head: <DataKitTable.Head>Age</DataKitTable.Head>,
                                   body: ({ item }) => (
                                        <DataKitTable.Cell>
                                             <span className="text-sm font-medium text-foreground">{item.age}</span>
                                        </DataKitTable.Cell>
                                   ),
                                   sortable: { path: 'age', default: 0 },
                              },
                              {
                                   head: <DataKitTable.Head>Status</DataKitTable.Head>,
                                   body: ({ item }) => (
                                        <DataKitTable.Cell>
                                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${item.active
                                                       ? 'bg-success/10 text-success border border-success/20'
                                                       : 'bg-muted text-muted-foreground border border-border'
                                                  }`}>
                                                  <span className={`h-1.5 w-1.5 rounded-full ${item.active ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                                                       }`}></span>
                                                  {item.active ? 'Active' : 'Inactive'}
                                             </span>
                                        </DataKitTable.Cell>
                                   ),
                              },
                         ]}
                         bordered="rounded"
                    />
               </div>
          </div>
     );
}
