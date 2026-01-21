import { defineConfig } from 'tsup';

export default defineConfig([
	// Server entry - no use client directive
	{
		entry: {
			server: 'src/server.ts',
			'types/index': 'src/types/index.ts',
		},
		format: ['cjs', 'esm'],
		dts: true,
		splitting: false,
		sourcemap: true,
		clean: false, // Don't clean, handled by build script
		treeshake: true,
		external: ['react', 'react-dom', 'zod', '@radix-ui/react-checkbox', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-switch', 'class-variance-authority', 'lucide-react'],
	},
	// Main entry (mixed exports) - must NOT be marked as a client module
	{
		entry: {
			index: 'src/index.ts',
			client: 'src/client.ts',
		},
		format: ['cjs', 'esm'],
		dts: true,
		splitting: false,
		sourcemap: true,
		clean: false, // Don't clean, we build CSS first
		injectStyle: true,
		treeshake: true,
		external: ['react', 'react-dom', 'zod', '@radix-ui/react-checkbox', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-switch', 'class-variance-authority', 'lucide-react'],
	},
]);
