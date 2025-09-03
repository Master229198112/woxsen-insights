/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Simple color system that works
        primary: {
          DEFAULT: '#1f2937', // gray-800
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f3f4f6', // gray-100
          foreground: '#1f2937',
        },
        destructive: {
          DEFAULT: '#ef4444', // red-500
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f9fafb', // gray-50
          foreground: '#6b7280', // gray-500
        },
        accent: {
          DEFAULT: '#f3f4f6', // gray-100
          foreground: '#1f2937',
        },
        border: '#e5e7eb', // gray-200
        input: '#e5e7eb', // gray-200
        ring: '#3b82f6', // blue-500
        background: '#ffffff',
        foreground: '#1f2937',
      },
    },
  },
  plugins: [],
}
