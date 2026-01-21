/**
 * Example: Using itemUpdate and itemDelete with DataKitTable
 * 
 * This example demonstrates how to use the itemUpdate and itemDelete methods
 * to update and delete items in your table either by index or by id.
 */

'use client';

import { useRef } from 'react';
import { DataKitTable } from 'next-data-kit/client';
import type { TDataKitController } from 'next-data-kit/types';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export function UsersTableExample() {
    const controllerRef = useRef<TDataKitController<User> | null>(null);

    // Example 1: Update by index
    const handleUpdateByIndex = () => {
        controllerRef.current?.itemUpdate({
            index: 0, // Update the first item
            data: { name: 'Updated Name' }, // Partial update
        });
    };

    // Example 2: Update by id
    const handleUpdateById = (userId: string) => {
        controllerRef.current?.itemUpdate({
            id: userId,
            data: { role: 'admin' }, // Partial update
        });
    };

    // Example 3: Update multiple fields
    const handleFullUpdate = (userId: string) => {
        controllerRef.current?.itemUpdate({
            id: userId,
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'moderator',
            },
        });
    };

    // Example 4: Delete by index
    const handleDeleteByIndex = () => {
        controllerRef.current?.itemDelete({
            index: 0, // Delete the first item
        });
    };

    // Example 5: Delete by id
    const handleDeleteById = (userId: string) => {
        controllerRef.current?.itemDelete({
            id: userId,
        });
    };

    return (
        <div>
            <DataKitTable
                action={fetchUsers}
                controller={controllerRef}
                table={[
                    {
                        head: <DataKitTable.Head>Name</DataKitTable.Head>,
                        body: ({ item }) => <DataKitTable.Cell>{item.name}</DataKitTable.Cell>,
                    },
                    {
                        head: <DataKitTable.Head>Email</DataKitTable.Head>,
                        body: ({ item }) => <DataKitTable.Cell>{item.email}</DataKitTable.Cell>,
                    },
                    {
                        head: <DataKitTable.Head>Role</DataKitTable.Head>,
                        body: ({ item }) => <DataKitTable.Cell>{item.role}</DataKitTable.Cell>,
                    },
                    {
                        head: <DataKitTable.Head>Actions</DataKitTable.Head>,
                        body: ({ item, index }) => (
                            <DataKitTable.Cell>
                                <button onClick={() => handleUpdateById(item.id)}>
                                    Make Admin
                                </button>
                                <button onClick={() => handleUpdateByIndex()}>
                                    Update First Item
                                </button>
                                <button onClick={() => handleDeleteById(item.id)}>
                                    Delete (by ID)
                                </button>
                                <button onClick={() => handleDeleteByIndex()}>
                                    Delete First Item
                                </button>
                            </DataKitTable.Cell>
                        ),
                    },
                ]}
            />
        </div>
    );
}

// Mock fetch function for demonstration
async function fetchUsers(input: any) {
    return {
        type: 'ITEMS' as const,
        items: [],
        documentTotal: 0,
    };
}
