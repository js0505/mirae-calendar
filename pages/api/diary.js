import nextConnect from "next-connect"
import Diary from "../../models/Diary"
import dbConnect from "../../lib/mongoose/db-connect"
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
		if (req.query.date) {
			const { date } = req.query

			const findDiary = await Diary.findOne({ date })

			res.status(200).json({ diary: findDiary, success: true })
		}

		if (req.query.start && req.query.end) {
			const { start, end } = req.query
			const findCorrectYearMonthDiarys = await Diary.find({
				date: { $gte: start, $lt: end },
			})
			res
				.status(200)
				.json({ diarys: findCorrectYearMonthDiarys, success: true })
		}
	} catch (e) {
		res.status(400).json({ success: false })
	}
})

handler.post(async function (req, res) {
	try {
		const newDiary = await new Diary(req.body)
		newDiary.save()
		res
			.status(200)
			.json({ success: true, diary: newDiary, message: "일기 등록 성공" })
	} catch (e) {
		console.log("err")
		res.status(400).json({ success: false, message: "일기 등록 중 오류 발생" })
	}
})

handler.patch(async function (req, res) {
	try {
		const { id, description } = req.body

		const updateDiary = await Diary.findByIdAndUpdate(
			{ _id: id },
			{
				$set: { description },
			},
		)
		res
			.status(200)
			.json({ success: true, diary: updateDiary, message: "일기 수정 완료." })
	} catch (e) {
		console.log(e)
		res
			.status(400)
			.json({ success: false, error: e, message: "일기 수정 중 오류 발생." })
	}
})
export default handler
