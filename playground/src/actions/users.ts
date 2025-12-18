'use server';

import { dataKitServerAction, createSearchFilter } from '../../../src/server';
import type { TDataKitInput } from '../../../src/types';
import dbConnect from '@/lib/mongodb';
import { UserModel, type IUser } from '@/models/User';

export async function fetchUsers(input: TDataKitInput) {
	await dbConnect();

	return dataKitServerAction<IUser, {
		id: string;
		name: string;
		email: string;
		role: string;
		age: number;
		active: boolean;
		createdAt: string;
	}>({
		adapter: UserModel,
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
			role: value => ({ role: value as 'admin' | 'user' | 'guest' }),
			age: value => ({ age: { $gte: value as number } }),
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
