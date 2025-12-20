'use client';

import { useState } from 'react';
import { DataKitInfinity } from 'next-data-kit/client';
import { fetchUsers } from '@/actions/users';

export default function InfinityDemo() {
     const [mode, setMode] = useState<'normal' | 'manual'>('normal');

     return (
          <div className="container mx-auto px-4 md:px-8 py-8">
               {/* Hero Section */}
               <div className="mb-8 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                         DataKitInfinity Component
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                         Infinity Scroll Demo
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl">
                         Explore different infinite scrolling modes: normal feed scrolling and manual control with custom loading states.
                    </p>

                    {/* Mode Selector */}
                    <div className="flex flex-wrap gap-2 pt-2">
                         <button
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${mode === 'normal'
                                   ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                   : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                   }`}
                              onClick={() => setMode('normal')}
                         >
                              <div className="flex items-center gap-2">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                   </svg>
                                   Normal Mode
                              </div>
                         </button>
                         <button
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${mode === 'manual'
                                   ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                   : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                   }`}
                              onClick={() => setMode('manual')}
                         >
                              <div className="flex items-center gap-2">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                   </svg>
                                   Manual Mode
                              </div>
                         </button>
                    </div>

                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         {mode === 'normal' && 'Scroll down to load more items automatically'}
                         {mode === 'manual' && 'Custom loading and empty states with grid layout'}
                    </p>
               </div>

               {mode === 'normal' && (
                    <div className="border rounded-lg overflow-hidden shadow-sm bg-card">
                         <DataKitInfinity
                              fullHeight={true}
                              action={fetchUsers}
                              limit={{ default: 5 }}
                              className="p-4 md:p-6"
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
                         >
                              {dataKit => (
                                   <div className="space-y-3">
                                        {dataKit.items.map(user => (
                                             <div
                                                  key={user.id}
                                                  className="group border rounded-lg p-4 hover:shadow-md transition-all bg-background hover:border-primary/50"
                                             >
                                                  <div className="flex items-start justify-between gap-3">
                                                       <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                                                 {user.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                                                                 {user.email}
                                                            </p>
                                                            <div className="mt-3 flex gap-3 text-xs">
                                                                 <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                      </svg>
                                                                      Age: {user.age}
                                                                 </span>
                                                                 <span className={`inline-flex items-center gap-1.5 ${user.active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                      <span className={`h-1.5 w-1.5 rounded-full ${user.active ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`}></span>
                                                                      {user.active ? 'Active' : 'Inactive'}
                                                                 </span>
                                                            </div>
                                                       </div>
                                                       <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary flex-shrink-0">
                                                            {user.role}
                                                       </span>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </DataKitInfinity>
                    </div>
               )}

               {mode === 'manual' && (
                    <div className="border rounded-lg overflow-hidden h-[600px]">
                         <DataKitInfinity
                              action={fetchUsers}
                              limit={{ default: 5 }}
                              className="p-4"
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
