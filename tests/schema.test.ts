/**
 * Schema validation tests
 * Ensures Zod schema matches TypeScript types
 */

import { describe, it, expect } from 'vitest';
import { dataKitSchemaZod } from '../src/server/schema';
import type { TDataKitInput } from '../src/types';

describe('Schema Type Compatibility', () => {
	it('should parse valid TDataKitInput', () => {
		const validInput: TDataKitInput = {
			action: 'FETCH',
			page: 1,
			limit: 10,
			query: { active: true },
			filter: { search: 'test', role: 'admin' },
			sorts: [{ path: 'name', value: 1 }],
			sort: { email: -1 },
			filterConfig: {
				search: { type: 'REGEX' },
				role: { type: 'EXACT', field: 'userRole' },
			},
		};

		const result = dataKitSchemaZod.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('should accept minimal TDataKitInput', () => {
		const minimalInput: TDataKitInput = {
			page: 1,
			limit: 10,
		};

		const result = dataKitSchemaZod.safeParse(minimalInput);
		expect(result.success).toBe(true);
	});

	it('should reject invalid action', () => {
		const invalidInput = {
			action: 'DELETE',
			page: 1,
			limit: 10,
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should reject negative page number', () => {
		const invalidInput = {
			page: -1,
			limit: 10,
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should reject too many sort fields', () => {
		const invalidInput: TDataKitInput = {
			page: 1,
			limit: 10,
			sorts: [
				{ path: 'field1', value: 1 },
				{ path: 'field2', value: 1 },
				{ path: 'field3', value: 1 },
				{ path: 'field4', value: 1 },
				{ path: 'field5', value: 1 },
				{ path: 'field6', value: 1 }, // 6th field should fail
			],
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should reject objects in filter values', () => {
		const invalidInput = {
			page: 1,
			limit: 10,
			filter: { nested: { invalid: true } },
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should reject arrays in query values', () => {
		const invalidInput = {
			page: 1,
			limit: 10,
			query: { ids: ['1', '2', '3'] },
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should accept null in filter values', () => {
		const validInput: TDataKitInput = {
			page: 1,
			limit: 10,
			filter: { deletedAt: null },
		};

		const result = dataKitSchemaZod.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('should reject invalid sort values', () => {
		const invalidInput = {
			page: 1,
			limit: 10,
			sorts: [{ path: 'name', value: 2 }], // Only 1 or -1 allowed
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should reject excessively long sort paths', () => {
		const invalidInput: TDataKitInput = {
			page: 1,
			limit: 10,
			sorts: [{ path: 'a'.repeat(101), value: 1 }], // Max 100 chars
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should accept all valid filterConfig types', () => {
		const validInput: TDataKitInput = {
			page: 1,
			limit: 10,
			filterConfig: {
				name: { type: 'REGEX' },
				email: { type: 'EXACT' },
				role: { type: 'REGEX', field: 'userRole' },
			},
		};

		const result = dataKitSchemaZod.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('should reject invalid filterConfig type', () => {
		const invalidInput = {
			page: 1,
			limit: 10,
			filterConfig: {
				name: { type: 'LIKE' }, // Only REGEX and EXACT allowed
			},
		};

		const result = dataKitSchemaZod.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});
});

describe('Schema Type Assignment', () => {
	it('should allow TDataKitSchemaZod to be assigned to TDataKitInput', () => {
		// This is a compile-time test
		const schemaOutput = dataKitSchemaZod.parse({
			page: 1,
			limit: 10,
			action: 'FETCH',
		});

		// Should compile without errors
		const input: TDataKitInput = schemaOutput;
		expect(input.page).toBe(1);
		expect(input.limit).toBe(10);
	});

	it('should have compatible filter types', () => {
		// Type-level check: Zod output should be assignable to TDataKitInput
		const parsed = dataKitSchemaZod.parse({
			page: 1,
			limit: 10,
			filter: { search: 'test', active: true, count: 5, deletedAt: null },
		});

		// This should compile without errors
		const input: TDataKitInput = parsed;

		// Runtime check
		expect(input.filter).toEqual({ search: 'test', active: true, count: 5, deletedAt: null });
	});

	it('should ensure filter types are strictly primitives + null', () => {
		type FilterType = NonNullable<TDataKitInput['filter']>;
		type FilterValueType = FilterType[string];

		// This is a compile-time assertion via type assignment
		const testString: FilterValueType = 'test';
		const testNumber: FilterValueType = 123;
		const testBoolean: FilterValueType = true;
		const testNull: FilterValueType = null;

		// These should all be valid
		expect(testString).toBe('test');
		expect(testNumber).toBe(123);
		expect(testBoolean).toBe(true);
		expect(testNull).toBe(null);

		// TypeScript should prevent: const testObject: FilterValueType = {};
		// TypeScript should prevent: const testArray: FilterValueType = [];
	});
});
