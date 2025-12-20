'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './theme-provider';

export function Header() {
     const pathname = usePathname();
     const { theme, setTheme, resolvedTheme } = useTheme();

     const toggleTheme = () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
     };

     const isActive = (path: string) => pathname === path;

     return (
          <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
               <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                         <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-primary overflow-hidden group-hover:scale-105 transition-transform">
                              <svg
                                   className="w-4.5 h-4.5 text-primary-foreground relative z-10"
                                   fill="none"
                                   stroke="currentColor"
                                   strokeWidth={2.5}
                                   viewBox="0 0 24 24"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                   />
                              </svg>
                         </div>
                         <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-base text-foreground">Next Data Kit</span>
                              <span className="text-xs text-muted-foreground font-medium">Playground</span>
                         </div>
                    </Link>

                    {/* Center Navigation - Desktop */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                         <Link
                              href="/"
                              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive('/')
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                   }`}
                         >
                              {isActive('/') && (
                                   <span className="absolute inset-0 rounded-md bg-primary/10"></span>
                              )}
                              <span className="relative">Table</span>
                         </Link>
                         <Link
                              href="/infinity"
                              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive('/infinity')
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                   }`}
                         >
                              {isActive('/infinity') && (
                                   <span className="absolute inset-0 rounded-md bg-primary/10"></span>
                              )}
                              <span className="relative">Infinity</span>
                         </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5">
                         <button
                              onClick={toggleTheme}
                              className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center transition-colors group"
                              aria-label="Toggle theme"
                              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                         >
                              <svg
                                   className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
                                   fill="none"
                                   stroke="currentColor"
                                   strokeWidth={2}
                                   viewBox="0 0 24 24"
                              >
                                   {resolvedTheme === 'dark' ? (
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                   ) : (
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                        />
                                   )}
                              </svg>
                         </button>

                         <div className="w-px h-4 bg-border mx-1"></div>

                         <a
                              href="https://github.com/muhgholy/next-data-kit"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center transition-colors group"
                              aria-label="View on GitHub"
                              title="View on GitHub"
                         >
                              <svg
                                   className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
                                   fill="currentColor"
                                   viewBox="0 0 24 24"
                              >
                                   <path
                                        fillRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        clipRule="evenodd"
                                   />
                              </svg>
                         </a>
                    </div>
               </div>

               {/* Mobile Navigation */}
               <div className="md:hidden border-t">
                    <nav className="container mx-auto px-4 py-1.5 flex justify-center gap-1">
                         <Link
                              href="/"
                              className={`relative flex-1 max-w-[140px] px-3 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${isActive('/')
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                   }`}
                         >
                              {isActive('/') && (
                                   <span className="absolute inset-0 rounded-md bg-primary/10"></span>
                              )}
                              <span className="relative">Table</span>
                         </Link>
                         <Link
                              href="/infinity"
                              className={`relative flex-1 max-w-[140px] px-3 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${isActive('/infinity')
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                   }`}
                         >
                              {isActive('/infinity') && (
                                   <span className="absolute inset-0 rounded-md bg-primary/10"></span>
                              )}
                              <span className="relative">Infinity</span>
                         </Link>
                    </nav>
               </div>
          </header>
     );
}
