import { ApiProvider } from "@reduxjs/toolkit/dist/query/react"
import { api } from "../query/api"
import "../styles/globals.css"
import "react-datepicker/dist/react-datepicker.css"
import { ToastMessageComponent } from "../components/UI/Toast-Message"

function MyApp({ Component, pageProps }) {
	return (
		<ApiProvider api={api}>
			<ToastMessageComponent />
			<Component {...pageProps} />
		</ApiProvider>
	)
}

export default MyApp
