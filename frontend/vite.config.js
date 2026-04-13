
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
    // Proxy configuration: route API and CSRF calls to the local backend
    // so the browser perceives same-origin requests and cookies are sent.
    // Keep options DRY and allow overriding the proxy target via env.
    proxy: (() => {
      const proxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
      const baseOptions = { target: proxyTarget, changeOrigin: true, secure: false };
      return {
        '/api': { ...baseOptions, ws: true },
        // CSRF token endpoint does not require WebSocket support; keep ws: false
        // to reduce the surface area and express intent clearly.
        '/csrf-token': { ...baseOptions, ws: false }
      };
    })(),
    // Optionally set cross-origin isolation headers used by certain APIs
    // (SharedArrayBuffer, performance.measureUserAgentSpecificMemory, etc.).
    // Enable in development by setting `VITE_ENABLE_COOP_COEP=true` if needed.
    ...(process.env.VITE_ENABLE_COOP_COEP === 'true' ? {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    } : {}),
  }
})
