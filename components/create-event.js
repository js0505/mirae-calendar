import { Dialog, Switch, Transition } from "@headlessui/react"
import { Fragment, useEffect } from "react"
import { useController, useForm } from "react-hook-form"
import { useAddEventMutation } from "../query/eventApi"
import { toast } from "react-toastify"
import ReactDatePicker from "react-datepicker"
import { ColorPickRadio } from "./UI/color-pick-radio"
import { eventColors } from "../lib/variables/variables"
import { dateStrHelper } from "../lib/date/DateStringHelper"

export default function CreateEventModal({ open, onClose, dateStr }) {
	const [addEvent] = useAddEventMutation()

	const { register, handleSubmit, watch, reset, control, setFocus, setValue } =
		useForm({
			mode: "onSubmit",
			defaultValues: {
				isAllDay: true,
				memo: "",
				title: "",
				backgroundColor: "#E67B73",
				startDate: new Date(dateStr),
				endDate: new Date(dateStr),
			},
		})

	const {
		field: { onChange: startOnChange, value: startValue },
	} = useController({ name: "startDate", control })
	const {
		field: { onChange: endOnChange, value: endValue },
	} = useController({ name: "endDate", control })

	useEffect(() => {
		setFocus("title")
	}, [setFocus])

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
			allDay: isAllDayChecked,
			backgroundColor,
			borderColor: backgroundColor,
		}

		const response = await addEvent(body)

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
								className=" w-full  h-full grid gap-6 grid-cols-8"
								onSubmit={handleSubmit(submitFunction)}
							>
								<div className="col-span-8 h-14 py-3 px-4  bg-[#2c3e50]">
									<h1 className="text-white text-xl">Add Event</h1>
								</div>
								<label className="text-right mr-4 col-span-2 text-lg leading-10">
									Title:
								</label>
								<input
									ref={function (ref) {
										if (ref !== null) {
											ref.focus()
										}
									}}
									type="text"
									className="border col-span-5 h-10 rounded-lg px-2 
									hover:bg-gray-500 hover:bg-opacity-20"
									placeholder="제목을 입력하세요."
									{...register("title", { required: true })}
								/>

								<label className="text-right mr-4 col-span-2 text-lg leading-10">
									All day:
								</label>
								<input
									type="checkbox"
									className="hidden"
									{...register("isAllDay")}
								/>
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
										className="text-white w-20 bg-[#2c3e50] hover:bg-[#16a085] rounded-md"
										type="submit"
									>
										SAVE
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
