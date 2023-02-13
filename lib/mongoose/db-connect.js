import mongoose from "mongoose"

export default function dbConnect() {
	try {
		const MONGO_URI = process.env.MONGO_URI
		mongoose.set("strictQuery", true)
		mongoose.connect(MONGO_URI)
	} catch (e) {
		throw Error("DB Connect function Err")
	}
}
