export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F4FB',
        line: { DEFAULT: '#E4E6EB', strong: '#D2D5DC' },
        ink: { DEFAULT: '#0E1016', soft: '#3A3F4B', muted: '#646A78', faint: '#9AA0AC' },
        brand: { blue: '#0B4FB3', violet: '#6556D9', magenta: '#C86AE6', tint: '#F1F0FE' },
        success: { DEFAULT: '#0F7A4D', soft: '#E6F5EE' },
        warning: { DEFAULT: '#945400', soft: '#FFF3DF' },
        danger: { DEFAULT: '#B42318', soft: '#FDECEA' },
        info: { DEFAULT: '#0B4FB3', soft: '#E8F0FC' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        doc: ['Poppins', 'sans-serif'],
        hand: ['"Architects Daughter"', 'cursive'],
        script: ['Allura', 'cursive'],
      },
      backgroundImage: {
        lingo: 'linear-gradient(90deg, #0546A9 0%, #5B5BCB 52%, #C76BE6 100%)',
      },
    },
  },
};
