/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS Değişkenlerinden Okunan Renkler (Dark Mode Destekli)
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'accent': 'var(--color-accent)',
        'border': 'var(--color-border)',
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
