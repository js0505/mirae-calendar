import { api } from "./api"

const diaryApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getFilteredDiarys: builder.query({
			query: ({ start, end }) => {
				if (!start) {
					return ""
				}
				return `/api/diary?start=${start}&end=${end}`
			},
			providesTags: ["Diary"],
		}),
		addDiary: builder.mutation({
			query: (body) => {
				return {
					url: "/api/diary",
					method: "POST",
					body,
				}
			},
			invalidatesTags: ["Diary"],
		}),

		getDiary: builder.query({
			query: ({ date }) => {
				return `/api/diary?date=${date}`
			},
			providesTags: ["Diary"],
		}),

		editDiary: builder.mutation({
			query: (body) => {
				return {
					url: "/api/diary",
					method: "PATCH",
					body,
				}
			},
			invalidatesTags: ["Diary"],
		}),
	}),
})

export const {
	useGetFilteredDiarysQuery,

	useAddDiaryMutation,
	useGetDiaryQuery,
	useEditDiaryMutation,
} = diaryApi
