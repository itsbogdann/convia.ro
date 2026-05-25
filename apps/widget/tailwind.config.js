/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: 'lr-', // Prefix all classes with 'lr-' to avoid conflicts
  theme: {
    extend: {
      colors: {
        primary: 'var(--lr-primary-color, #335cff)',
      },
      spacing: {
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
  // Important for embedding - don't reset base styles
  corePlugins: {
    preflight: false,
  },
};
