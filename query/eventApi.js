import { api } from "./api"

const eventApi = api.injectEndpoints({
	endpoints: (builder) => ({
		addEvent: builder.mutation({
			query: (body) => {
				return {
					url: "event",
					method: "POST",
					body,
				}
			},
			invalidatesTags: ["Events"],
		}),

		getFilteredEvents: builder.query({
			query: ({ start, end }) => {
				return `event?start=${start}&end=${end}`
			},
			providesTags: ["Events"],
		}),

		editEvent: builder.mutation({
			query: ({ body }) => {
				return {
					url: "event",
					method: "PATCH",
					body,
				}
			},
			invalidatesTags: ["Events"],
		}),
		deleteEvent: builder.mutation({
			query: ({ id }) => {
				return {
					url: "event",
					method: "DELETE",
					body: { id },
				}
			},
			invalidatesTags: ["Events"],
		}),
	}),
})

export const {
	useAddEventMutation,
	useEditEventMutation,
	useDeleteEventMutation,
	useGetFilteredEventsQuery,
} = eventApi
