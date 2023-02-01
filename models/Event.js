import mongoose, { Schema } from "mongoose"

export const eventSchema = new Schema(
	{
		title: {
			type: String,
		},
		start: {
			type: String,
		},
		startStr: {
			type: String,
		},
		end: {
			type: String,
		},
		endStr: {
			type: String,
		},
		backgroundColor: {
			type: String,
		},
		memo: {
			type: String,
		},
		allDay: {
			type: Boolean,
		},
	},
	{ timestamps: true },
)

export default mongoose.models.Event || mongoose.model("Event", eventSchema)
