/** @type {import('tailwindcss').Config} */
module.exports = {
  // تفعيل مسح الملفات في مجلد src
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // إعداد خط مخصص لدعم اللغة العربية بشكل أفضل
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
      },
      colors: {
        'primary': '#10b981', // Emerald green
        'secondary': '#3b82f6', // Blue
      },
    },
  },
  plugins: [],
};
