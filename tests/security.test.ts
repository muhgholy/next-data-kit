import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mongooseAdapter } from '../src/server/adapters/mongoose';
import { dataKitServerAction } from '../src/server/action';

const mockQuery: any = Promise.resolve([]);
mockQuery.sort = () => mockQuery;
mockQuery.limit = () => mockQuery;
mockQuery.skip = () => mockQuery;

let capturedArgs: any;
const mockModel = {
	countDocuments: vi.fn().mockResolvedValue(0),
	find: (args: any) => {
		capturedArgs = args;
		return mockQuery;
	},
};

// Reset captured args before each test
beforeEach(() => {
	capturedArgs = undefined;
});

describe('Security - Whitelist Strictness', () => {
	it('should throw an ERROR if a disallowed filter field is present', async () => {
		await expect(
			dataKitServerAction({
				input: {
					action: 'FETCH',
					page: 1,
					limit: 10,
					filter: {
						secretField: 'leaked',
					},
				},
				model: mockModel as any,
				item: u => u,
				filterAllowed: ['name', 'email'],
			}),
		).rejects.toThrow(/Filter field 'secretField' is not allowed/);
	});

	it('should throw an ERROR if a disallowed query field is present', async () => {
		await expect(
			dataKitServerAction({
				input: {
					action: 'FETCH',
					page: 1,
					limit: 10,
					query: {
						secretField: 'leaked',
					},
				},
				model: mockModel as any,
				item: u => u,
				queryAllowed: ['name', 'email'],
			}),
		).rejects.toThrow(/Query field 'secretField' is not allowed/);
	});

	it('should throw an ERROR if a disallowed sort field is present', async () => {
		await expect(
			dataKitServerAction({
				input: {
					action: 'FETCH',
					page: 1,
					limit: 10,
					sorts: [
						{ path: 'secretField', value: 1 },
					],
				},
				model: mockModel as any,
				item: u => u,
				sortAllowed: ['name', 'email', 'createdAt'],
			}),
		).rejects.toThrow(/Sort field 'secretField' is not allowed/);
	});

	it('should allow fields that are whitelisted', async () => {
		await dataKitServerAction({
			input: {
				action: 'FETCH',
				page: 1,
				limit: 10,
				filter: { name: 'John' },
				query: { email: 'test@example.com' },
			},
			model: mockModel as any,
			item: u => u,
			filterAllowed: ['name'],
			queryAllowed: ['email'],
		});

		// Validation: args should contain both
		// filter 'name' becomes regex
		expect(capturedArgs).toHaveProperty('name');
		expect(capturedArgs.name).toEqual(
			expect.objectContaining({
				$regex: 'John',
				$options: 'i',
			}),
		);
		// query 'email' is exact match
		expect(capturedArgs).toHaveProperty('email', 'test@example.com');
	});
});

describe('Security - Deep Flawless Check', () => {
	it('should prevent Object Injection even in filterCustom (Runtime check)', async () => {
		// Scenario: User forgot Zod validation. Attacker sends { age: { $gt: 0 } }
		// Custom filter blindly passes value: (val) => ({ age: val })

		await expect(
			dataKitServerAction({
				input: {
					action: 'FETCH',
					page: 1,
					limit: 10,
					filter: {
						vulnerableField: { $gt: 0 }, // Malicious Object
					},
				} as any, // Bypassing TS to simulate raw input
				adapter: mockModel as any,
				item: u => u,
				filterCustom: {
					vulnerableField: (val: any) => ({ age: val }),
				},
			}),
		).rejects.toThrow(/Filter value for 'vulnerableField' must be a primitive/);
	});
});

describe('Security - Deep Security Hardening', () => {
	it('should ignore unsafe keys (__proto__)', async () => {
		const adapter = mongooseAdapter(mockModel as any);
		await adapter({
			filter: { __proto__: 'malicious' },
			sorts: [],
			limit: 10,
			page: 1,
			skip: 0,
			input: {
				filter: { __proto__: 'malicious' },
			} as any,
		});

		expect(capturedArgs).not.toHaveProperty('__proto__');
		expect(Object.keys(capturedArgs).length).toBe(0);
	});

	it('should escape special regex characters in default filter', async () => {
		const adapter = mongooseAdapter(mockModel as any);
		await adapter({
			filter: { name: '(evil)*' },
			sorts: [],
			limit: 10,
			page: 1,
			skip: 0,
			input: {
				filter: { name: '(evil)*' },
			} as any,
		});

		// Should be escaped: \(evil\)\*
		expect(capturedArgs.name.$regex).toContain('\\(evil\\)\\*');
	});

	it('should escape special regex characters in explicitly configured REGEX filter', async () => {
		const adapter = mongooseAdapter(mockModel as any, {
			// No custom filter function, enabling filterConfig usage
		});

		await adapter({
			filter: { bio: '.*' },
			sorts: [],
			limit: 10,
			page: 1,
			skip: 0,
			input: {
				filter: { bio: '.*' },
				filterConfig: {
					bio: { type: 'REGEX' },
				},
			} as any,
		});

		// param '.*' should become '\.\*'
		expect(capturedArgs.bio.$regex).toContain('\\.\\*');
	});
});

describe('Security - Basic NoSQL Injection Audit', () => {
	it('should allow NoSQL injection if input is not sanitized', async () => {
		// NOTE: This test asserts that standard behavior filters out unsafe objects by default
		// because the new strict primitive check in Action prevents this getting to adapter.
		// However, if we test Adapter directly, it ignores objects that aren't strings/numbers/booleans
		// for default filtering.

		const adapter = mongooseAdapter(mockModel as any);

		const maliciousInput = {
			filter: {
				secret: { $ne: null },
			},
			sorts: [],
			limit: 10,
			page: 1,
			skip: 0,
			input: {
				filter: {
					secret: { $ne: null },
				},
			} as any,
		};

		await adapter(maliciousInput);

		// If specific check passes, it means we are SAFE because the $ne operator was stripped/ignored
		expect(capturedArgs).not.toEqual(
			expect.objectContaining({
				secret: { $ne: null },
			}),
		);
		// Should be ignored by adapter's type check
		expect(capturedArgs.secret).toBeUndefined();
	});
});
