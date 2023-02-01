import mongoose, { Schema } from "mongoose"

export const diarySchema = new Schema(
	{
		// title: { type: String },
		description: { type: String },
		date: { type: String },
	},
	{ timestamps: true },
)

export default mongoose.models.Diary || mongoose.model("Diary", diarySchema)
