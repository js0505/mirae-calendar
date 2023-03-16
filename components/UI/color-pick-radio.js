import { RadioGroup } from "@headlessui/react"
import { useController } from "react-hook-form"

export function ColorPickRadio({ control }) {
	const {
		field: { onChange, value },
	} = useController({ name: "backgroundColor", control })

	return (
		<RadioGroup className={`my-2`} value={value} onChange={onChange}>
			<div className="flex w-full">
				{/* {eventColors.map((item) => (
					<RadioGroup.Option value={item} key={item} as={Fragment}>
						{({ active, checked }) => (
							<>
								<div
									style={{
										backgroundColor: `${item}`,
										opacity: `${checked ? 1 : 0.3}`,
									}}
									className={` w-6 h-6 mr-4 rounded-full cursor-pointer `}
								/>
							</>
						)}
					</RadioGroup.Option>
				))} */}

				<RadioGroup.Option value="#E67B73" key="#E67B73">
					{({ active, checked }) => (
						<>
							<div
								className={` w-6 h-6 mr-4 rounded-full cursor-pointer bg-[#E67B73] ${
									checked ? ` bg-opacity-100` : " bg-opacity-30"
								} border`}
							/>
						</>
					)}
				</RadioGroup.Option>
				<RadioGroup.Option value="#F5BF25" key="#F5BF25">
					{({ active, checked }) => (
						<>
							<div
								className={` w-6 h-6 mr-4 rounded-full cursor-pointer bg-[#F5BF25] ${
									checked ? ` bg-opacity-100` : " bg-opacity-30"
								} border`}
							/>
						</>
					)}
				</RadioGroup.Option>
				<RadioGroup.Option value="#16a085" key="#16a085">
					{({ active, checked }) => (
						<>
							<div
								className={` w-6 h-6 mr-4 rounded-full cursor-pointer bg-[#16a085] ${
									checked ? ` bg-opacity-100` : " bg-opacity-30"
								} border`}
							/>
						</>
					)}
				</RadioGroup.Option>

				<RadioGroup.Option value="#039BE5" key="#039BE5">
					{({ active, checked }) => (
						<>
							<div
								className={` w-6 h-6 mr-4 rounded-full cursor-pointer bg-[#039BE5] ${
									checked ? ` bg-opacity-100` : " bg-opacity-30"
								} border`}
							/>
						</>
					)}
				</RadioGroup.Option>
			</div>
		</RadioGroup>
	)
}
