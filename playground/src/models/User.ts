import type { Document, Model, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

// ** Document Type
export interface IUserDocument extends Document {
	_id: Types.ObjectId;
	name: string;
	email: string;
	role: 'admin' | 'user' | 'guest';
	age: number;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// ** Schema
const userSchema = new Schema<IUserDocument>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		role: {
			type: String,
			enum: ['admin', 'user', 'guest'],
			default: 'user',
		},
		age: {
			type: Number,
			required: true,
		},
		active: {
			type: Boolean,
			default: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			required: true,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

// ** Create and export User model
const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

export default User;
