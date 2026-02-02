/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ana Renkler - Düz (Solid), Gradient Yok
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        'text-primary': '#1A1A1A',
        'text-secondary': '#666666',
        'accent': '#2563EB',
        'border': '#E5E5E5',
        // Ders Renkleri - Soft, Profesyonel Tonlar
        'course-1': '#DBEAFE',
        'course-2': '#FEE2E2',
        'course-3': '#D1FAE5',
        'course-4': '#FEF3C7',
        'course-5': '#E9D5FF',
        'course-6': '#CFFAFE',
        'course-7': '#FCE7F3',
        'course-8': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
