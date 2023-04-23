import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Fragment, useEffect, useRef, useState } from "react"
import { Dialog, Switch, Transition } from "@headlessui/react"
import {
	useDeleteEventMutation,
	useEditEventByIdMutation,
	useEditEventMutation,
	useGetFilteredEventsQuery,
	useLazyGetEventByIdQuery,
} from "../query/eventApi"
import ReactDatePicker from "react-datepicker"
import { useController, useForm } from "react-hook-form"
import { format, isAfter, isBefore, parseISO, sub } from "date-fns"
import { toast } from "react-toastify"
import {
	useAddDiaryMutation,
	useEditDiaryMutation,
	useGetDiaryQuery,
	useGetFilteredDiarysQuery,
} from "../query/diaryApi"
import { useGetHolidayQuery } from "../query/holidayApi"
import CreateEventModal from "../components/create-event"
import DeleteIcon from "../components/UI/icons/delete"
import { ColorPickRadio } from "../components/UI/color-pick-radio"
import { eventColors } from "../lib/variables/variables"
import { dateStrHelper } from "../lib/date/DateStringHelper"
import CalendarHeader from "../components/calendar-header"

export default function Home() {
	const [events, setEvents] = useState([])
	const [originalTitleEvents, setOriginalTitleEvents] = useState([])
	const [modalDateStr, setModalDateStr] = useState("")
	const [isOpenDateClickModal, setIsOpenDateClickModal] = useState(false)
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
	const [clickedEvent, setClickedEvent] = useState({
		title: "",
		memo: "",
		start: "",
		end: "",
		allDay: "",
		eventId: "",
		backgroundColor: "",
	})
	const [initialDates, setInitialDates] = useState({})

	const calendarRef = useRef(null)

	const [editEventById] = useEditEventByIdMutation()
	const [getEventByIdTrigger] = useLazyGetEventByIdQuery()

	const { data: eventsData, isSuccess: eventsIsSuccess } =
		useGetFilteredEventsQuery({
			start: initialDates.startStr,
			end: initialDates.endStr,
		})
	const { data: diarysData, isSuccess: diaryIsSuccess } =
		useGetFilteredDiarysQuery({
			start: initialDates.startStr,
			end: initialDates.endStr,
		})

	const { data: holidayData, isSuccess: holidayIsSuccess } = useGetHolidayQuery(
		{
			solYear: 2023,
			ServiceKey: process.env.HOLIDAY_API_KEY,
		},
	)

	const onDateClickHandler = (arg) => {
		const clickedDate = arg.dateStr
		setModalDateStr(clickedDate)
		setIsOpenDateClickModal(true)
	}

	const onEventClickHandler = async (arg) => {
		// onDateClickHandler 함수와 중복 실행되어 api측 오류 나타나서
		// 눌렀을 때 id가 없는건 빈 공간 클릭이라 판단하고 리턴.
		if (!arg.event._def.extendedProps._id) {
			return
		}
		const response = await getEventByIdTrigger({
			eventId: arg.event._def.extendedProps._id,
		})

		if (response.data) {
			setClickedEvent({
				title: response.data.event.title,
				memo: response.data.event.memo,
				start: response.data.event.start,
				end: response.data.event.end,
				allDay: response.data.event.allDay,
				backgroundColor: response.data.event.backgroundColor,
				eventId: response.data.event._id,
			})
			setIsUpdateModalOpen(true)
		}
	}

	const onEventDropHandler = async (arg) => {
		const allDay = arg.event._def.allDay

		/**
		 * dropped : 이벤트가 옮겨진 날짜의 데이터
		 * 종료일은 하루가 더 길게 생성되어 하루를 뺀 데이터로 가공.
		 */
		const droppedStart = arg.event._instance.range.start
		const droppedEnd = allDay
			? sub(arg.event._instance.range.end, { days: 1 })
			: droppedStart
		const oldEventStart = arg.oldEvent._instance.range.start
		// const oldEventEnd = arg.oldEvent._instance.range.end

		/**
		 * 옮긴 시작 일자
		 * getMonth or getUTCMonth 는 월을 0~11로 표현해서 +1을 해줌
		 */

		const droppedStartYear = droppedStart.getUTCFullYear()
		const droppedStartMonth = droppedStart.getUTCMonth() + 1
		const droppedStartDate = droppedStart.getUTCDate()

		const droppedStartMonthString = `${
			droppedStartMonth.toString().length === 1
				? `0${droppedStartMonth}`
				: `${droppedStartMonth}`
		}`
		const droppedStartDateString = `${
			droppedStartDate.toString().length === 1
				? `0${droppedStartDate}`
				: droppedStartDate
		}`

		/**
		 * 옮긴 종료 일자
		 */

		const droppedEndYear = droppedEnd.getUTCFullYear()
		const droppedEndMonth = droppedEnd.getUTCMonth() + 1
		const droppedEndDate = droppedEnd.getUTCDate()

		const droppedEndMonthString = `${
			droppedEndMonth.toString().length === 1
				? `0${droppedEndMonth}`
				: `${droppedEndMonth}`
		}`
		const droppedEndDateString = `${
			droppedEndDate.toString().length === 1
				? `0${droppedEndDate}`
				: droppedEndDate
		}`

		/**
		 * 기존 이벤트의 시간 값
		 */

		const oldEventStartHour = `${
			oldEventStart.getUTCHours() < 10
				? `0${oldEventStart.getUTCHours()}`
				: oldEventStart.getUTCHours()
		}`
		const oldEventStartMinute = `${
			oldEventStart.getUTCMinutes() < 10
				? `0${oldEventStart.getUTCMinutes()}`
				: oldEventStart.getUTCMinutes()
		}`
		const oldEventStartTime = `${oldEventStartHour}:${oldEventStartMinute}`

		/**
		 * 옮긴 새로운 날짜 + 기존 이벤트 시간
		 */

		const startDate = `${droppedStartYear}-${droppedStartMonthString}-${droppedStartDateString}${
			allDay ? "" : `T${oldEventStartTime}`
		}`
		const endDate = `${droppedEndYear}-${droppedEndMonthString}-${droppedEndDateString}${
			allDay ? "" : `T${oldEventStartTime}`
		}`

		const eventId = arg.event._def.extendedProps._id

		const response = await editEventById({
			start: startDate,
			end: endDate,
			eventId,
		})
		if (response.data.success) {
			toast.success(response.data.message)
		} else {
			toast.error(response.data.message)
		}
	}

	useEffect(() => {
		setEvents([])
		setOriginalTitleEvents([])
		let editedDiary = []
		let editedHoliday = []
		let editedEvent = []
		if (eventsIsSuccess && diaryIsSuccess && holidayIsSuccess) {
			if (eventsData.events.length !== 0) {
				eventsData.events.map((event) => {
					editedEvent.push({
						...event,
						title:
							event.allDay === false
								? event.title.length > 9
									? `${event.title.slice(0, 8)} ・・・`
									: event.title
								: event.title,
						// todo: 종일 일정의 시작, 끝이 하루 이상이면 그대로 나오고 아니면 줄여지게
					})
				})
			}
			if (diarysData.length !== 0) {
				diarysData.diarys.map((diary) =>
					editedDiary.push({
						title: "📖",
						start: diary.date,
						color: "transparent",
						classNames: ["text-right", "mr-9"],
						display: "background",
					}),
				)
			}

			if (holidayData.response.body.items.length !== 0) {
				holidayData.response.body.items.item.map((holiday) => {
					const year = holiday.locdate.toString().slice(0, 4)
					const month = holiday.locdate.toString().slice(4, 6)
					const day = holiday.locdate.toString().slice(6, 8)
					const date = `${year}-${month}-${day}`
					const dateISO = parseISO(date)

					if (
						isAfter(dateISO, parseISO(initialDates.startStr)) &&
						isBefore(dateISO, parseISO(initialDates.endStr))
					) {
						editedHoliday.push({
							title: holiday.dateName,
							start: date,
							backgroundColor: "transparent",
							display: "background",
							classNames: ["text-red-600"],
						})
					}
				})
			}
			setOriginalTitleEvents([...eventsData.events])
			setEvents((prevState) => [
				...prevState,
				// ...eventsData.events,
				...editedEvent,
				...editedDiary,
				...editedHoliday,
			])
		}
	}, [eventsData, diarysData, initialDates, holidayData])

	return (
		<div className=" h-screen my-2 flex justify-center items-center ">
			{isOpenDateClickModal && (
				<DateClickModal
					events={originalTitleEvents}
					open={isOpenDateClickModal}
					dateStr={modalDateStr}
					onClose={() => setIsOpenDateClickModal(false)}
				/>
			)}
			{isUpdateModalOpen && (
				<UpdateEventModal
					onClose={() => setIsUpdateModalOpen(false)}
					open={isUpdateModalOpen}
					{...clickedEvent}
				/>
			)}

			<div className=" lg:w-3/4  h-full">
				{/* 커스텀 달력 헤더부분 시작 */}
				<CalendarHeader calendarRef={calendarRef} />
				{/* 커스텀 달력 헤더부분 끝 */}
				<FullCalendar
					dayHeaders={false}
					ref={calendarRef}
					eventTimeFormat={{
						hour: "numeric",
						minute: "2-digit",
						omitZeroMinute: true,
						meridiem: "short",
					}}
					eventStartEditable={true}
					eventClick={onEventClickHandler}
					eventDrop={onEventDropHandler}
					viewClassNames="p-3"
					expandRows={true}
					dayMaxEventRows={4}
					// locale="ko"
					customButtons={{
						monthlyGoalForm: {},
					}}
					datesSet={(date) => {
						setInitialDates((prevState) => ({
							...prevState,
							startStr: date.startStr,
							endStr: date.endStr,
						}))
					}}
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					eventSources={[events]}
					headerToolbar={false}
					// headerToolbar={{
					// 	left: "title",
					// 	center: "",
					// 	right: "today prev next",
					// }}
					weekends={true}
					dateClick={onDateClickHandler}
					firstDay={7}
					contentHeight={800}
				/>
			</div>
		</div>
	)
}

function DateClickModal({ events, open, onClose, dateStr }) {
	const [filteredEvents, setFilteredEvents] = useState([])
	const [isOpenCreateEventModal, setIsOpenCreateEventModal] = useState(false)
	const [isDiaryEditable, setIsDiaryEditable] = useState(false)

	const { data, isSuccess } = useGetDiaryQuery({ date: dateStr })

	const [addDiary] = useAddDiaryMutation()
	const [editDiary] = useEditDiaryMutation()

	const year = dateStr.slice(0, 4)
	const month = dateStr.slice(5, 7)
	const day = dateStr.slice(8, 10)

	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		setFocus,
		formState: { isDirty: isDiaryDirty },
	} = useForm({
		mode: "onSubmit",
		defaultValues: { diaryDesc: "", diaryId: "", isSubmitted: false },
	})
	useEffect(() => {
		if (isSuccess && data.diary !== null) {
			setValue("diaryDesc", data.diary.description)
			setValue("diaryId", data.diary._id)
		}
		if (events) {
			let arr = []
			events.forEach((item) => {
				if (item.start.slice(5, 10) === dateStr.slice(5, 10)) {
					arr.push(item)
				}
			})
			setFilteredEvents(arr)
		}
		if (isDiaryEditable) setFocus("diaryDesc")
	}, [isDiaryEditable, events, data])

	const editDiaryToggle = () => {
		setIsDiaryEditable(!isDiaryEditable)
	}

	const submitFunction = async (formData) => {
		// 일기 아무것도 안쓰고 저장 누르면 리턴.
		// 변경사항이 없는지도 체크
		const { diaryDesc, diaryId } = formData
		if (diaryDesc === "" && isDiaryDirty === false) {
			return
		}

		// 데이터 없을 때 새 데이터 생성
		if (data.diary === null) {
			const body = {
				description: diaryDesc,
				date: dateStr,
			}

			const response = await addDiary(body)

			if (response.data.success) {
				toast.success(response.data.message)
				setValue("isSubmitted", true)
			} else {
				toast.error(response.data.message)
			}
		} else {
			// 데이터 있을 때는 데이터 수정.
			const body = {
				id: diaryId,
				description: diaryDesc,
			}
			const response = await editDiary(body)

			if (response.data.success) {
				toast.success(response.data.message)
				setValue("isSubmitted", true)
			} else {
				toast.error(response.data.message)
			}
		}
	}

	const closeModalFunction = async () => {
		const isSubmittedWatch = getValues("isSubmitted")
		if (!isDiaryDirty || isSubmittedWatch) {
			onClose()
		} else {
			const accept = confirm("변경된 내용을 저장 하시겠습니까?")
			if (!accept) {
				onClose()
				return
			}
			await submitFunction(getValues())
			onClose()
		}
	}

	return (
		<>
			{isOpenCreateEventModal && (
				<CreateEventModal
					open={isOpenCreateEventModal}
					onClose={() => setIsOpenCreateEventModal(false)}
					dateStr={dateStr}
				/>
			)}
			<Transition appear show={open} as={Fragment}>
				<Dialog
					// onClose={onClose}
					className="absolute z-50 "
					onClose={closeModalFunction}
				>
					<div className="fixed inset-0 flex items-center justify-center p-4  bg-gray-500 bg-opacity-50">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-3xl h-fit rounded bg-white ">
								<div className="flex flex-col min-h-[30rem]">
									<Dialog.Title className="flex justify-between h-14 py-3 px-5 bg-[#2c3e50] ">
										<div className="text-xl text-white">{`${year}년 ${month}월 ${day}일`}</div>
									</Dialog.Title>

									<div className="flex p-2 ">
										<div className="w-full p-3 mb-4">
											<div className="flex justify-between">
												<h2 className="text-xl font-semibold my-2">Events</h2>
												<p
													className="text-2xl mt-2 rounded-3xl mr-1 w-9 hover:bg-opacity-40 text-center cursor-pointer hover:bg-[#16a085] hover:text-white"
													onClick={() => setIsOpenCreateEventModal(true)}
												>
													+
												</p>
											</div>
											{filteredEvents &&
												filteredEvents.map((event) => {
													if (!event._id) {
														return
													}
													return (
														<div className="w-full" key={event._id}>
															<EventItemBar
																key={event._id}
																id={event._id}
																title={event.title}
																memo={event.memo}
																start={event.start}
																end={event.end}
																allDay={event.allDay}
																backgroundColor={event.backgroundColor || ""}
															/>
														</div>
													)
												})}
										</div>
										<form
											className="w-full p-3 border-l-2 border-[#2c3e50] border-opacity-30 mb-4"
											onSubmit={handleSubmit(submitFunction)}
										>
											<div className="flex justify-between">
												<h2 className="text-xl font-semibold my-2">Diary</h2>
												<div className="flex">
													<button
														type="button"
														className="py-3 mr-2"
														onClick={editDiaryToggle}
													>
														edit
													</button>
												</div>
											</div>

											<div className="flex justify-center">
												<textarea
													className="resize-none w-full text-sm min-h-[20rem] p-2 "
													id="diaryDesc"
													maxLength={20000}
													rows={3}
													disabled={!isDiaryEditable}
													{...register("diaryDesc")}
												></textarea>
											</div>
										</form>
									</div>
								</div>
								<div className=" h-14 py-2 px-4 flex justify-end bg-[#2c3e50] bg-opacity-10">
									<button
										type="button"
										onClick={() => submitFunction(getValues())}
										className="border w-20 rounded-lg bg-[#2c3e50] text-white
								hover:bg-[#16a085] mr-2"
									>
										SAVE
									</button>
									<button
										type="button"
										onClick={closeModalFunction}
										className="border w-20 rounded-lg bg-[#2c3e50] text-white
								hover:bg-[#16a085]"
									>
										CLOSE
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition>
		</>
	)
}

function EventItemBar({
	title,
	id,
	memo,
	start,
	end,
	allDay,
	backgroundColor,
}) {
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
	const [deleteEvent] = useDeleteEventMutation()
	const deleteEventHandler = async () => {
		const accept = confirm("삭제 하시겠습니까?")
		if (!accept) return

		const response = await deleteEvent({ id })

		if (response.data.success) {
			toast.success(response.data.message)
		} else {
			toast.error(response.data.message)
		}
	}
	return (
		<>
			{isUpdateModalOpen && (
				<UpdateEventModal
					onClose={() => setIsUpdateModalOpen(false)}
					open={isUpdateModalOpen}
					title={title}
					memo={memo}
					start={start}
					end={end}
					allDay={allDay}
					eventId={id}
					backgroundColor={backgroundColor}
				/>
			)}
			<div className=" w-full  h-10  ">
				<ul className="">
					<li className="">
						<div className="flex justify-between items-center">
							<span
								className="w-6 h-4 mr-2 rounded-full"
								style={{ backgroundColor: `${backgroundColor}` }}
							/>
							<span className=" font-light min-w-[4rem]">
								{allDay ? "종일" : start.slice(11, 16)}
							</span>
							<span
								className="w-full cursor-pointer font-semibold text-lg"
								onClick={() => setIsUpdateModalOpen(true)}
							>
								{title}
							</span>

							<button
								onClick={deleteEventHandler}
								className="w-16 h-10  flex justify-center items-center hover:bg-gray-100 rounded-full"
							>
								<DeleteIcon />
							</button>
						</div>
					</li>
				</ul>
			</div>
		</>
	)
}

function UpdateEventModal({
	onClose,
	open,
	title,
	eventId,
	memo,
	start,
	end,
	allDay,
	backgroundColor,
}) {
	const [editEvent] = useEditEventMutation()

	const { register, handleSubmit, watch, reset, control } = useForm({
		mode: "onSubmit",
		defaultValues: {
			isAllDay: allDay,
			memo,
			title,
			backgroundColor,
			startDate: new Date(start),
			endDate: sub(new Date(end), { days: 1 }),
		},
	})

	const {
		field: { onChange: startOnChange, value: startValue },
	} = useController({ name: "startDate", control })
	const {
		field: { onChange: endOnChange, value: endValue },
	} = useController({ name: "endDate", control })

	const isAllDayChecked = watch("isAllDay")

	const submitFunction = async (formBody) => {
		const { startDate, endDate, title, memo, backgroundColor } = formBody

		const { start, end } = dateStrHelper({
			startDate,
			endDate,
			isAllDay: isAllDayChecked,
		})

		const body = {
			title,
			memo,
			start,
			end,
			id: eventId,
			allDay: isAllDayChecked,
			backgroundColor,
			borderColor: backgroundColor,
		}

		const response = await editEvent({ body })
		if (response.data.success) {
			toast.success(response.data.message)
			onClose()
		} else {
			toast.error(response.data.message)
		}
	}
	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog onClose={onClose} className="absolute z-50">
				<div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<Dialog.Panel
							className="z-50 w-[30rem] h-fit bg-white
					 shadow-xl rounded-md"
						>
							<form
								className="w-full  h-full grid gap-6 grid-cols-8"
								onSubmit={handleSubmit((formBody) => submitFunction(formBody))}
							>
								<div className="col-span-8 h-14 py-3 px-4  bg-[#2c3e50]">
									<h1 className="text-white text-xl">Edit Event</h1>
								</div>

								<label className="text-right mr-4 col-span-2 text-lg leading-10">
									Title:
								</label>
								<input
									type="text"
									className="border col-span-5 h-10 rounded-lg px-2 
									hover:bg-gray-500 hover:bg-opacity-20"
									{...register("title", { required: true })}
								/>

								<label className="text-right mr-4 col-span-2 text-lg leading-10">
									All day:
								</label>
								<div className="col-span-6 h-10 py-2">
									<Switch
										checked={isAllDayChecked}
										onChange={() => reset({ isAllDay: !isAllDayChecked })}
										className={`${
											isAllDayChecked ? "bg-[#2c3e50]" : "bg-gray-200"
										} relative inline-flex h-6 w-11 items-center rounded-full`}
									>
										<span className="sr-only">Enable notifications</span>
										<span
											className={`${
												isAllDayChecked ? "translate-x-6" : "translate-x-1"
											} inline-block h-4 w-4 transform rounded-full bg-white transition`}
										/>
									</Switch>
								</div>

								<label
									className={
										"text-right mr-4 col-span-2 w-full text-lg leading-10"
									}
								>
									Start date:
								</label>
								<div className="col-span-6">
									<ReactDatePicker
										className="text-center border cursor-pointer h-10 rounded-lg text-lg"
										selected={startValue}
										onChange={(date) => startOnChange(date)}
										showTimeSelect={!isAllDayChecked}
										timeFormat="HH:mm"
										timeIntervals={30}
										timeCaption="time"
										dateFormat={`${
											isAllDayChecked ? "yyyy.MM.dd" : "yyyy.MM.dd  h:mm aa"
										}`}
									/>
								</div>

								<label
									className={`text-right col-span-2 text-lg leading-10 ${
										isAllDayChecked ? "block" : "hidden"
									}`}
								>
									End date:
								</label>
								<div
									className={`${
										isAllDayChecked ? "block" : "hidden"
									} col-span-6`}
								>
									<ReactDatePicker
										className="text-center border h-10 cursor-pointer rounded-lg text-lg"
										selected={endValue}
										onChange={(date) => endOnChange(date)}
										dateFormat={"yyyy.MM.dd"}
									/>
								</div>

								<label className="text-right mr-4 col-span-2 text-lg leading-10">
									Color:
								</label>
								<div className="col-span-6">
									<ColorPickRadio colors={eventColors} control={control} />
								</div>
								<div className="col-span-8  h-14 py-2 px-4 flex justify-end bg-[#2c3e50] bg-opacity-20">
									<button
										className="text-white w-20 bg-[#2c3e50] hover:bg-[#16a085] rounded-md mr-2"
										type="submit"
									>
										SAVE
									</button>
									<button
										className="text-white w-20 bg-[#2c3e50] hover:bg-[#16a085] rounded-md"
										type="button"
										onClick={onClose}
									>
										CANCEL
									</button>
								</div>
							</form>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	)
}
