import { api } from "./api"

const holidayApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getHoliday: builder.query({
			query: ({ solYear, ServiceKey }) => {
				return `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?numOfRows=20&solYear=${solYear}&ServiceKey=${ServiceKey}&_type=json`
			},
		}),
	}),
	tagTypes: ["Holiday"],
})

export const { useGetHolidayQuery } = holidayApi
