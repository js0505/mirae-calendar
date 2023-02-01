import Head from "next/head"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"

import { Fragment, useEffect, useState } from "react"
import { Dialog, Switch, Transition } from "@headlessui/react"
import {
	useEditEventMutation,
	useGetFilteredEventsQuery,
} from "../query/eventApi"
import ReactDatePicker from "react-datepicker"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { toast } from "react-toastify"
import {
	useAddDiaryMutation,
	useEditDiaryMutation,
	useGetDiaryQuery,
	useGetFilteredDiarysQuery,
} from "../query/diaryApi"
import CreateEventModal from "../components/create-event"
import DeleteIcon from "../components/UI/icons/delete"

export default function Home() {
	const [events, setEvents] = useState([])
	const [dateModalEvents, setDateModalEvents] = useState([])
	const [modalDateStr, setModalDateStr] = useState("")
	const [isOpenDateClickModal, setIsOpenDateClickModal] = useState(false)
	const [isOpenCreateEventModal, setIsOpenCreateEventModal] = useState(false)
	const [initialDates, setInitialDates] = useState({})

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

	const onDateClickHandler = (arg) => {
		const clickedDate = arg.dateStr
		let filteredEvents = []
		events.forEach((item) => {
			if (item.start.slice(5, 10) === clickedDate.slice(5, 10)) {
				filteredEvents.push(item)
			}
		})
		setModalDateStr(clickedDate)
		setDateModalEvents(filteredEvents)
		setIsOpenDateClickModal(true)
	}

	useEffect(() => {
		setEvents([])
		if (eventsIsSuccess && diaryIsSuccess) {
			let editedDiary = []
			if (diarysData.length !== 0) {
				diarysData.diarys.map((diary) =>
					editedDiary.push({
						title: "📖",
						start: diary.date,
						color: "#bdc3c7",
						display: "background",
					}),
				)
			}
			setEvents((prevState) => [
				...prevState,
				...eventsData.events,
				...editedDiary,
			])
		}
	}, [eventsData, diarysData, initialDates])

	return (
		<div className="w-full h-screen flex justify-center items-center border">
			<Head>
				<title>Create Next App</title>
			</Head>

			{isOpenDateClickModal && (
				<DateClickModal
					events={dateModalEvents}
					open={isOpenDateClickModal}
					dateStr={modalDateStr}
					onClose={() => setIsOpenDateClickModal(false)}
				/>
			)}

			{isOpenCreateEventModal && (
				<CreateEventModal
					open={isOpenCreateEventModal}
					onClose={() => setIsOpenCreateEventModal(false)}
				/>
			)}
			<div className=" w-2/3">
				<FullCalendar
					datesSet={(date) =>
						setInitialDates((prevState) => ({
							...prevState,
							startStr: date.startStr,
							endStr: date.endStr,
						}))
					}
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					events={events}
					customButtons={{
						createEvent: {
							text: "Add Event",
							click: () => setIsOpenCreateEventModal(true),
						},
					}}
					headerToolbar={{
						left: "title",
						center: "",
						right: "createEvent today prev next",
					}}
					weekends={true}
					dateClick={onDateClickHandler}
					firstDay={1}
					contentHeight={800}
				/>
			</div>
		</div>
	)
}

function DateClickModal({ events, open, onClose, dateStr }) {
	const { data, isSuccess } = useGetDiaryQuery({ date: dateStr })
	const [diary, setDiary] = useState({ description: "", id: "" })
	const [addDiary] = useAddDiaryMutation()
	const [editDiary] = useEditDiaryMutation()

	useEffect(() => {
		if (isSuccess && data.diary !== null) {
			setDiary({ description: data.diary.description, id: data.diary._id })
		}
	}, [isSuccess, open])

	const submitFunction = async () => {
		// 데이터 없을 때 새 데이터 생성
		if (data.diary === null) {
			const body = {
				description: diary.description,
				date: dateStr,
			}

			const response = await addDiary(body)

			if (response.data.success) {
				toast.success(response.data.message)
			} else {
				toast.error(response.data.message)
			}
		} else {
			// 데이터 있을 때는 데이터 수정.
			const body = {
				id: diary.id,
				description: diary.description,
			}
			const response = await editDiary(body)

			if (response.data.success) {
				toast.success(response.data.message)
			} else {
				toast.error(response.data.message)
			}
		}
	}

	const year = dateStr.slice(0, 4)
	const month = dateStr.slice(5, 7)
	const day = dateStr.slice(8, 10)

	console.log(events)
	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog onClose={onClose} className="absolute z-50 ">
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
						<Dialog.Panel className="w-full max-w-xl h-fit rounded bg-white ">
							<div className="flex flex-col min-h-[30rem]">
								<Dialog.Title className="flex justify-between h-14 py-3 px-5 bg-[#2c3e50] ">
									<div className="text-xl text-white">{`${year}년 ${month}월 ${day}일`}</div>
								</Dialog.Title>

								<div className="flex p-2 ">
									<div className="w-full p-3 mb-4">
										<h2 className="text-xl font-semibold my-2">Events</h2>
										{events &&
											events.map((event) => {
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
														/>
													</div>
												)
											})}
									</div>
									<div className="w-full p-3 border-l-2 border-[#2c3e50] border-opacity-30 mb-4">
										<h2 className="text-xl font-semibold  my-2">Diary</h2>

										<div className="flex justify-center">
											<textarea
												className="resize-none w-full text-lg min-h-[20rem] p-2"
												id="diary"
												maxLength={500}
												rows={3}
												value={diary.description}
												onChange={(event) => {
													setDiary((prevState) => ({
														...prevState,
														description: event.target.value,
													}))
												}}
											></textarea>
										</div>
									</div>
								</div>
							</div>
							<div className=" h-14 py-2 px-4 flex justify-end bg-[#2c3e50] bg-opacity-10">
								<button
									type="button"
									onClick={submitFunction}
									className="border w-20 rounded-lg bg-[#2c3e50] text-white
								hover:bg-[#16a085] mr-2"
								>
									SAVE
								</button>
								<button
									type="button"
									onClick={onClose}
									className="border w-20 rounded-lg bg-[#2c3e50] text-white
								hover:bg-[#16a085]"
								>
									CANCEL
								</button>
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	)
}

function EventItemBar({ title, id, memo, start, end, allDay }) {
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
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
				/>
			)}
			<div className=" w-full  h-10  ">
				<ul className=" list-disc  ml-3">
					<li className="">
						<div className="flex justify-between items-center">
							<span className=" font-light min-w-[4rem]">
								{allDay ? "종일" : start.slice(11, 16)}
							</span>
							<span
								className="w-full cursor-pointer font-semibold text-lg"
								onClick={() => setIsUpdateModalOpen(true)}
							>
								{title}
							</span>

							<button className="w-16 h-10  flex justify-center items-center hover:bg-gray-100 rounded-full">
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
}) {
	const parseEndDate = new Date(end)
	const [startDate, setStartDate] = useState(new Date(start))
	const [endDate, setEndDate] = useState(
		parseEndDate.setDate(parseEndDate.getDate() - 1),
	)

	const [editEvent] = useEditEventMutation()

	const { register, handleSubmit, watch, reset } = useForm({
		mode: "onSubmit",
		defaultValues: {
			isAllDay: allDay,
			memo,
			title,
		},
	})

	const isAllDayChecked = watch("isAllDay")

	const submitFunction = async (formBody) => {
		const start = `${format(startDate, "yyyy-MM-dd")}${
			isAllDayChecked ? "" : `T${format(startDate, "HH:mm")}`
		}`

		const getEndDate = new Date(endDate)

		const end = `${
			isAllDayChecked
				? `${format(
						getEndDate.setDate(getEndDate.getDate() + 1),
						"yyyy-MM-dd",
				  )}`
				: start
		}`

		const body = {
			title: formBody.title,
			memo: formBody.memo,
			start,
			end,
			id: eventId,
			allDay: isAllDayChecked,
		}

		const response = await editEvent({ body })
		if (response.data.success) {
			toast.success(response.data.message)
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
									{...register("title")}
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
										selected={startDate}
										onChange={(date) => setStartDate(date)}
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
								<div>
									<ReactDatePicker
										className="text-center border h-10 cursor-pointer rounded-lg text-lg"
										selected={endDate}
										onChange={(date) => setEndDate(date)}
										dateFormat={"yyyy.MM.dd"}
									/>
								</div>

								{/* <div>
									<label>메모 : </label>
									<input
										type="textarea"
										className="border"
										{...register("memo")}
									/>
								</div> */}
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
