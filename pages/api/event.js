import nextConnect from "next-connect"
import Event from "../../models/Event"
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
		const { start, end } = req.query
		const findCorrectYearMonthEvents = await Event.find({
			start: { $gte: start },
			end: { $lt: end },
		})

		res.status(200).json({ events: findCorrectYearMonthEvents, success: true })
	} catch (e) {
		res.status(400).json({ success: false })
	}
})

handler.post(async function (req, res) {
	try {
		const newEvent = await new Event(req.body)
		newEvent.save()
		res
			.status(200)
			.json({ success: true, event: newEvent, message: "일정 등록 성공" })
	} catch (e) {
		console.log("err")
		res
			.status(400)
			.json({ success: false, message: "일정 등록 중 오류 발생" })
	}
})

handler.patch(async function (req, res) {
	try {
		const { id, title, start, end, memo, allDay } = req.body

		const updateEvent = await Event.findByIdAndUpdate(
			{ _id: id },
			{
				$set: { title, start, end, memo, allDay },
			},
		)
		res.status(200).json({ success: true, event: updateEvent, message:"일정 수정 성공" })
	} catch (e) {
		console.log(e)
		res.status(400).json({ success: false, error: e , message:'일정 수정 실패'})
	}
})

handler.delete(async function (req, res) {
	try {
		const { id } = req.body
		const deleteEvent = await Event.findByIdAndRemove(id)
		res.status(200).json({ success: true, event: deleteEvent, message:'일정 삭제 성공' })
	} catch (e) {
		res.status(400).json({ success: false, message:'일정 삭제 실패' })
	}
})
export default handler
