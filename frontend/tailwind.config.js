/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            colors: {
                forest: '#2F4F4F',
                bone: '#F5F5DC',
                matcha: '#8FBC8F',
                bark: '#5D4037',
            },
            fontFamily: {
                headers: ['"Cormorant Garamond"', 'serif'],
                body: ['"Mulish"', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            },
        },
    },
    plugins: [],
}
