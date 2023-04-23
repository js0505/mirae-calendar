import nextConnect from "next-connect"
import dbConnect from "../../lib/mongoose/db-connect"
import MonthlyGoal from "../../models/MonthlyGoal"

const handler = nextConnect()

handler.use((req, res, next) => {
	try {
		dbConnect()
		next()
	} catch (e) {
		res.status(400).json({ error: e, message: "DB Connect Failed" })
	}
})
handler.get(async function (req, res) {
	try {
		const { year, month } = req.query
		const monthlyGoal = await MonthlyGoal.findOne({ year, month })

		res.status(200).json({
			monthlyGoal: monthlyGoal ? monthlyGoal : { year, month, description: "" },
			success: true,
		})
	} catch (e) {
		res.status(400).json({ success: false, message: "월간 목표 불러오기 실패" })
	}
})

handler.post(async function (req, res) {
	try {
		const { year, month, description } = req.body

		if (await isExsistMonthlyGoalData({ year, month })) {
			await MonthlyGoal.findOneAndUpdate(
				{ year, month },
				{ $set: { description } },
			)

			res.status(200).json({ success: true, message: "수정 성공." })
			return
		}
		const newMonthlyGoal = await new MonthlyGoal({ year, month, description })
		newMonthlyGoal.save()

		res.status(200).json({ success: true, message: "등록 성공." })
	} catch (e) {
		res
			.status(400)
			.json({ success: false, message: "월간 목표 입력 중 오류 발생" })
	}
})

async function isExsistMonthlyGoalData({ year, month }) {
	const data = await MonthlyGoal.findOne({ year, month })
	if (data) {
		return true
	} else {
		return false
	}
}

export default handler
