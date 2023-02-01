import mongoose from "mongoose"

export default function dbConnect() {
	const MONGO_URI = process.env.MONGO_URI
	mongoose.set("strictQuery", true)
	mongoose.connect(MONGO_URI)
	mongoose.connection.on("disconnected", () => mongoose.connect(MONGO_URI))
}
