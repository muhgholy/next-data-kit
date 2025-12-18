import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	role: 'admin' | 'user' | 'guest';
	age: number;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		role: { type: String, enum: ['admin', 'user', 'guest'], default: 'user' },
		age: { type: Number, required: true },
		active: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	},
);

export const UserModel = models.User || model<IUser>('User', UserSchema);
