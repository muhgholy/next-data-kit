import { describe, expect, it } from 'vitest';
import { dataKitServerAction } from '../src/server/action';
import { adapterMemory } from '../src/server/adapters/memory';

type User = { id: string; name: string };

describe('dataKitServerAction - maxLimit', () => {
	const users: User[] = Array.from({ length: 200 }, (_, i) => ({ id: String(i), name: `User ${i}` }));
	const adapter = adapterMemory(users);

	it('should clamp limit to maxLimit if exceeded', async () => {
		const res = await dataKitServerAction({
			input: { action: 'FETCH', page: 1, limit: 150 },
			adapter,
			item: u => u,
			maxLimit: 100,
		});

		expect(res.items.length).toBe(100);
	});

	it('should use default maxLimit of 100 if not specified', async () => {
		const res = await dataKitServerAction({
			input: { action: 'FETCH', page: 1, limit: 120 },
			adapter,
			item: u => u,
		});

		expect(res.items.length).toBe(100);
	});

	it('should allow limit within maxLimit', async () => {
		const res = await dataKitServerAction({
			input: { action: 'FETCH', page: 1, limit: 50 },
			adapter,
			item: u => u,
			maxLimit: 100,
		});

		expect(res.items.length).toBe(50);
	});
});
