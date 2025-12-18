'use server';

import User, { type IUserDocument } from '@/models/User';
import { dataKitServerAction, createSearchFilter } from '../../../src/server';
import type { TDataKitInput } from '../../../src/types';
import dbConnect from '@/lib/mongodb';

export async function fetchUsers(input: TDataKitInput) {
	await dbConnect();

	return dataKitServerAction({
		model: User,
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
			role: value => ({ role: value as any }),
			age: value => ({ age: { $gte: value as any } }),
		},
		queryAllowed: ['active'],
	});
}

export async function deleteUsers(ids: string[]) {
	await dbConnect();
	await User.deleteMany({ _id: { $in: ids } });
	return { success: true };
}

export async function toggleUserStatus(id: string) {
	await dbConnect();
	const user = await User.findById(id);
	if (user) {
		user.active = !user.active;
		await user.save();
	}
	return { success: true };
}
