import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Dit helpt Vercel om imports zonder extensie (zoals './components/Navbar') te snappen
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  }
});