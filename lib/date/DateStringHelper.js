import { format } from "date-fns"

export function dateStrHelper({ startDate, endDate, isAllDay }) {
	const start = `${format(startDate, "yyyy-MM-dd")}${
		isAllDay ? "" : `T${format(startDate, "HH:mm")}`
	}`

	const end = `${
		isAllDay
			? `${format(endDate.setDate(endDate.getDate() + 1), "yyyy-MM-dd")}`
			: start
	}`

	return { start, end }
}

/**
 *
 * 한국 표준시 값을 가진 Date 객체 변환
 * @param {object} startDate - 시작 일자
 * @param {object} endDate - 종료 일자
 * @param {boolean} isAllDay - 종일 이벤트 여부
 * @returns {string}
 */
export function krToUTCDateStrHelper({ startDate, endDate, isAllDay }) {
	// const start = `${format(startDate, "yyyy-MM-dd")}${
	// 	isAllDay
	// 		? ""
	// 		: `T${startDate.getUTCHours()}:${
	// 				startDate.getUTCMinutes().toString().length === 1
	// 					? `0${startDate.getUTCMinutes()}`
	// 					: startDate.getUTCMinutes()
	// 		  }`
	// }`
	// const end = `${
	// 	isAllDay
	// 		? `${format(endDate.setDate(endDate.getDate()), "yyyy-MM-dd")}`
	// 		: start
	// }`
	// return { start, end }
}
