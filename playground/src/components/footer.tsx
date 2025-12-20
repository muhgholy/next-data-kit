export function Footer() {
     return (
          <footer className="mt-auto border-t bg-card/50 backdrop-blur-sm">
               <div className="container px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex flex-col items-center md:items-start gap-2">
                              <p className="text-sm font-medium flex items-center gap-2">
                                   Built with{' '}
                                   <span className="text-red-500 animate-pulse">♥</span>{' '}
                                   using{' '}
                                   <span className="font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                        Next Data Kit
                                   </span>
                              </p>
                              <p className="text-xs text-muted-foreground text-center md:text-left">
                                   A powerful data fetching and management library for Next.js applications
                              </p>
                         </div>

                         <div className="flex items-center gap-6">
                              <a
                                   href="https://github.com/muhgholy/next-data-kit"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                              >
                                   Documentation
                              </a>
                              <a
                                   href="https://github.com/muhgholy/next-data-kit"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                              >
                                   GitHub
                              </a>
                              <a
                                   href="https://www.npmjs.com/package/next-data-kit"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                              >
                                   npm
                              </a>
                         </div>
                    </div>

                    <div className="mt-6 pt-6 border-t text-center">
                         <p className="text-xs text-muted-foreground">
                              © {new Date().getFullYear()} Next Data Kit. All rights reserved.
                         </p>
                    </div>
               </div>
          </footer>
     );
}
