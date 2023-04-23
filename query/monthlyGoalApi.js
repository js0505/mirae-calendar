import { api } from "./api"

const monthlyGoalApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getMonthlyGoal: builder.query({
			query: ({ year, month }) => {
				return `/api/monthly-goal?year=${year}&month=${month}`
			},
		}),
		addMonthlyGoal: builder.mutation({
			query: (body) => {
				return {
					url: "/api/monthly-goal",
					method: "POST",
					body,
				}
			},
		}),
	}),
	// tagTypes: [""],
})

export const { useLazyGetMonthlyGoalQuery, useAddMonthlyGoalMutation } =
	monthlyGoalApi
