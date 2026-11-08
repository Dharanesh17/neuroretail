import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to eliminate all icons EXCEPT Voice Assistant icons across the entire application
const VOICE_ASSISTANT_ICONS = new Set([
  'Mic',
  'MicOff',
  'Bot',
  'Brain',
  'Volume2',
  'Sparkles'
]);

function removeNonVoiceIconsPlugin() {
  return {
    name: 'remove-non-voice-icons',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('node_modules') && code.includes('lucide-react')) {
        return {
          code: code.replace(
            /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/g,
            (_match, imports) => {
              const items = imports
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => {
                  const parts = s.split(/\s+as\s+/);
                  return {
                    orig: parts[0].trim(),
                    local: parts[1] ? parts[1].trim() : parts[0].trim()
                  };
                });

              const kept = items.filter((it) => VOICE_ASSISTANT_ICONS.has(it.orig));
              const stripped = items.filter((it) => !VOICE_ASSISTANT_ICONS.has(it.orig));

              let result = '';
              if (kept.length > 0) {
                const importStr = kept.map((it) => it.orig === it.local ? it.orig : `${it.orig} as ${it.local}`).join(', ');
                result += `import { ${importStr} } from 'lucide-react';\n`;
              }
              if (stripped.length > 0) {
                result += stripped.map((it) => `const ${it.local} = () => null;`).join('\n') + '\n';
              }
              return result;
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
  plugins: [removeNonVoiceIconsPlugin(), react()],
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
