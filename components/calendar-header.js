import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
	useAddMonthlyGoalMutation,
	useLazyGetMonthlyGoalQuery,
} from "../query/monthlyGoalApi"
import { toast } from "react-toastify"

export default function CalendarHeader({ calendarRef }) {
	const [title, setTitle] = useState("")
	const [year, setYear] = useState("")
	const [month, setMonth] = useState("")
	const [isMonthlyGoalEditable, setIsMonthlyGoalEditable] = useState(true)

	// 연, 월 값으로 타이틀 만들어서 달마다 출력
	// 월별 목표 데이터 매 조회 시 마다 갱신 필요

	const {
		register,
		getValues,
		setValue,
		formState: { isDirty },
	} = useForm({
		mode: "onSubmit",
		defaultValues: { description: "" },
	})
	const [addMonthlyGoal] = useAddMonthlyGoalMutation()
	const [LazyGetMonthlyGoalTrigger] = useLazyGetMonthlyGoalQuery()

	useEffect(() => {
		setValue("description", "")
		const api = calendarRef.current?.getApi()
		if (api) {
			setTitle(format(api.getDate(), "yyyy년 M월"))
			setYear(String(api.getDate().getFullYear()))
			setMonth(String(api.getDate().getMonth() + 1))
			setValue
		}

		const getMonthlyGoalFunction = async () => {
			const { data } = await LazyGetMonthlyGoalTrigger({
				year,
				month,
			})

			setValue(
				"description",
				data.monthlyGoal ? data.monthlyGoal.description : "",
			)
		}

		getMonthlyGoalFunction()
	}, [calendarRef, year, month])

	const handleDateChange = async (direction) => {
		const api = calendarRef.current?.getApi()

		if (api) {
			if (direction === "prev") {
				api.prev()
			} else if (direction === "next") {
				api.next()
			} else {
				api.today()
			}
			setYear(String(api.getDate().getFullYear()))
			setMonth(String(api.getDate().getMonth() + 1))

			setTitle(format(api.getDate(), "yyyy년 M월"))
		}
	}

	const onEditMonthlyGoalHandler = async () => {
		if (isMonthlyGoalEditable) {
			setIsMonthlyGoalEditable(false)
			return
		}

		if (!isDirty) {
			setIsMonthlyGoalEditable(true)
			return
		}

		await onMonthlyGoalSubmit({ ...getValues(), year, month })
	}
	const monthlyGoalToggleButtonName = isMonthlyGoalEditable ? "edit" : "save"

	const onMonthlyGoalSubmit = async (formData) => {
		const { data } = await addMonthlyGoal({ ...formData, year, month })
		if (data.success) {
			toast.success(data.message)
		}
		setIsMonthlyGoalEditable(true)
	}

	return (
		<div className=" mx-2 mt-2 mb-5 flex justify-between">
			<div className="flex">
				<div className=" text-2xl">{title}</div>
				<div className="ml-8 flex">
					<textarea
						{...register("description")}
						disabled={isMonthlyGoalEditable}
						className=" text-sm resize-none w-80 p-2"
						rows={3}
						placeholder="이번달 목표를 입력 해주세요."
					></textarea>

					<div
						className="ml-2 cursor-pointer text-gray-400"
						onClick={onEditMonthlyGoalHandler}
					>
						{monthlyGoalToggleButtonName}
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center">
				<div className="flex h-10 ">
					<button
						className="text-white w-16 bg-[#2c3e50] hover:bg-[#16a085] mx-1"
						onClick={() => handleDateChange("prev")}
					>
						Prev
					</button>
					<button
						className="text-white w-16 bg-[#2c3e50] hover:bg-[#16a085] mx-1"
						onClick={() => handleDateChange("today")}
					>
						Today
					</button>
					<button
						className="text-white w-16 bg-[#2c3e50] hover:bg-[#16a085] mx-1"
						onClick={() => handleDateChange("next")}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	)
}
