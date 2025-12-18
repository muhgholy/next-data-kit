'use server';

import { dataKitServerAction, createSearchFilter } from 'next-data-kit/server';
import type { TDataKitInput } from 'next-data-kit/types';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User';

export async function fetchUsers(input: TDataKitInput) {
	await dbConnect();

	return dataKitServerAction({
		model: UserModel,
		input,
		item: async user => ({
			id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: user.role,
			age: user.age,
			active: user.active,
			createdAt: user.createdAt.toISOString(),
		}),
		filterCustom: {
			search: createSearchFilter(['name', 'email']),
			role: value => ({ role: value }),
			age: value => ({ age: { $gte: Number(value) } }),
		},
		queryAllowed: ['active'],
	});
}

export async function deleteUsers(ids: string[]) {
	await dbConnect();
	await UserModel.deleteMany({ _id: { $in: ids } });
	return { success: true };
}

export async function toggleUserStatus(id: string) {
	await dbConnect();
	const user = await UserModel.findById(id);
	if (user) {
		user.active = !user.active;
		await user.save();
	}
	return { success: true };
}
