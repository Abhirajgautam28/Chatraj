
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
    // Do not hardcode 'localhost' to preserve WSL/container/remote-dev workflows.
    // Allow overriding via env: VITE_DEV_HOST and VITE_HMR_HOST for special cases.
    host: process.env.VITE_DEV_HOST || undefined,
    hmr: {
      host: process.env.VITE_HMR_HOST || process.env.VITE_DEV_HOST || undefined,
      protocol: 'ws',
      clientPort: 5173
    },
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  }
})
