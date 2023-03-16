import nextConnect from "next-connect"
import Event from "../../../models/Event"
import dbConnect from "../../../lib/mongoose/db-connect"
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
		const { eventId } = req.query
		const event = await Event.findById(eventId)

		res.status(200).json({ event, success: true })
	} catch (e) {
		console.log(e)
		res
			.status(400)
			.json({ success: false, message: "이벤트를 찾지 못했습니다." })
	}
})

handler.patch(async function (req, res) {
	try {
		const { eventId } = req.query
		const { start, end } = req.body

		const updateEvent = await Event.findByIdAndUpdate(
			{ _id: eventId },
			{
				$set: { start, end },
			},
		)
		res
			.status(200)
			.json({ success: true, event: updateEvent, message: "일자 변경 성공" })
	} catch (e) {
		console.log(e)
		res
			.status(400)
			.json({ success: false, error: e, message: "일자 수정 실패" })
	}
})
export default handler
