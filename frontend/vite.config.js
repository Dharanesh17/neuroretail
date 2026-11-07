import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to eliminate all Lucide icons across the entire application
function removeLucideIconsPlugin() {
  return {
    name: 'remove-lucide-icons',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('node_modules') && code.includes('lucide-react')) {
        return {
          code: code.replace(
            /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/g,
            (_match, imports) => {
              const names = imports
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => {
                  const parts = s.split(/\s+as\s+/);
                  return parts[1] ? parts[1].trim() : parts[0].trim();
                });
              return names.map((n) => `const ${n} = () => null;`).join('\n');
            }
          ),
          map: null
        };
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [removeLucideIconsPlugin(), react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
