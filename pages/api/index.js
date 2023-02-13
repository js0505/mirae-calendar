import nextConnect from "next-connect"

const handler = nextConnect()

handler.get(async function (req, res) {
	res.status(200).json({ message: "서버 연결 성공", success: true })
})

export default handler
