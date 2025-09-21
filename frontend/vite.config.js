
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to mock CSS imports as empty objects in test
function mockCssPlugin() {
  return {
    name: 'mock-css',
    resolveId(source) {
      if (source.match(/\.css$/)) {
        return source;
      }
      return null;
    },
    load(id) {
      if (id.match(/\.css$/)) {
        return 'export default {}';
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    // Only use the CSS mock plugin in test mode
    process.env.NODE_ENV === 'test' && mockCssPlugin(),
  ].filter(Boolean),
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  }
})
