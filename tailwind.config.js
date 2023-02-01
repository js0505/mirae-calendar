/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			height: {
				"50vh": "50vh",
				"65vh": "65vh",
				"70vh": "70vh",
				"90vh": "90vh",
				"100vh": "100vh",
			},
		},
	},
	plugins: [],
}
