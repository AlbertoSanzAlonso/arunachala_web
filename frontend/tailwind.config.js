/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

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
                // Map 'primary' to a Palette based on Forest (#2F4F4F) and Matcha
                primary: {
                    50: '#f4f7f7',
                    100: '#e0ebeb',
                    200: '#c2dada',
                    300: '#9bc0c0',
                    400: '#8FBC8F', // Matcha
                    500: '#528a8a',
                    600: '#2F4F4F', // Forest
                    700: '#264040',
                    800: '#1f3333',
                    900: '#1a2a2a',
                    950: '#0e1717',
                }
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
