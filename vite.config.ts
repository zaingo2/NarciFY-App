import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose Vercel's environment variables to the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Fix: Expose PayPal Client ID to use process.env consistently across the app.
    'process.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(process.env.VITE_PAYPAL_CLIENT_ID),
  }
})