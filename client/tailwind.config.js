/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4F46E5",     // Indigo
                secondary: "#64748B",   // Slate
                success: "#10B981",     // Emerald
                warning: "#F59E0B",     // Amber
                danger: "#EF4444",      // Rose/Red
                background: "#F8FAFC",  // Slate-50
                textColor: "#0F172A",   // Slate-900
                textMuted: "#475569",   // Slate-600
                card: "#FFFFFF",        // Card White
            },
        },
    },
    plugins: [],
}