import { api } from "./api"

const eventApi = api.injectEndpoints({
	endpoints: (builder) => ({
		addEvent: builder.mutation({
			query: (body) => {
				return {
					url: "/api/event",
					method: "POST",
					body,
				}
			},
			invalidatesTags: ["Events"],
		}),
		getEventById: builder.query({
			query: ({ eventId }) => {
				return {
					url: `/api/event/${eventId}`,
					method: "GET",
				}
			},
		}),
		editEventById: builder.mutation({
			query: ({ start, end, eventId }) => {
				return {
					url: `/api/event/${eventId}`,
					method: "PATCH",
					body: { start, end },
				}
			},
			invalidatesTags: ["Events"],
		}),

		getFilteredEvents: builder.query({
			query: ({ start, end }) => {
				return `/api/event?start=${start}&end=${end}`
			},
			providesTags: ["Events"],
		}),

		editEvent: builder.mutation({
			query: ({ body }) => {
				return {
					url: "/api/event",
					method: "PATCH",
					body,
				}
			},
			invalidatesTags: ["Events"],
		}),
		deleteEvent: builder.mutation({
			query: ({ id }) => {
				return {
					url: "/api/event",
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
	useLazyGetEventByIdQuery,
	useEditEventMutation,
	useEditEventByIdMutation,
	useDeleteEventMutation,
	useGetFilteredEventsQuery,
} = eventApi
