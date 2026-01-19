import mongoose, { Model, model, Types } from "mongoose";

export interface ISlot {
	_id?: Types.ObjectId;
	startTime: Date;
	endTime: Date;
	isBooked: boolean;
	userId: Types.ObjectId;
	bookedBy?: {
		name: string;
		avatar: string;
	};
}

const slotSchema = new mongoose.Schema(
	{
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		isBooked: { type: Boolean, default: false },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
	},
	{ timestamps: true },
);

export default (mongoose.models["slot"] as Model<ISlot>) ||
	(model("slot", slotSchema) as Model<ISlot>);
