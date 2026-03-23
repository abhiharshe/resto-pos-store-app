/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    ],
    theme: {
        extend: {
            colors: {
                DRIVETHRU: "#ffb7a8",
                TAKEAWAY: "#fccb90",
                DINEIN: "#9bd0fd",
                DELIVERY: "#abdca5",
                primary: {
                    DEFAULT: "#C2410C", // dark orange
                    hover: "#9A3412",
                    dark: "#C2410C",
                },
                danger: "#DC2626",
                success: "#16A34A",
                alert: "#D97706",
                info: "#0284C7",
            }
        },
    },
    plugins: [],
}

