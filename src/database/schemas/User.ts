import mongoose, { Model, model, Schema, SchemaTypes, Types } from "mongoose";

export interface IUser {
	_id: Types.ObjectId;
	slackId: string;
	name: string;
	avatar: string;
}

const userSchema: Schema<IUser> = new Schema({
	slackId: SchemaTypes.String,
	name: SchemaTypes.String,
	avatar: SchemaTypes.String,
});

export default (mongoose.models["user"] as Model<IUser>) ||
	(model("user", userSchema) as Model<IUser>);
