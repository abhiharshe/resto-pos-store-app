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
                indigo: {
                    50: "oklch(98.5% 0 0)",
                    100: "oklch(96% 0.003 325.6)",
                    200: "oklch(92.2% 0.005 325.62)",
                    300: "oklch(86.5% 0.012 325.68)",
                    400: "oklch(71.1% 0.019 323.02)",
                    500: "oklch(54.2% 0.034 322.5)",
                    600: "oklch(43.5% 0.029 321.78)",
                    700: "oklch(36.4% 0.029 323.89)",
                    800: "oklch(26.3% 0.024 320.12)",
                    900: "oklch(21.2% 0.019 322.12)",
                    950: "oklch(14.5% 0.008 326)",
                },
                mauve: {
                    50: "oklch(98.5% 0 0)",
                    100: "oklch(96% 0.003 325.6)",
                    200: "oklch(92.2% 0.005 325.62)",
                    300: "oklch(86.5% 0.012 325.68)",
                    400: "oklch(71.1% 0.019 323.02)",
                    500: "oklch(54.2% 0.034 322.5)",
                    600: "oklch(43.5% 0.029 321.78)",
                    700: "oklch(36.4% 0.029 323.89)",
                    800: "oklch(26.3% 0.024 320.12)",
                    900: "oklch(21.2% 0.019 322.12)",
                    950: "oklch(14.5% 0.008 326)",
                },
                neutral: {
                    50: "oklch(98.5% 0 0)",
                    100: "oklch(97% 0 0)",
                    200: "oklch(92.2% 0 0)",
                    300: "oklch(87% 0 0)",
                    400: "oklch(70.8% 0 0)",
                    500: "oklch(55.6% 0 0)",
                    600: "oklch(43.9% 0 0)",
                    700: "oklch(37.1% 0 0)",
                    800: "oklch(26.9% 0 0)",
                    900: "oklch(20.5% 0 0)",
                    950: "oklch(14.5% 0 0)",
                },
                DRIVETHRU: "#ffb7a8",
                TAKEAWAY: "#fccb90",
                DINEIN: "#9bd0fd",
                DELIVERY: "#abdca5",
                primary: {
                    DEFAULT: "oklch(43.5% 0.029 321.78)", // mauve-600
                    hover: "oklch(36.4% 0.029 323.89)",   // mauve-700
                    dark: "oklch(54.2% 0.034 322.5)",     // mauve-500
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

