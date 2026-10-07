export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        background: '#F8FAFC', // Crisp light backdrop
        surface: '#FFFFFF', // Clean white card surface
        surfaceLight: '#F1F5F9', // Soft slate surface
        pitch: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Secondary Green Accent
          600: '#059669',
          700: '#047857',
        },
        gold: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Aliased to primary blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Royal Blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        textPrimary: '#0F172A', // Deep Slate 900
        textSecondary: '#64748B', // Slate 500
        borderLight: '#E2E8F0', // Soft Slate 200
        borderGold: '#CBD5E1',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        'gold': '0 4px 15px -1px rgba(37, 99, 235, 0.2)',
        'gold-lg': '0 10px 25px -5px rgba(37, 99, 235, 0.35)',
        'pitch': '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
