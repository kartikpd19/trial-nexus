/** @type {import('tailwindcss').Config} */
// Design tokens. Colors were sampled from the Home Page screenshot because the
// Figma MCP was rate-limited. Replace with get_variable_defs values for node 799:17608.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { DEFAULT: '#021B3A', 800: '#022247', 950: '#010E20' },
        ink: '#0B1530',
        muted: '#6B7591',
        line: '#E9EAF2',
        segment: '#EDEFF1',
        lavender: '#EEEEFA',
        mint: { bg: '#E3F5EC', fg: '#13804F' },
        footmuted: '#A9B6CF',
      },
      maxWidth: { page: '1200px', grid: '740px' },
      boxShadow: { card: '0 10px 24px -12px rgba(2,27,58,.25)' },
    },
  },
  plugins: [],
}
