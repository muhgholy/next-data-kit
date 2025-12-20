'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataKitInfinity } from '../../../../src/client';
import { fetchUsers } from '@/actions/users';

export default function InfinityDemo() {
     const [mode, setMode] = useState<'normal' | 'inverse' | 'manual'>('normal');

     return (
          <div className="container mx-auto py-10">
               <div className="mb-8">
                    <Link
                         href="/"
                         className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                         </svg>
                         <span>Back to Table Demo</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-4">DataKitInfinity Demo</h1>
                    <div className="flex gap-2">
                         <button
                              className={`px-4 py-2 rounded-md ${
                                   mode === 'normal'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground'
                              }`}
                              onClick={() => setMode('normal')}
                         >
                              Normal Mode
                         </button>
                         <button
                              className={`px-4 py-2 rounded-md ${
                                   mode === 'inverse'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground'
                              }`}
                              onClick={() => setMode('inverse')}
                         >
                              Inverse Mode (Chat)
                         </button>
                         <button
                              className={`px-4 py-2 rounded-md ${
                                   mode === 'manual'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground'
                              }`}
                              onClick={() => setMode('manual')}
                         >
                              Manual Mode
                         </button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                         {mode === 'normal' && 'Scroll down to load more items'}
                         {mode === 'inverse' && 'Scroll up to load more items (like a chat)'}
                         {mode === 'manual' && 'Custom loading and empty states'}
                    </p>
               </div>

               {mode === 'normal' && (
                    <div className="border rounded-lg p-4 h-[600px]">
                         <DataKitInfinity
                              action={fetchUsers}
                              limit={{ default: 5 }}
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
                              ]}
                              pullDownToRefresh={{
                                   isActive: true,
                                   threshold: 50,
                              }}
                         >
                              {dataKit => (
                                   <div className="space-y-4">
                                        {dataKit.items.map(user => (
                                             <div
                                                  key={user.id}
                                                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                                             >
                                                  <div className="flex items-start justify-between">
                                                       <div>
                                                            <h3 className="font-semibold text-lg">{user.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                                       </div>
                                                       <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                                                            {user.role}
                                                       </span>
                                                  </div>
                                                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                                                       <span>Age: {user.age}</span>
                                                       <span>Status: {user.active ? '🟢 Active' : '🔴 Inactive'}</span>
                                                  </div>
                                             </div>
                                        ))}
                                        {!dataKit.state.hasNextPage && dataKit.items.length > 0 && (
                                             <div className="text-center py-8 text-muted-foreground">
                                                  <p className="text-lg">✨ You're all set!</p>
                                                  <p className="text-sm mt-1">No more users to load</p>
                                             </div>
                                        )}
                                        {dataKit.state.isLoading && (
                                             <div className="text-center py-8 text-muted-foreground">
                                                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
                                                  <p className="mt-2">Loading more users...</p>
                                             </div>
                                        )}
                                   </div>
                              )}
                         </DataKitInfinity>
                    </div>
               )}

               {mode === 'inverse' && (
                    <div className="border rounded-lg p-4 h-[600px]">
                         <DataKitInfinity
                              action={fetchUsers}
                              limit={{ default: 5 }}
                              inverse={true}
                              defaultSort={[{ path: 'createdAt', value: -1 }]}
                              filters={[
                                   {
                                        id: 'search',
                                        label: 'Search',
                                        type: 'TEXT',
                                        placeholder: 'Search by name...',
                                   },
                              ]}
                         >
                              {dataKit => (
                                   <div className="flex flex-col-reverse gap-4">
                                        {dataKit.items.map(user => (
                                             <div
                                                  key={user.id}
                                                  className="border rounded-lg p-4 bg-card hover:bg-accent transition-colors"
                                             >
                                                  <div className="flex items-start gap-3">
                                                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                       </div>
                                                       <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                 <span className="font-semibold">{user.name}</span>
                                                                 <span className="text-xs text-muted-foreground">
                                                                      {new Date().toLocaleTimeString()}
                                                                 </span>
                                                            </div>
                                                            <p className="text-sm mt-1">{user.email}</p>
                                                            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                                 {user.role}
                                                            </span>
                                                       </div>
                                                  </div>
                                             </div>
                                        ))}
                                        {dataKit.state.isLoading && (
                                             <div className="text-center py-4 text-muted-foreground">
                                                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-solid border-current border-r-transparent"></div>
                                             </div>
                                        )}
                                        {!dataKit.state.hasNextPage && dataKit.items.length > 0 && (
                                             <div className="text-center py-4 text-muted-foreground text-sm">
                                                  No more messages
                                             </div>
                                        )}
                                   </div>
                              )}
                         </DataKitInfinity>
                    </div>
               )}

               {mode === 'manual' && (
                    <div className="border rounded-lg p-4 h-[600px]">
                         <DataKitInfinity
                              action={fetchUsers}
                              limit={{ default: 5 }}
                              manual={true}
                              filters={[
                                   {
                                        id: 'search',
                                        label: 'Search',
                                        type: 'TEXT',
                                        placeholder: 'Search...',
                                   },
                              ]}
                         >
                              {dataKit => (
                                   <div className="space-y-4">
                                        {dataKit.state.isLoading && dataKit.items.length === 0 ? (
                                             <div className="flex flex-col items-center justify-center h-96">
                                                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent"></div>
                                                  <p className="mt-4 text-muted-foreground">Loading users...</p>
                                             </div>
                                        ) : dataKit.items.length === 0 ? (
                                             <div className="flex flex-col items-center justify-center h-96">
                                                  <svg
                                                       className="w-24 h-24 text-muted-foreground/30"
                                                       fill="none"
                                                       stroke="currentColor"
                                                       viewBox="0 0 24 24"
                                                  >
                                                       <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                       />
                                                  </svg>
                                                  <p className="mt-4 text-lg font-medium">No users found</p>
                                                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                                             </div>
                                        ) : (
                                             <>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                       {dataKit.items.map(user => (
                                                            <div
                                                                 key={user.id}
                                                                 className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                                                            >
                                                                 <div className="flex items-center gap-3">
                                                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                                                           {user.name.charAt(0)}
                                                                      </div>
                                                                      <div className="flex-1">
                                                                           <h4 className="font-semibold">{user.name}</h4>
                                                                           <p className="text-sm text-muted-foreground">
                                                                                {user.email}
                                                                           </p>
                                                                      </div>
                                                                 </div>
                                                                 <div className="mt-3 flex items-center gap-2 text-xs">
                                                                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                                           {user.role}
                                                                      </span>
                                                                      <span className="text-muted-foreground">Age: {user.age}</span>
                                                                      <span className={user.active ? 'text-green-600' : 'text-red-600'}>
                                                                           {user.active ? '● Active' : '● Inactive'}
                                                                      </span>
                                                                 </div>
                                                            </div>
                                                       ))}
                                                  </div>

                                                  {/* Custom loading more indicator */}
                                                  {dataKit.state.isLoading && (
                                                       <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                                                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-4 border-solid border-current border-r-transparent"></div>
                                                            <span>Loading more...</span>
                                                       </div>
                                                  )}

                                                  {/* Custom end message */}
                                                  {!dataKit.state.hasNextPage && (
                                                       <div className="text-center py-8">
                                                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                                                                 <svg
                                                                      className="w-5 h-5"
                                                                      fill="none"
                                                                      stroke="currentColor"
                                                                      viewBox="0 0 24 24"
                                                                 >
                                                                      <path
                                                                           strokeLinecap="round"
                                                                           strokeLinejoin="round"
                                                                           strokeWidth={2}
                                                                           d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                      />
                                                                 </svg>
                                                                 <span>All {dataKit.items.length} users loaded</span>
                                                            </div>
                                                       </div>
                                                  )}
                                             </>
                                        )}
                                   </div>
                              )}
                         </DataKitInfinity>
                    </div>
               )}
          </div>
     );
}
