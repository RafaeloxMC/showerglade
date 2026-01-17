import mongoose, { Model, model, Schema, SchemaTypes, Types } from "mongoose";

export interface ISession {
	_id: Types.ObjectId;
	token: string;
	userId: string;
	slackId: string;
	expiresAt: Date;
}

const sessionSchema: Schema<ISession> = new Schema({
	token: SchemaTypes.String,
	userId: SchemaTypes.String,
	slackId: SchemaTypes.String,
	expiresAt: SchemaTypes.Date,
});

export default (mongoose.models["session"] as Model<ISession>) ||
	(model("session", sessionSchema) as Model<ISession>);
