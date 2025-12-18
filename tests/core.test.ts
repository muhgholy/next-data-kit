import { describe, expect, it } from 'vitest';

import { dataKitServerAction } from '../src/server/action';
import { adapterMemory } from '../src/server/adapters/memory';
import { calculatePagination } from '../src/types/next-data-kit';

type User = {
     id: string;
     name: string;
     age: number;
     role: 'admin' | 'user';
};

describe('next-data-kit core', () => {
     it('paginates + maps items and returns total', async () => {
          const users: User[] = [
               { id: '1', name: 'Ava', age: 30, role: 'user' },
               { id: '2', name: 'Ben', age: 40, role: 'admin' },
               { id: '3', name: 'Cora', age: 25, role: 'user' },
               { id: '4', name: 'Dan', age: 18, role: 'user' },
               { id: '5', name: 'Eli', age: 55, role: 'admin' },
          ];

          const adapter = adapterMemory(users);

          const res = await dataKitServerAction<User, { id: string }>({
               input: { action: 'FETCH', page: 2, limit: 2 },
               adapter,
               item: async (u) => ({ id: u.id }),
          });

          expect(res.type).toBe('ITEMS');
          expect(res.documentTotal).toBe(5);
          expect(res.items).toEqual([{ id: '3' }, { id: '4' }]);
     });

     it('supports sorting and filtering via adapter contract', async () => {
          const users: User[] = [
               { id: '1', name: 'Ava', age: 30, role: 'user' },
               { id: '2', name: 'Ben', age: 40, role: 'admin' },
               { id: '3', name: 'Cora', age: 25, role: 'user' },
               { id: '4', name: 'Dan', age: 18, role: 'user' },
               { id: '5', name: 'Eli', age: 55, role: 'admin' },
          ];

          const adapter = adapterMemory(users);

          const res = await dataKitServerAction<User, string>({
               input: {
                    action: 'FETCH',
                    page: 1,
                    limit: 10,
                    filter: { role: 'admin' },
                    sorts: [{ path: 'age', value: -1 }],
               },
               adapter,
               item: (u) => u.name,
          });

          expect(res.documentTotal).toBe(2);
          expect(res.items).toEqual(['Eli', 'Ben']);
     });

     it('throws on invalid input (missing page/limit)', async () => {
          const adapter = adapterMemory<User>([]);

          await expect(
               dataKitServerAction<User, User>({
                    input: { action: 'FETCH', page: 1 },
                    adapter,
                    item: (u) => u,
               })
          ).rejects.toThrow(/missing limit or page/i);
     });

     it('calculates pagination info correctly', () => {
          expect(calculatePagination(1, 10, 95)).toEqual({
               currentPage: 1,
               totalPages: 10,
               totalItems: 95,
               itemsPerPage: 10,
               hasNextPage: true,
               hasPrevPage: false,
          });

          expect(calculatePagination(10, 10, 95).hasNextPage).toBe(false);
          expect(calculatePagination(2, 10, 95).hasPrevPage).toBe(true);
     });
});
