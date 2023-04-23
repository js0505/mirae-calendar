import mongoose, { Schema } from "mongoose"

export const monthlyGoalSchema = new Schema(
	{
		description: { type: String },
		year: { type: String },
		month: { type: String },
	},
	{ timestamps: true },
)

export default mongoose.models.MonthlyGoal ||
	mongoose.model("MonthlyGoal", monthlyGoalSchema)
