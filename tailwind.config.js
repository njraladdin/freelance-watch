/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				primary: '#0A84FF',
  				light: '#E5F1FF',
  				dark: '#0058B6'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			success: {
  				primary: '#34C759',
  				light: '#E3F9E7',
  				dark: '#248A3D'
  			},
  			warning: {
  				primary: '#FF9F0A',
  				light: '#FFF4E5',
  				dark: '#B36D00'
  			},
  			neutral: {
  				50: '#F9FAFB',
  				100: '#F3F4F6',
  				200: '#E5E7EB',
  				300: '#D1D5DB',
  				400: '#9CA3AF',
  				500: '#6B7280',
  				600: '#4B5563',
  				700: '#374151',
  				800: '#1F2937',
  				900: '#111827'
  			}
  		}
  	},
  	keyframes: {
  		'fade-in': {
  			'0%': { opacity: '0' },
  			'100%': { opacity: '1' },
  		}
  	},
  	animation: {
  		'fade-in': 'fade-in 0.2s ease-in-out',
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

