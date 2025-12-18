<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# @muhgholy/tabler

A TypeScript npm package for server-side table pagination, filtering, and sorting with React hooks.

## Project Structure

-    `src/types/` - Type definitions (database-agnostic, no mongoose dependency)
-    `src/server/` - Server-side utilities (tablerServerAction, schema)
-    `src/client/` - Client-side React hooks and utilities
-    `src/index.ts` - Main entry point
-    `src/server.ts` - Server entry point (@muhgholy/tabler/server)
-    `src/client.ts` - Client entry point (@muhgholy/tabler/client)

## Key Features

-    Generic database types that work with any ORM (Mongoose, Prisma, etc.)
-    React hooks for table state management
-    Server action for pagination/filtering/sorting
-    TypeScript-first design with full type safety

## Build Commands

-    `npm run build` - Build the package with tsup
-    `npm run dev` - Watch mode
-    `npm run typecheck` - Type checking
-    `npm run lint` - Linting

## Publishing

The package uses GitHub Actions for CI/CD:

-    Auto-publishes to npm on push to main
-    Auto-tags based on version
-    Uses npm trusted publishing (provenance)
